/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events to keep subscriptions in sync.
 */
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import type { PlanId } from '@/lib/plans';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown';
    return NextResponse.json({ error: `Webhook verification failed: ${msg}` }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata.user_id;
      if (!userId) break;

      const plan = (sub.metadata.plan ?? 'starter') as PlanId;
      const status = mapStatus(sub.status);

      // In Stripe v20+ period dates live on subscription items
      const firstItem = sub.items?.data?.[0];
      const periodStart = firstItem?.current_period_start;
      const periodEnd = firstItem?.current_period_end;

      await supabase
        .from('subscriptions')
        .upsert(
          {
            user_id: userId,
            plan,
            status,
            stripe_customer_id: sub.customer as string,
            stripe_subscription_id: sub.id,
            current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
            current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata.user_id;
      if (!userId) break;

      // Downgrade to starter
      await supabase
        .from('subscriptions')
        .update({
          plan: 'starter',
          status: 'canceled',
          stripe_subscription_id: null,
          current_period_start: null,
          current_period_end: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      break;
    }

    default:
      // Unhandled event type — acknowledge
      break;
  }

  return NextResponse.json({ received: true });
}

function mapStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active': return 'active';
    case 'trialing': return 'trialing';
    case 'past_due': return 'past_due';
    case 'incomplete': return 'incomplete';
    default: return 'canceled';
  }
}
