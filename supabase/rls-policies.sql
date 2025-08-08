-- Políticas RLS para controle de acesso baseado em planos
-- Execute no Supabase Dashboard > SQL Editor

-- 1. Ativar RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultivation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Função para verificar plano do usuário
CREATE OR REPLACE FUNCTION get_user_plan(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_plan TEXT;
BEGIN
  SELECT s.plan INTO user_plan
  FROM subscriptions s
  WHERE s.user_id = user_id AND s.status = 'active'
  LIMIT 1;
  
  RETURN COALESCE(user_plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Políticas para usuários
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 4. Políticas para cultivos baseadas em plano
CREATE POLICY "Free users limited cultivations" ON cultivations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (
      get_user_plan(auth.uid()) != 'free' OR
      (SELECT COUNT(*) FROM cultivations WHERE user_id = auth.uid()) < 3
    )
  );

CREATE POLICY "Basic users limited cultivations" ON cultivations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (
      get_user_plan(auth.uid()) NOT IN ('free', 'basic') OR
      (SELECT COUNT(*) FROM cultivations WHERE user_id = auth.uid()) < 10
    )
  );

CREATE POLICY "Premium users limited cultivations" ON cultivations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (
      get_user_plan(auth.uid()) NOT IN ('free', 'basic', 'premium') OR
      (SELECT COUNT(*) FROM cultivations WHERE user_id = auth.uid()) < 50
    )
  );

-- 5. Políticas para visualização
CREATE POLICY "Users can view own cultivations" ON cultivations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own cultivations" ON cultivations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cultivations" ON cultivations
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Políticas para eventos
CREATE POLICY "Users can manage own cultivation events" ON cultivation_events
  FOR ALL USING (auth.uid() = user_id);

-- 7. Políticas para assinaturas
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- 8. Função para verificar permissões específicas
CREATE OR REPLACE FUNCTION has_permission(user_id UUID, permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  has_perm BOOLEAN := FALSE;
BEGIN
  user_plan := get_user_plan(user_id);
  
  CASE permission
    WHEN 'canAccessAnalytics' THEN
      has_perm := user_plan IN ('premium', 'enterprise');
    WHEN 'canExportData' THEN
      has_perm := user_plan IN ('basic', 'premium', 'enterprise');
    WHEN 'canAccessAPI' THEN
      has_perm := user_plan IN ('premium', 'enterprise');
    WHEN 'canUseTeamFeatures' THEN
      has_perm := user_plan = 'enterprise';
    ELSE
      has_perm := TRUE; -- Permissões básicas
  END CASE;
  
  RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;