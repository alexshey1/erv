-- ========================================
-- VERIFICAR E CORRIGIR PERMISSÕES
-- Execute no SQL Editor do Supabase
-- ========================================

-- 1. Verificar se RLS está bloqueando
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- 2. Verificar permissões da função
SELECT 
    proname as function_name,
    proowner,
    proacl as permissions
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. Dar permissões explícitas para a função
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- 4. Garantir que a função pode inserir na tabela users
GRANT INSERT, UPDATE ON public.users TO postgres;
GRANT INSERT, UPDATE ON public.users TO service_role;

-- 5. Recriar a função com SECURITY DEFINER mais explícito
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Log para debug
    RAISE NOTICE 'Trigger executado para usuário: %', NEW.email;
    
    -- Inserir usuário com permissões elevadas
    INSERT INTO public.users (id, email, name, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'free',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, public.users.name),
        updated_at = NOW();
    
    RAISE NOTICE 'Usuário sincronizado com sucesso: %', NEW.email;
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'ERRO no trigger para usuário %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Verificar se trigger ainda existe
SELECT 'Permissões atualizadas!' as status;

SELECT 
    trigger_name,
    event_object_schema,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';