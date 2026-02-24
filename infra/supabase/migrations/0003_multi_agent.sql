-- Multi-Agent Architecture Migration
-- Enables users to create multiple AI agents (bots), each with their own knowledge base and configuration.

-- 1. Add owner_id to tenants (agents are owned by users)
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Create index for faster lookups by owner
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON public.tenants(owner_id);

-- 3. Create auto-profile trigger for new users
-- When a user signs up, they get a profile linked to the demo tenant initially
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, tenant_id, role)
  VALUES (NEW.id, '11111111-1111-1111-1111-111111111111', 'agent')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Enable RLS on tenants if not already enabled
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "users_manage_own_agents" ON public.tenants;
DROP POLICY IF EXISTS "public_read_demo_agent" ON public.tenants;
DROP POLICY IF EXISTS "service_role_full_access" ON public.tenants;

-- 6. RLS policy for agents - owners can manage their own
CREATE POLICY "users_manage_own_agents" ON public.tenants
FOR ALL USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- 7. Allow reading demo agent publicly (for widget and unauthenticated access)
CREATE POLICY "public_read_demo_agent" ON public.tenants
FOR SELECT USING (id = '11111111-1111-1111-1111-111111111111');

-- 8. Allow service role full access (for API operations)
CREATE POLICY "service_role_full_access" ON public.tenants
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 9. Add comment for documentation
COMMENT ON COLUMN public.tenants.owner_id IS 'The user who owns this agent. NULL for the demo agent.';
