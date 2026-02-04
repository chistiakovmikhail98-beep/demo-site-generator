"""
Screencast Generator - записывает видео прокрутки сайтов
Вставь URL-ы, нажми Enter и занимайся своими делами.

Установка:
  pip install playwright
  playwright install chromium

  FFmpeg (для MP4):
  Windows: скачай с https://ffmpeg.org/download.html и добавь в PATH
  Или: winget install ffmpeg

Запуск:
  python screencast.py
"""

import asyncio
import os
import random
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("❌ Playwright не установлен!")
    print("   Выполни: pip install playwright && playwright install chromium")
    sys.exit(1)


# === НАСТРОЙКИ ===
WIDTH = 1920        # Ширина видео (Full HD)
HEIGHT = 1080       # Высота видео (Full HD)
SCROLL_DURATION = 24  # Секунд на прокрутку (было 30, теперь на 20% быстрее)
FPS = 60            # Частота скролла (60 = супер-плавно)
TRIM_START = 2      # Обрезать начало видео (секунды) - небольшая пауза
INTERACTIVE = True  # Прокликивать квиз и калькулятор
OUTPUT_DIR = Path(__file__).parent / "videos"
OUTPUT_FORMAT = "mp4"  # mp4 или webm


def check_ffmpeg() -> bool:
    """Проверяет наличие FFmpeg"""
    return shutil.which("ffmpeg") is not None


def convert_to_mp4(webm_path: Path, mp4_path: Path, trim_start: float = 0) -> bool:
    """Конвертирует WebM в MP4, опционально обрезая начало"""
    try:
        cmd = ["ffmpeg", "-y", "-i", str(webm_path)]  # -y = перезаписывать

        # Обрезаем начало если указано (после -i для точности)
        if trim_start > 0:
            cmd.extend(["-ss", str(trim_start)])

        cmd.extend([
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "23",
            "-c:a", "aac",
            "-movflags", "+faststart",
            str(mp4_path)
        ])

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode == 0:
            # Удаляем исходный webm
            webm_path.unlink()
            return True
        else:
            print(f"      FFmpeg ошибка: {result.stderr[:200]}")
            return False
    except Exception as e:
        print(f"      Ошибка конвертации: {e}")
        return False


def extract_name_from_url(url: str) -> str:
    """Извлекает имя сайта из URL для названия файла"""
    # https://demo-kairit.vercel.app -> kairit
    match = re.search(r'demo-([^.]+)\.vercel\.app', url)
    if match:
        return match.group(1)

    # Fallback - берём домен
    match = re.search(r'https?://([^/]+)', url)
    if match:
        domain = match.group(1).replace('.', '-')
        return domain[:30]  # Ограничиваем длину

    return f"site-{datetime.now().strftime('%H%M%S')}"


async def interact_with_quiz(page) -> bool:
    """Прокликивает квиз - выбирает случайные ответы"""
    try:
        quiz = await page.query_selector("#quiz")
        if not quiz:
            return False

        print(f"   🎯 Прохожу квиз...")

        # Скроллим к квизу
        await page.evaluate("document.querySelector('#quiz').scrollIntoView({behavior: 'smooth', block: 'center'})")
        await asyncio.sleep(1)

        # Проходим все шаги квиза
        for step in range(5):  # Максимум 5 вопросов
            await asyncio.sleep(0.8)

            # Ищем кнопки вариантов ответа (не кнопку "Далее" или "Получить")
            buttons = await page.query_selector_all("#quiz button:not([type='submit'])")

            # Фильтруем - только видимые кнопки с вариантами
            clickable = []
            for btn in buttons:
                is_visible = await btn.is_visible()
                text = await btn.inner_text()
                # Исключаем служебные кнопки
                if is_visible and text and not any(x in text.lower() for x in ['далее', 'получить', 'назад', 'отправить']):
                    clickable.append(btn)

            if not clickable:
                # Может быть это финальный экран с формой
                break

            # Кликаем на случайный вариант
            btn = random.choice(clickable) if len(clickable) > 1 else clickable[0]
            await btn.click()
            await asyncio.sleep(0.5)

        print(f"   ✅ Квиз пройден")
        return True

    except Exception as e:
        print(f"   ⚠️ Квиз не найден или ошибка: {e}")
        return False


