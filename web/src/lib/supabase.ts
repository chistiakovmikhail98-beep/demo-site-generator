import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Загрузка картинки из буфера обмена или файла
export async function uploadImage(
  projectId: string,
  file: File | Blob,
  filename?: string
): Promise<string> {
  const name = filename || `paste-${Date.now()}.png`;
  const path = `${projectId}/${Date.now()}-${name}`;

  const { error } = await supabase.storage
    .from('project-images')
    .upload(path, file, {
      contentType: file.type || 'image/png',
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from('project-images')
    .getPublicUrl(path);

  return data.publicUrl;
}

// Удаление картинки
export async function deleteImage(url: string): Promise<void> {
  const match = url.match(/project-images\/(.+)$/);
  if (match) {
    await supabase.storage.from('project-images').remove([match[1]]);
  }
}
