import { NextRequest, NextResponse } from 'next/server';
import { pool, queryOne } from '@/lib/db';
import { nanoid } from '@/lib/utils';

/**
 * YooKassa webhook endpoint.
 * Called by YooKassa when payment status changes.
 * TODO: Implement when YooKassa is configured.
 */
export async function POST(request: NextRequest) {
  if (!pool) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const event = body.event;
    const paymentObj = body.object;

    if (event === 'payment.succeeded' && paymentObj?.metadata?.orderId) {
      const orderId = paymentObj.metadata.orderId;

      // Find the order
      const order = await queryOne<{ id: string; project_id: string; plan: string }>(
        `SELECT id, project_id, plan FROM orders WHERE id = $1 AND status = 'pending'`,
        [orderId]
      );

      if (order) {
        const periodDays = order.plan === 'yearly' ? 365 : 30;
        const now = new Date();
        const endsAt = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

        // Update order
        await pool.query(
          `UPDATE orders SET status = 'paid', yookassa_id = $2, paid_at = NOW() WHERE id = $1`,
          [orderId, paymentObj.id]
        );

        // Activate project
        await pool.query(
          `UPDATE projects SET status = 'completed', updated_at = NOW() WHERE id = $1`,
          [order.project_id]
        );

        // Create subscription
        await pool.query(
          `INSERT INTO subscriptions (id, project_id, plan, status, starts_at, ends_at, created_at)
           VALUES ($1, $2, $3, 'active', $4, $5, NOW())
           ON CONFLICT (project_id) DO UPDATE SET plan = $3, status = 'active', starts_at = $4, ends_at = $5`,
          [nanoid(10), order.project_id, order.plan, now.toISOString(), endsAt.toISOString()]
        );
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('[payments/webhook] error:', err);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