async def interact_with_calculator(page) -> bool:
    """Кликает по ползункам калькулятора по координатам"""
    try:
        calc = await page.query_selector("#calculator")
        if not calc:
            return False

        print(f"   🧮 Работаю с калькулятором...")

        # Скроллим к калькулятору и получаем его координаты
        await page.evaluate("document.querySelector('#calculator').scrollIntoView({behavior: 'smooth', block: 'center'})")
        await asyncio.sleep(1)

        # Получаем размеры калькулятора
        box = await calc.bounding_box()
        if not box:
            print(f"   ⚠️ Калькулятор: не удалось получить координаты")
            return False

        # Ползунки обычно в левой части калькулятора (примерно 40% ширины)
        # Первый ползунок примерно на 30% высоты, второй на 60%
        slider_positions = [
            (0.25, 0.30),  # Первый ползунок - клик вправо
            (0.35, 0.30),  # Первый ползунок - ещё правее
            (0.25, 0.55),  # Второй ползунок - клик вправо
            (0.35, 0.55),  # Второй ползунок - ещё правее
        ]

        clicked = 0
        for (x_pct, y_pct) in slider_positions:
            x = box['x'] + box['width'] * x_pct
            y = box['y'] + box['height'] * y_pct

            await page.mouse.click(x, y)
            clicked += 1
            await asyncio.sleep(0.4)

            if clicked >= 3:
                break

        print(f"   ✅ Калькулятор: {clicked} клика по координатам")
        return True

    except Exception as e:
        print(f"   ⚠️ Калькулятор: {e}")
        return False


