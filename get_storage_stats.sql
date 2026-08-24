-- Drop existing function if any
DROP FUNCTION IF EXISTS public.get_storage_stats();

-- Create or replace get_storage_stats function
CREATE OR REPLACE FUNCTION public.get_storage_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  db_bytes bigint;
  bucket_stats json;
BEGIN
  SELECT pg_database_size(current_database()) INTO db_bytes;
  
  SELECT json_agg(
    json_build_object(
      'bucket_id', bucket_id,
      'total_bytes', COALESCE(total_bytes, 0),
      'file_count', COALESCE(file_count, 0)
    )
  ) INTO bucket_stats
  FROM (
    SELECT 
      bucket_id,
      SUM(COALESCE((metadata->>'size')::bigint, 0)) as total_bytes,
      COUNT(*) as file_count
    FROM storage.objects
    WHERE bucket_id IS NOT NULL
    GROUP BY bucket_id
  ) s;

  RETURN json_build_object(
    'db_size_bytes', db_bytes,
    'db_size_pretty', pg_size_pretty(db_bytes),
    'buckets', COALESCE(bucket_stats, '[]'::json)
  );
END;
$$;

-- Grant permissions for RPC calls
GRANT EXECUTE ON FUNCTION public.get_storage_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_storage_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_storage_stats() TO service_role;

NOTIFY pgrst, 'reload schema';

-- Verification query (run to inspect storage.objects stats):
-- SELECT bucket_id, COUNT(*), SUM(COALESCE((metadata->>'size')::bigint, 0)) as total_bytes FROM storage.objects GROUP BY bucket_id;
