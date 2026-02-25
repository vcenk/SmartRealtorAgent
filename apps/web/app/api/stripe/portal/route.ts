/**
 * POST /api/stripe/portal
 * Creates a Stripe Customer Portal session so users can manage billing.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getUserInfo } from '@/lib/auth-tenant';
import { getUserSubscription } from '@/lib/subscription';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { userId } = await getUserInfo(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sub = await getUserSubscription(userId);
  if (!sub.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 400 });
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${appUrl}/settings`,
  });

  return NextResponse.json({ url: session.url });
}