async def record_screencast(url: str, output_path: Path) -> bool:
    """Записывает видео прокрутки сайта"""
    print(f"\n📹 Записываю: {url}")

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)

            # === ШАГ 1: Pre-loading БЕЗ записи ===
            print(f"   ⏳ Загрузка и pre-loading...")
            preload_context = await browser.new_context(
                viewport={"width": WIDTH, "height": HEIGHT}
            )
            preload_page = await preload_context.new_page()
            await preload_page.goto(url, wait_until="networkidle", timeout=60000)
            await preload_page.wait_for_load_state("domcontentloaded")

            # Прокручиваем для lazy-load
            await preload_page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(1)
            await preload_page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(1)

            await preload_context.close()

            # === ШАГ 2: Запись видео ===
            print(f"   🎬 Начинаю запись...")
            context = await browser.new_context(
                viewport={"width": WIDTH, "height": HEIGHT},
                record_video_dir=str(output_path.parent),
                record_video_size={"width": WIDTH, "height": HEIGHT}
            )

            page = await context.new_page()

            # Загружаем страницу (уже в кэше браузера - быстро)
            await page.goto(url, wait_until="networkidle", timeout=60000)
            await asyncio.sleep(1)  # Небольшая пауза для стабильности

            # Получаем высоту страницы
            scroll_height = await page.evaluate("document.body.scrollHeight")
            viewport_height = HEIGHT
            total_scroll = scroll_height - viewport_height

            # Включаем плавный CSS скролл на странице
            await page.evaluate("""
                document.documentElement.style.scrollBehavior = 'smooth';
                document.body.style.scrollBehavior = 'smooth';
            """)

            # Находим позиции интерактивных элементов
            quiz_pos = None
            calc_pos = None
            quiz_done = False
            calc_done = False

            if INTERACTIVE:
                # Позиция квиза
                quiz_pos = await page.evaluate("""
                    (() => {
                        const el = document.querySelector('#quiz');
                        return el ? el.getBoundingClientRect().top + window.scrollY - 200 : null;
                    })()
                """)

                # Позиция калькулятора
                calc_pos = await page.evaluate("""
                    (() => {
                        const el = document.querySelector('#calculator');
                        return el ? el.getBoundingClientRect().top + window.scrollY - 200 : null;
                    })()
                """)

            # Плавный скролл через колёсико мыши
            print(f"   🎬 Записываю прокрутку ({SCROLL_DURATION} сек)...")

            # Используем mouse.wheel() - симуляция настоящего колёсика
            # Делаем много маленьких прокруток для плавности
            total_frames = SCROLL_DURATION * FPS
            pixels_per_frame = total_scroll / total_frames
            frame_delay = 1.0 / FPS

            # Позиционируем мышь в центре экрана
            await page.mouse.move(WIDTH // 2, HEIGHT // 2)

            current_scroll = 0
            for i in range(int(total_frames)):
                # Easing: только плавное торможение в конце (старт быстрый)
                progress = i / total_frames
                if progress > 0.9:
                    # Плавное торможение
                    speed_mult = (1 - progress) / 0.1
                else:
                    speed_mult = 1.0

                delta = pixels_per_frame * speed_mult * 1.25  # Компенсация замедления
                if delta > 0.5:  # Минимальный порог
                    await page.mouse.wheel(0, delta)
                    current_scroll += delta
                await asyncio.sleep(frame_delay)

                # Проверяем нужно ли взаимодействовать с элементами
                if INTERACTIVE:
                    # Квиз
                    if quiz_pos and not quiz_done and current_scroll >= quiz_pos:
                        quiz_done = True
                        await interact_with_quiz(page)
                        await page.mouse.move(WIDTH // 2, HEIGHT // 2)

                    # Калькулятор
                    if calc_pos and not calc_done and current_scroll >= calc_pos:
                        calc_done = True
                        await interact_with_calculator(page)
                        await page.mouse.move(WIDTH // 2, HEIGHT // 2)

            # Пауза в конце
            await asyncio.sleep(1)

            # Закрываем и сохраняем видео
            video_path = await page.video.path()
            await context.close()
            await browser.close()

            # Переименовываем видео
            if video_path and os.path.exists(video_path):
                webm_path = output_path.with_suffix(".webm")
                os.rename(video_path, webm_path)

                # Конвертируем в MP4 если нужно
                if OUTPUT_FORMAT == "mp4" and check_ffmpeg():
                    mp4_path = output_path.with_suffix(".mp4")
                    print(f"   🔄 Конвертирую в MP4 (обрезаю {TRIM_START} сек с начала)...")
                    if convert_to_mp4(webm_path, mp4_path, TRIM_START):
                        print(f"   ✅ Сохранено: {mp4_path.name}")
                        return True
                    else:
                        print(f"   ⚠️ Конвертация не удалась, оставляю WebM")
                        print(f"   ✅ Сохранено: {webm_path.name}")
                        return True
                else:
                    if OUTPUT_FORMAT == "mp4":
                        print(f"   ⚠️ FFmpeg не найден, сохраняю как WebM")
                    print(f"   ✅ Сохранено: {webm_path.name}")
                    return True
            else:
                print(f"   ❌ Видео не создано")
                return False

    except Exception as e:
        print(f"   ❌ Ошибка: {e}")
        return False


async def main():
    ffmpeg_ok = check_ffmpeg()
    format_info = "MP4" if (OUTPUT_FORMAT == "mp4" and ffmpeg_ok) else "WebM"

    print(f"""
╔═══════════════════════════════════════════════════════════╗
║          🎬 SCREENCAST GENERATOR                          ║
║                                                           ║
║  Вставь URL-ы сайтов (каждый с новой строки)             ║
║  Когда закончишь - введи пустую строку и нажми Enter     ║
╠═══════════════════════════════════════════════════════════╣
║  📐 Разрешение: {WIDTH}x{HEIGHT} (Full HD)                    ║
║  ⏱️  Прокрутка: {SCROLL_DURATION} сек | Обрезка: {TRIM_START} сек               ║
║  🎯 Интерактив: {'Квиз + Калькулятор' if INTERACTIVE else 'Выкл'}              ║
║  🎞️  Формат: {format_info}  {'✅ FFmpeg' if ffmpeg_ok else '❌ FFmpeg'}
╚═══════════════════════════════════════════════════════════╝
    """)

    # Собираем URL-ы
    urls = []
    print("Вставляй URL-ы (пустая строка = начать запись):\n")

    while True:
        try:
            line = input().strip()
            if not line:
                break
            if line.startswith("http"):
                urls.append(line)
                print(f"   ✓ Добавлен: {line}")
        except EOFError:
            break

    if not urls:
        print("\n❌ Не введено ни одного URL")
        return

    # Создаём папку для видео
    OUTPUT_DIR.mkdir(exist_ok=True)

    print(f"\n{'='*50}")
    print(f"📋 Всего сайтов: {len(urls)}")
    print(f"📁 Папка: {OUTPUT_DIR}")
    print(f"⏱️  Примерное время: ~{len(urls) * (SCROLL_DURATION + 10)} сек")
    print(f"{'='*50}")
    print("\n🚀 Начинаю запись... Можешь заниматься своими делами!\n")

    # Записываем видео для каждого сайта
    success = 0
    failed = 0

    for i, url in enumerate(urls, 1):
        print(f"\n[{i}/{len(urls)}]", end="")

        name = extract_name_from_url(url)
        output_path = OUTPUT_DIR / f"{name}.webm"

        if await record_screencast(url, output_path):
            success += 1
        else:
            failed += 1

    # Итоги
    print(f"\n{'='*50}")
    print(f"🎉 ГОТОВО!")
    print(f"   ✅ Успешно: {success}")
    if failed:
        print(f"   ❌ Ошибок: {failed}")
    print(f"   📁 Видео в папке: {OUTPUT_DIR}")
    print(f"{'='*50}\n")

    # Открываем папку с видео (Windows)
    if sys.platform == "win32":
        os.startfile(OUTPUT_DIR)


if __name__ == "__main__":
    asyncio.run(main())
