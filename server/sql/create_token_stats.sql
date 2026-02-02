-- Таблица для хранения статистики использования токенов AI
-- Запустите этот SQL в Supabase SQL Editor

CREATE TABLE IF NOT EXISTS token_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  requests_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Уникальный индекс: одна запись на дату + модель
  UNIQUE(date, model)
);

-- Индекс для быстрой выборки по дате
CREATE INDEX IF NOT EXISTS idx_token_stats_date ON token_stats(date DESC);

-- Индекс для выборки по модели
CREATE INDEX IF NOT EXISTS idx_token_stats_model ON token_stats(model);

-- Комментарий к таблице
COMMENT ON TABLE token_stats IS 'Статистика использования AI токенов по дням и моделям';
