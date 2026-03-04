import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/var/www/fitwebai/uploads';
const UPLOAD_SECRET = process.env.UPLOAD_SECRET || 'fitwebai-upload-2026';

export async function POST(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${UPLOAD_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('projectId') as string | null;
    const filename = formData.get('filename') as string | null;

    if (!file || !projectId || !filename) {
      return NextResponse.json({ error: 'Missing file, projectId or filename' }, { status: 400 });
    }

    // Sanitize
    const safeProjectId = projectId.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

    const dir = path.join(UPLOADS_DIR, safeProjectId);
    await fs.promises.mkdir(dir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(dir, safeFilename);
    await fs.promises.writeFile(filePath, buffer);

    const domain = process.env.SITE_DOMAIN || 'fitwebai.ru';
    const url = `https://${domain}/uploads/${safeProjectId}/${safeFilename}`;

    return NextResponse.json({ url, size: buffer.length });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
