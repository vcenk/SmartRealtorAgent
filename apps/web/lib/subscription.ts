/**
 * Server-side subscription helpers.
 * Used by API routes to check plan limits before serving widgets or creating agents.
 */
import { createServiceSupabaseClient } from './supabase-server';
import { getPlanLimits, type PlanId } from './plans';

export interface Subscription {
  plan: PlanId;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
}

const DEFAULT_SUB: Subscription = {
  plan: 'starter',
  status: 'active',
  stripe_customer_id: null,
  stripe_subscription_id: null,
  current_period_end: null,
};

/** Get the subscription for a user. Returns starter defaults if none found. */
export async function getUserSubscription(userId: string): Promise<Subscription> {
  const supabase = createServiceSupabaseClient();
  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status, stripe_customer_id, stripe_subscription_id, current_period_end')
    .eq('user_id', userId)
    .single();

  if (!data) return DEFAULT_SUB;
  return data as Subscription;
}

/** Get the subscription for the owner of an agent (tenant). */
export async function getAgentOwnerSubscription(agentId: string): Promise<Subscription> {
  const supabase = createServiceSupabaseClient();
  const { data: tenant } = await supabase
    .from('tenants')
    .select('owner_id')
    .eq('id', agentId)
    .single();

  if (!tenant?.owner_id) return DEFAULT_SUB;
  return getUserSubscription(tenant.owner_id as string);
}

/** Check whether an agent's owner is allowed to publish widgets. */
export async function canAgentPublish(agentId: string): Promise<boolean> {
  const sub = await getAgentOwnerSubscription(agentId);
  if (sub.status !== 'active' && sub.status !== 'trialing') return false;
  return getPlanLimits(sub.plan).canPublish;
}
