-- ========================================
-- CORRIGIR NOMES DAS COLUNAS NO TRIGGER
-- Execute no SQL Editor do Supabase
-- ========================================

-- Corrigir a função com os nomes corretos das colunas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Log para debug
    RAISE NOTICE 'Trigger executado para usuário: %', NEW.email;
    
    -- Inserir usuário com nomes corretos das colunas (camelCase)
    INSERT INTO public.users (id, email, name, role, "createdAt", "updatedAt")
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
        "updatedAt" = NOW();
    
    RAISE NOTICE 'Usuário sincronizado com sucesso: %', NEW.email;
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '[DIAGNÓSTICO TRIGGER] Erro ao sincronizar usuário. Mensagem: %. SQLSTATE: %', SQLERRM, SQLSTATE;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar se a correção funcionou
SELECT 'Função corrigida com nomes de colunas corretos!' as status;