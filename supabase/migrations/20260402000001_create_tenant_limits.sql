-- Tenant limits table for configurable per-business limits
CREATE TABLE IF NOT EXISTS tenant_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  max_bot_messages INTEGER NOT NULL DEFAULT 20,
  max_owner_chat_messages INTEGER NOT NULL DEFAULT 20,
  max_owner_chat_chars INTEGER NOT NULL DEFAULT 10000,
  max_conversations_monthly INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tenant_limits ENABLE ROW LEVEL SECURITY;

-- Admin can manage all limits
CREATE POLICY "admin_full_access_tenant_limits" ON tenant_limits
  FOR ALL USING (is_admin());

-- Tenant owners can read their own limits
CREATE POLICY "tenant_read_own_limits" ON tenant_limits
  FOR SELECT USING (tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid()));

CREATE INDEX idx_tenant_limits_tenant ON tenant_limits(tenant_id);
