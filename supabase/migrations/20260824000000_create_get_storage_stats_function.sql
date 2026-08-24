-- ============================================================
-- Migration: Create get_storage_stats function
-- Provides real-time Database & Storage Bucket statistics for Admin Dashboard
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_storage_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_db_bytes bigint;
  v_db_pretty text;
  v_buckets_json json;
  v_total_storage_bytes bigint;
  v_total_storage_pretty text;
BEGIN
  -- 1. Get Database Size
  SELECT pg_database_size(current_database()) INTO v_db_bytes;
  SELECT pg_size_pretty(v_db_bytes) INTO v_db_pretty;

  -- 2. Calculate Storage Bucket Sizes
  WITH known_buckets AS (
    SELECT 'opportunity-images' AS bucket_id
    UNION
    SELECT 'blog-images' AS bucket_id
    UNION
    SELECT id AS bucket_id FROM storage.buckets
    UNION
    SELECT DISTINCT bucket_id FROM storage.objects WHERE bucket_id IS NOT NULL
  ),
  bucket_stats AS (
    SELECT 
      kb.bucket_id,
      COALESCE(SUM((obj.metadata->>'size')::bigint), 0) AS total_bytes
    FROM known_buckets kb
    LEFT JOIN storage.objects obj ON obj.bucket_id = kb.bucket_id
    GROUP BY kb.bucket_id
  )
  SELECT 
    COALESCE(
      json_agg(
        json_build_object(
          'bucket_id', bs.bucket_id,
          'total_bytes', bs.total_bytes,
          'total_pretty', pg_size_pretty(bs.total_bytes)
        )
        ORDER BY bs.total_bytes DESC, bs.bucket_id ASC
      ), 
      '[]'::json
    ),
    COALESCE(SUM(bs.total_bytes), 0)
  INTO v_buckets_json, v_total_storage_bytes
  FROM bucket_stats bs;

  SELECT pg_size_pretty(v_total_storage_bytes) INTO v_total_storage_pretty;

  -- 3. Return JSON structure
  RETURN json_build_object(
    'db_size_bytes', v_db_bytes,
    'db_size_pretty', v_db_pretty,
    'buckets', v_buckets_json,
    'total_storage_bytes', v_total_storage_bytes,
    'total_storage_pretty', v_total_storage_pretty
  );
END;
$$;

-- Grant execution to authenticated users & service role
GRANT EXECUTE ON FUNCTION public.get_storage_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_storage_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_storage_stats() TO service_role;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
