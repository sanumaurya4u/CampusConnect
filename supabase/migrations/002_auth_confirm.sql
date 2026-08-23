-- Migration: 002_auth_confirm.sql
-- Description: Trigger to automatically mark email as confirmed upon user signup

CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = auth, public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.email_confirmed_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_confirm_user();
