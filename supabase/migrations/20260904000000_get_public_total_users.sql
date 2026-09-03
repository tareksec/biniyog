-- ============================================================
-- Migration: Create get_total_users_count function
-- Securely returns the total count of registered users/profiles
-- for public platform statistics on dashboard & opportunities
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_total_users_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT COALESCE(
    (SELECT count(*)::integer FROM auth.users),
    (SELECT count(*)::integer FROM public.profiles),
    0
  );
$$;

-- Grant execution to anon, authenticated, and service_role
GRANT EXECUTE ON FUNCTION public.get_total_users_count() TO anon, authenticated, service_role;
