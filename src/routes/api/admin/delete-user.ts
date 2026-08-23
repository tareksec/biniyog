import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/admin/delete-user")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // 1. Verify caller has authenticated session token
          const authHeader = request.headers.get("authorization");
          const token = authHeader?.replace(/^Bearer\s+/i, "");

          const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
          const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
          const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

          if (!supabaseUrl || !anonKey) {
            return Response.json({ error: "Missing Supabase configuration" }, { status: 500 });
          }

          if (!token) {
            return Response.json({ error: "Unauthorized: Missing auth token" }, { status: 401 });
          }

          // Verify user identity with Supabase Auth
          const authClient = createClient(supabaseUrl, anonKey);
          const { data: { user }, error: authErr } = await authClient.auth.getUser(token);

          if (authErr || !user) {
            return Response.json({ error: "Unauthorized: Invalid session" }, { status: 401 });
          }

          const body = await request.json().catch(() => ({}));
          const { userId } = body;

          if (!userId || typeof userId !== "string") {
            return Response.json({ error: "Invalid userId provided" }, { status: 400 });
          }

          // If service role key is available, use Supabase admin API
          if (serviceRoleKey) {
            const adminClient = createClient(supabaseUrl, serviceRoleKey, {
              auth: { autoRefreshToken: false, persistSession: false },
            });

            const { error: delErr } = await adminClient.auth.admin.deleteUser(userId);
            if (delErr) {
              return Response.json({ error: delErr.message }, { status: 400 });
            }

            return Response.json({ success: true, message: "User deleted successfully" });
          }

          // If service role key is not yet set in environment, execute database RPC admin_delete_user
          const { error: rpcErr } = await authClient.rpc("admin_delete_user", {
            target_user_id: userId,
          });

          if (rpcErr) {
            return Response.json({ error: rpcErr.message }, { status: 400 });
          }

          return Response.json({ success: true, message: "User deleted via RPC" });
        } catch (err: any) {
          console.error("Delete user API error:", err);
          return Response.json({ error: err.message || "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
