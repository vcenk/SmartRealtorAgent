/**
 * GET    /api/agents/[id] - Get agent by ID (verify ownership)
 * PUT    /api/agents/[id] - Update agent settings
 * DELETE /api/agents/[id] - Delete agent and all data
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { getUserInfo } from '@/lib/auth-tenant';

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  botName: z.string().max(100).optional(),
  welcomeMessage: z.string().max(500).optional(),
  widgetTheme: z.enum(['dark', 'minimal', 'professional', 'glass']).optional(),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

async function verifyOwnership(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  agentId: string,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('tenants')
    .select('owner_id')
    .eq('id', agentId)
    .single();

  return data?.owner_id === userId;
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { id } = await context.params;
  const { userId } = await getUserInfo(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();

  // Verify ownership
  const isOwner = await verifyOwnership(supabase, id, userId);
  if (!isOwner) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('tenants')
    .select('id, name, website_url, bot_name, welcome_message, widget_theme, brand_color, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { id } = await context.params;
  const { userId } = await getUserInfo(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const supabase = createServiceSupabaseClient();

  // Verify ownership
  const isOwner = await verifyOwnership(supabase, id, userId);
  if (!isOwner) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  const { name, websiteUrl, botName, welcomeMessage, widgetTheme, brandColor } = parsed.data;
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
    .eq('id', id)
    .select('id, name, website_url, bot_name, welcome_message, widget_theme, brand_color, updated_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { id } = await context.params;
  const { userId } = await getUserInfo(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();

  // Verify ownership
  const isOwner = await verifyOwnership(supabase, id, userId);
  if (!isOwner) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // Delete all related data in order (due to foreign key constraints)
  // 1. Delete knowledge chunks
  await supabase.from('knowledge_chunks').delete().eq('tenant_id', id);

  // 2. Delete knowledge sources
  await supabase.from('knowledge_sources').delete().eq('tenant_id', id);

  // 3. Delete messages
  await supabase.from('messages').delete().eq('tenant_id', id);

  // 4. Delete conversations
  await supabase.from('conversations').delete().eq('tenant_id', id);

  // 5. Delete leads
  await supabase.from('leads').delete().eq('tenant_id', id);

  // 6. Delete skill audit logs
  await supabase.from('skill_audit_logs').delete().eq('tenant_id', id);

  // 7. Finally delete the agent (tenant)
  const { error } = await supabase.from('tenants').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
