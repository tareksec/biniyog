-- ============================================================
-- Migration: Add status column to profiles & manual approval system
-- ============================================================

-- 1. Add status column to public.profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Add check constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_status_check'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_status_check CHECK (status IN ('pending', 'approved'));
  END IF;
END $$;

-- 2. Update get_all_users() function to return status
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  phone text,
  status text,
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
    COALESCE(p.status, 'pending') as status,
    au.created_at
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  ORDER BY au.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;

-- 3. Create admin_update_user_status function for quick status changes
CREATE OR REPLACE FUNCTION public.admin_update_user_status(target_user_id uuid, new_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF new_status NOT IN ('pending', 'approved') THEN
    RAISE EXCEPTION 'Invalid status. Must be pending or approved.';
  END IF;

  UPDATE public.profiles
  SET status = new_status
  WHERE id = target_user_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_user_status(uuid, text) TO authenticated;
