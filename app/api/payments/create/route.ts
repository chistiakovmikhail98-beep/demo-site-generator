import { NextRequest, NextResponse } from 'next/server';
import { pool, queryOne } from '@/lib/db';
import { nanoid } from '@/lib/utils';
import { PLANS } from '@/lib/payments';

export async function POST(request: NextRequest) {
  if (!pool) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const { slug, plan: planId, email } = await request.json();

    if (!slug || !planId) {
      return NextResponse.json({ error: 'Missing slug or plan' }, { status: 400 });
    }

    const plan = PLANS.find(p => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });
    }

    // Find the project
    const project = await queryOne<{ id: string; name: string }>(
      `SELECT id, name FROM projects WHERE slug = $1`,
      [slug]
    );
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const orderId = nanoid(12);

    // Create order record
    await pool.query(
      `INSERT INTO orders (id, project_id, email, plan, amount, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW())`,
      [orderId, project.id, email || '', planId, plan.price * 100]
    );

    // TODO: Integrate real YooKassa payment
    // For now: auto-activate (demo mode)
    const isDemo = !process.env.YOOKASSA_SHOP_ID;

    if (isDemo) {
      // Demo: activate immediately
      await activateProject(project.id, orderId, planId, plan.period);
      return NextResponse.json({
        orderId,
        status: 'paid',
        message: 'Оплата успешна (демо-режим)',
      });
    }

    // Real YooKassa integration would go here
    // const payment = await createYooKassaPayment(...)
    // return NextResponse.json({ orderId, confirmationUrl: payment.confirmation.confirmation_url });

    return NextResponse.json({ error: 'Payment provider not configured' }, { status: 503 });
  } catch (err) {
    console.error('[payments/create] error:', err);
    return NextResponse.json({ error: 'Ошибка создания платежа' }, { status: 500 });
  }
}

async function activateProject(projectId: string, orderId: string, plan: string, periodDays: number) {
  if (!pool) return;

  const now = new Date();
  const endsAt = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

  // Update order
  await pool.query(
    `UPDATE orders SET status = 'paid', paid_at = NOW() WHERE id = $1`,
    [orderId]
  );

  // Update project status
  await pool.query(
    `UPDATE projects SET status = 'completed', updated_at = NOW() WHERE id = $1`,
    [projectId]
  );

  // Create subscription
  await pool.query(
    `INSERT INTO subscriptions (id, project_id, plan, status, starts_at, ends_at, created_at)
     VALUES ($1, $2, $3, 'active', $4, $5, NOW())
     ON CONFLICT (project_id) DO UPDATE SET plan = $3, status = 'active', starts_at = $4, ends_at = $5`,
    [nanoid(10), projectId, plan, now.toISOString(), endsAt.toISOString()]
  );
}
