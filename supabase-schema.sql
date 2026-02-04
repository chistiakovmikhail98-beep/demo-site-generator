-- =============================================
-- СХЕМА БД ДЛЯ DEMO SITE GENERATOR
-- Выполнить в Supabase SQL Editor
-- =============================================

-- Таблица проектов
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  niche TEXT NOT NULL DEFAULT 'stretching',
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  color_scheme JSONB,
  ai_model TEXT DEFAULT 'gpt4o-mini',
  font_family TEXT DEFAULT 'manrope',
  site_config JSONB,
  deployed_url TEXT,
  error TEXT,
  uploaded_files JSONB,
  -- VK данные для CRM
  vk_group_url TEXT,
  vk_admins JSONB,
  vk_contacts JSONB,  -- {phone, email, address, site}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Миграция: добавить новые поля если таблица уже существует
ALTER TABLE projects ADD COLUMN IF NOT EXISTS uploaded_files JSONB;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS vk_group_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS vk_admins JSONB;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS vk_contacts JSONB;

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);

-- Таблица картинок проектов
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other', -- gallery, instructor, hero, atmosphere, other
  label TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индекс для быстрого получения картинок проекта
CREATE INDEX IF NOT EXISTS idx_images_project ON images(project_id, order_index);

-- Функция автообновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для projects
DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- RLS (Row Level Security) - опционально
-- =============================================

-- Включаем RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Политики для анонимного доступа (для демо)
-- В продакшене лучше добавить аутентификацию

CREATE POLICY "Allow all access to projects" ON projects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to images" ON images
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- STORAGE BUCKET
-- =============================================

-- Создаётся через Supabase Dashboard:
-- 1. Перейти в Storage
-- 2. Создать bucket "project-images"
-- 3. Сделать его PUBLIC
-- 4. Добавить политику: Allow all uploads

-- Или через SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Политика для загрузки
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-images');

CREATE POLICY "Allow public deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'project-images');
