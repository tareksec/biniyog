-- ============================================================
-- Migration: Create get_all_users and admin_delete_user functions
-- Enables admin dashboard to list auth.users + public.profiles
-- ============================================================

-- 1. Create get_all_users function (SECURITY DEFINER to access auth.users)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  phone text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT 
    au.id,
    au.email::text,
    p.full_name,
    p.phone,
    au.created_at
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  ORDER BY au.created_at DESC;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;

-- 2. Create admin_delete_user function (SECURITY DEFINER for admin deletion)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;
