/**
 * Shared authorization helper for API routes.
 *
 * Provides a reusable requireTenantOwnership() function that:
 * - Verifies user authentication via JWT token
 * - Checks tenant ownership using existing verifyAgentOwnership()
 * - Returns pre-built 401/403 responses on failure
 * - Supports allowDemo option for demo agent access
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyAgentOwnership, DEMO_TENANT, getUserInfo } from './auth-tenant';

export type AuthResult =
  | { authorized: true; userId: string }
  | { authorized: false; response: NextResponse };

export type RequireTenantOwnershipOptions = {
  /** Allow access to demo tenant without authentication */
  allowDemo?: boolean;
};

/**
 * Verify that the current user owns the specified tenant/agent.
 *
 * @param request - The incoming request
 * @param tenantId - The tenant ID to verify ownership of
 * @param options - Optional configuration
 * @returns AuthResult with either authorized=true and userId, or authorized=false and a response
 *
 * @example
 * ```typescript
 * const auth = await requireTenantOwnership(request, tenantId, { allowDemo: true });
 * if (!auth.authorized) return auth.response;
 * // auth.userId is now available
 * ```
 */
export async function requireTenantOwnership(
  request: NextRequest,
  tenantId: string,
  options?: RequireTenantOwnershipOptions,
): Promise<AuthResult> {
  const { allowDemo = false } = options ?? {};

  // Allow demo tenant access if option is enabled
  if (allowDemo && tenantId === DEMO_TENANT) {
    // For demo tenant, we don't require authentication
    const { userId } = await getUserInfo(request);
    return { authorized: true, userId: userId ?? 'demo' };
  }

  // Verify ownership
  const { isOwner, userId } = await verifyAgentOwnership(request, tenantId);

  // No authenticated user
  if (!userId) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      ),
    };
  }

  // User is authenticated but doesn't own this tenant
  if (!isOwner) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Access denied' },
        { status: 403 },
      ),
    };
  }

  return { authorized: true, userId };
}
