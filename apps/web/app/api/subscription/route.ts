/**
 * GET /api/subscription
 * Returns the current user's subscription info and plan limits.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo } from '@/lib/auth-tenant';
import { getUserSubscription } from '@/lib/subscription';
import { getPlanLimits } from '@/lib/plans';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { userId } = await getUserInfo(request);
  if (!userId) {
    // Return starter defaults for unauthenticated users
    return NextResponse.json({
      plan: 'starter',
      status: 'active',
      limits: getPlanLimits('starter'),
      hasStripe: false,
    });
  }

  const sub = await getUserSubscription(userId);
  const limits = getPlanLimits(sub.plan);

  return NextResponse.json({
    plan: sub.plan,
    status: sub.status,
    limits,
    hasStripe: !!sub.stripe_customer_id,
    currentPeriodEnd: sub.current_period_end,
  });
}
