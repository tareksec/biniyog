import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";

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

          // Verify caller identity with Supabase Auth
          const authClient = createClient(supabaseUrl, anonKey);
          const { data: { user }, error: authErr } = await authClient.auth.getUser(token);

          if (authErr || !user) {
            return Response.json({ error: "Unauthorized: Invalid session" }, { status: 401 });
          }

          // Verify caller is an authorized admin
          if (!isAdminEmail(user.email)) {
            return Response.json({ error: "Unauthorized: Only administrators can delete accounts" }, { status: 403 });
          }

          const body = await request.json().catch(() => ({}));
          const { userId, targetEmail } = body;

          if (!userId || typeof userId !== "string") {
            return Response.json({ error: "Invalid userId provided" }, { status: 400 });
          }

          // Check if target user email is an admin email
          if (targetEmail && isAdminEmail(targetEmail)) {
            return Response.json({ error: "Admin account cannot be deleted" }, { status: 400 });
          }

          // If service role key is available, inspect target user and use Supabase admin API
          if (serviceRoleKey) {
            const adminClient = createClient(supabaseUrl, serviceRoleKey, {
              auth: { autoRefreshToken: false, persistSession: false },
            });

            // Fetch target user to check email
            const { data: targetUserData } = await adminClient.auth.admin.getUserById(userId);
            if (targetUserData?.user?.email && isAdminEmail(targetUserData.user.email)) {
              return Response.json({ error: "Admin account cannot be deleted" }, { status: 400 });
            }

            const { error: delErr } = await adminClient.auth.admin.deleteUser(userId);
            if (delErr) {
              return Response.json({ error: delErr.message }, { status: 400 });
            }

            return Response.json({ success: true, message: "User deleted successfully" });
          }

          // Fallback: execute database RPC admin_delete_user
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
