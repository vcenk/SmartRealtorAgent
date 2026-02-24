/**
 * GET  /api/settings?tenantId=xxx  — fetch agent settings
 * PUT  /api/settings               — update agent settings
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { verifyAgentOwnership, DEMO_AGENT } from '@/lib/auth-tenant';

const updateSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  botName: z.string().max(100).optional(),
  welcomeMessage: z.string().max(500).optional(),
  widgetTheme: z.enum(['dark', 'minimal', 'professional', 'glass']).optional(),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  maxTokens: z.number().min(128).max(2048).optional(),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const tenantId = request.nextUrl.searchParams.get('tenantId');
  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 });

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from('tenants')
    .select('id, name, website_url, bot_name, welcome_message, widget_theme, brand_color, updated_at')
    .eq('id', tenantId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { tenantId, name, websiteUrl, botName, welcomeMessage, widgetTheme, brandColor } = parsed.data;

  // Verify ownership (demo agent updates are allowed for backwards compatibility during onboarding)
  if (tenantId !== DEMO_AGENT) {
    const { isOwner } = await verifyAgentOwnership(request, tenantId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  }

  const supabase = createServiceSupabaseClient();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name !== undefined) updates.name = name;
  if (websiteUrl !== undefined) updates.website_url = websiteUrl || null;
  if (botName !== undefined) updates.bot_name = botName;
  if (welcomeMessage !== undefined) updates.welcome_message = welcomeMessage;
  if (widgetTheme !== undefined) updates.widget_theme = widgetTheme;
  if (brandColor !== undefined) updates.brand_color = brandColor;

  const { data, error } = await supabase
    .from('tenants')
    .update(updates)
    .eq('id', tenantId)
    .select('id, name, widget_theme, brand_color, updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
