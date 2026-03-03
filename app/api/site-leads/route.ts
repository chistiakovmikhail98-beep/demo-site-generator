import { NextRequest, NextResponse } from 'next/server';
import { pool, getProjectIdBySlug, insertSiteLead, getSiteLeads } from '@/lib/db';
import { verifyJwt } from '@/lib/admin';

/**
 * POST /api/site-leads — Save a lead from quiz/footer on a client's site
 * GET  /api/site-leads?project_id=xxx — List leads (requires JWT auth)
 */

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, phone, source, quiz_answers, source_url, slug } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: 'Name and phone required' }, { status: 400 });
  }

  // Without DB, just acknowledge receipt
  if (!pool) {
    return NextResponse.json({ success: true, demo: true });
  }

  // Resolve project by slug
  let projectId: string | null = body.project_id || null;
  if (!projectId && slug) {
    projectId = await getProjectIdBySlug(slug);
  }

  const saved = await insertSiteLead({
    project_id: projectId,
    name,
    phone,
    source: source || 'footer',
    quiz_answers: quiz_answers || null,
    source_url: source_url || '',
  });

  return NextResponse.json({ success: true, saved });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');

  if (!projectId) {
    return NextResponse.json({ error: 'project_id required' }, { status: 400 });
  }

  // Verify JWT auth
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Without DB (local dev), return mock data
  if (!pool) {
    return NextResponse.json({
      leads: [
        { id: '1', name: 'Мария Иванова', phone: '+7 (999) 123-45-67', source: 'quiz', status: 'new', created_at: new Date(Date.now() - 3600000).toISOString(), quiz_answers: { step_0: 'Научиться танцевать', step_1: 'Полный ноль' } },
        { id: '2', name: 'Анна Петрова', phone: '+7 (916) 987-65-43', source: 'footer', status: 'new', created_at: new Date(Date.now() - 7200000).toISOString(), quiz_answers: null },
      ],
    });
  }

  // Verify JWT for production
  const payload = verifyJwt(token);
  if (!payload || payload.projectId !== projectId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const leads = await getSiteLeads(projectId);
  return NextResponse.json({ leads });
}
