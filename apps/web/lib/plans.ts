/**
 * Plan definitions and limits.
 *
 * "publish" = serving the widget on an external website.
 * Starter users can create agents and test in the dashboard, but cannot publish.
 */

export type PlanId = 'starter' | 'growth' | 'enterprise';

export interface PlanLimits {
  maxAgents: number;
  canPublish: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  starter: {
    maxAgents: 1,
    canPublish: false,
  },
  growth: {
    maxAgents: 10,
    canPublish: true,
  },
  enterprise: {
    maxAgents: Infinity,
    canPublish: true,
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan as PlanId] ?? PLAN_LIMITS.starter;
}
