/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout session for plan upgrade.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';
import { getUserInfo } from '@/lib/auth-tenant';
import { getUserSubscription } from '@/lib/subscription';
import { createServiceSupabaseClient } from '@/lib/supabase-server';

const bodySchema = z.object({
  plan: z.enum(['growth', 'enterprise']),
});

/** Map plan name → Stripe Price ID (set in env) */
function getPriceId(plan: string): string | null {
  if (plan === 'growth') return process.env.STRIPE_GROWTH_PRICE_ID ?? null;
  if (plan === 'enterprise') return process.env.STRIPE_ENTERPRISE_PRICE_ID ?? null;
  return null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { userId, email } = await getUserInfo(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const priceId = getPriceId(parsed.data.plan);
  if (!priceId) {
    return NextResponse.json({ error: 'Plan not configured' }, { status: 400 });
  }

  const stripe = getStripe();
  const sub = await getUserSubscription(userId);

  // Reuse existing Stripe customer or create one
  let customerId = sub.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: email ?? undefined,
      metadata: { user_id: userId },
    });
    customerId = customer.id;

    // Persist customer ID
    const supabase = createServiceSupabaseClient();
    await supabase
      .from('subscriptions')
      .upsert({ user_id: userId, stripe_customer_id: customerId }, { onConflict: 'user_id' });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/agents?upgraded=1`,
    cancel_url: `${appUrl}/agents`,
    subscription_data: {
      metadata: { user_id: userId, plan: parsed.data.plan },
    },
  });

  return NextResponse.json({ url: session.url });
}
