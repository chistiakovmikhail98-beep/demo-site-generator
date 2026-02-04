/**
 * QueueManager - менеджер очереди для пакетной обработки сайтов
 *
 * Особенности:
 * - Persistent queue (хранится в Supabase, переживает рестарты)
 * - Последовательная обработка (один сайт за раз)
 * - Auto-retry при ошибках (до 3 попыток)
 * - Graceful shutdown
 */

import {
  DbQueueItem,
  QueueStats,
  addQueueBatch,
  getNextQueueItem,
  completeQueueItem,
  failQueueItem,
  getQueueStats,
  getBatchStats,
  retryFailedItems,
  getCurrentProcessingItem,
  resetStuckProcessingItems,
} from './supabase.js';

// Типы событий очереди
type QueueEventType = 'item_started' | 'item_completed' | 'item_failed' | 'batch_completed' | 'queue_empty';

interface QueueEvent {
  type: QueueEventType;
  item?: DbQueueItem;
  batchId?: string;
  stats?: QueueStats;
  error?: string;
}

type QueueEventHandler = (event: QueueEvent) => void;

// Обработчик одного элемента очереди
type ItemProcessor = (item: DbQueueItem) => Promise<string>; // Возвращает projectId

class QueueManager {
  private isRunning = false;
  private isPaused = false;
  private processor: ItemProcessor | null = null;
  private eventHandlers: QueueEventHandler[] = [];
  private currentItem: DbQueueItem | null = null;
  private processingPromise: Promise<void> | null = null;

  /**
   * Регистрирует обработчик элементов очереди
   */
  setProcessor(processor: ItemProcessor): void {
    this.processor = processor;
  }

  /**
   * Подписка на события очереди
   */
  onEvent(handler: QueueEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      this.eventHandlers = this.eventHandlers.filter(h => h !== handler);
    };
  }

  private emit(event: QueueEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (err) {
        console.error('❌ Queue event handler error:', err);
      }
    }
  }

  /**
   * Добавляет пакет VK URL в очередь
   */
  async addBatch(
    vkUrls: string[],
    options: DbQueueItem['options'] = {}
  ): Promise<{ batchId: string; itemCount: number }> {
    const result = await addQueueBatch(vkUrls, options);
    console.log(`📦 Добавлен batch ${result.batchId}: ${result.itemCount} элементов`);

    // Если очередь не запущена - запускаем
    if (!this.isRunning && !this.isPaused) {
      this.start();
    }

    return result;
  }

  /**
   * Запускает обработку очереди
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️ Queue already running');
      return;
    }

    if (!this.processor) {
      throw new Error('Processor not set. Call setProcessor() first.');
    }

    this.isRunning = true;
    this.isPaused = false;
    console.log('🚀 Queue started');

    // Запускаем обработку в фоне
    this.processingPromise = this.processLoop();
  }

  /**
   * Ставит очередь на паузу (текущий элемент дообрабатывается)
   */
  pause(): void {
    this.isPaused = true;
    console.log('⏸️ Queue paused');
  }

  /**
   * Возобновляет обработку
   */
  resume(): void {
    if (!this.isPaused) return;

    this.isPaused = false;
    console.log('▶️ Queue resumed');

    // Если очередь остановлена - перезапускаем
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Полностью останавливает очередь
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    this.isPaused = false;

    if (this.processingPromise) {
      await this.processingPromise;
    }

    console.log('🛑 Queue stopped');
  }

  /**
   * Graceful shutdown - ждём завершения текущего элемента
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Queue shutting down gracefully...');
    this.isRunning = false;

    if (this.processingPromise) {
      await this.processingPromise;
    }

    console.log('✅ Queue shutdown complete');
  }

  /**
   * Возвращает текущий статус очереди
   */
  async getStatus(): Promise<{
    isRunning: boolean;
    isPaused: boolean;
    currentItem: DbQueueItem | null;
    stats: QueueStats;
  }> {
    const stats = await getQueueStats();
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentItem: this.currentItem,
      stats,
    };
  }

  /**
   * Возвращает статус конкретного batch
   */
  async getBatchStatus(batchId: string) {
    return getBatchStats(batchId);
  }

  /**
   * Retry failed элементов
   */
  async retryFailed(batchId?: string): Promise<number> {
    const count = await retryFailedItems(batchId);
    console.log(`🔄 ${count} элементов помечены для retry`);

    // Перезапускаем очередь если нужно
    if (count > 0 && !this.isRunning && !this.isPaused) {
      this.start();
    }

    return count;
  }

  /**
   * Восстановление после краша - сбрасывает зависшие processing элементы
   */
  async recover(): Promise<number> {
    const count = await resetStuckProcessingItems(30); // 30 минут
    if (count > 0) {
      console.log(`🔄 Восстановлено ${count} зависших элементов`);
    }
    return count;
  }

  /**
   * Основной цикл обработки
   */
  private async processLoop(): Promise<void> {
    while (this.isRunning) {
      // Проверяем паузу
      if (this.isPaused) {
        await this.sleep(1000);
        continue;
      }

      try {
        // Получаем следующий элемент
        const item = await getNextQueueItem();

        if (!item) {
          // Очередь пуста
          this.emit({ type: 'queue_empty' });
          this.isRunning = false;
          console.log('📭 Queue empty, stopping');
          break;
        }

        this.currentItem = item;
        console.log(`\n🔄 Processing: ${item.vk_url}`);
        this.emit({ type: 'item_started', item });

        try {
          // Обрабатываем элемент
          const projectId = await this.processor!(item);

          // Успех!
          await completeQueueItem(item.id, projectId);
          console.log(`✅ Completed: ${item.vk_url} -> ${projectId}`);
          this.emit({ type: 'item_completed', item: { ...item, project_id: projectId } });

          // Проверяем завершение batch
          if (item.batch_id) {
            const batchStats = await getBatchStats(item.batch_id);
            if (batchStats.pending === 0 && batchStats.processing === 0) {
              this.emit({ type: 'batch_completed', batchId: item.batch_id, stats: batchStats });
            }
          }

        } catch (err) {
          // Ошибка обработки
          const errorMessage = err instanceof Error ? err.message : String(err);
          const newRetryCount = item.retry_count + 1;

          if (newRetryCount < item.max_retries) {
            // Можно retry - возвращаем в pending
            console.log(`⚠️ Error (retry ${newRetryCount}/${item.max_retries}): ${errorMessage}`);
            await failQueueItem(item.id, errorMessage, newRetryCount);
            // TODO: можно сделать exponential backoff
          } else {
            // Исчерпаны попытки
            console.log(`❌ Failed permanently: ${errorMessage}`);
            await failQueueItem(item.id, errorMessage, newRetryCount);
          }

          this.emit({ type: 'item_failed', item, error: errorMessage });
        }

        this.currentItem = null;

        // Небольшая пауза между элементами (GC, rate limits)
        await this.sleep(2000);

      } catch (err) {
        console.error('❌ Queue loop error:', err);
        await this.sleep(5000);
      }
    }

    this.currentItem = null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const queueManager = new QueueManager();

// Export types
export type { QueueEvent, QueueEventType, QueueEventHandler, ItemProcessor };
