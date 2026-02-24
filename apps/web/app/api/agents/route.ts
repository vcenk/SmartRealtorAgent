/**
 * GET  /api/agents - List agents owned by current user
 * POST /api/agents - Create new agent
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { getUserInfo } from '@/lib/auth-tenant';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  websiteUrl: z.string().url().optional().or(z.literal('')),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { userId } = await getUserInfo(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from('tenants')
    .select('id, name, website_url, bot_name, widget_theme, brand_color, created_at, updated_at')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
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

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { name, websiteUrl } = parsed.data;
  const supabase = createServiceSupabaseClient();

  // Create the new agent
  const { data, error } = await supabase
    .from('tenants')
    .insert({
      name,
      website_url: websiteUrl || null,
      owner_id: userId,
      bot_name: 'Smart Realtor Agent',
      welcome_message: "Hi! I'm your AI real estate assistant. Ask me anything about listings, neighborhoods, or getting started.",
      widget_theme: 'dark',
      brand_color: '#7c3aed',
    })
    .select('id, name, website_url, bot_name, widget_theme, brand_color, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
