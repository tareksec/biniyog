import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// In-memory fallback rate limiter for server runtime (IP -> array of timestamps)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REVIEWS_PER_HOUR = 3;

function checkRateLimitInMemory(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REVIEWS_PER_HOUR) {
    return false; // Rate limit exceeded
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);

  // Clean up old keys periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, times] of rateLimitMap.entries()) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) {
        rateLimitMap.delete(key);
      }
    }
  }

  return true;
}

export const Route = createFileRoute("/api/public/submit-review")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Authentication check: verify JWT from Authorization header
        const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
        const token = authHeader?.replace(/^Bearer\s+/i, "")?.trim();

        if (!token) {
          return Response.json(
            { success: false, error: "মতামত জমা দিতে অনুগ্রহ করে লগইন করুন" },
            { status: 401 }
          );
        }

        let authenticatedUser: any = null;
        try {
          const { data: authData, error: authErr } = await supabase.auth.getUser(token);
          if (authErr || !authData?.user) {
            return Response.json(
              { success: false, error: "অবৈধ বা মেয়াদোত্তীর্ণ লগইন সেশন। অনুগ্রহ করে আবার লগইন করুন।" },
              { status: 401 }
            );
          }
          authenticatedUser = authData.user;
        } catch {
          return Response.json(
            { success: false, error: "লগইন যাচাইকরণে ত্রুটি হয়েছে।" },
            { status: 401 }
          );
        }

        let payload: {
          reviewer_name?: string;
          reviewer_email?: string;
          rating?: number;
          note?: string;
          target_type?: "opportunity" | "homepage" | "general";
          target_id?: string | null;
          has_invested?: boolean;
          user_identity?: string;
          investment_details?: string | null;
        };

        try {
          payload = await request.json();
        } catch {
          return Response.json(
            { success: false, error: "ভুল ডেটা ফরম্যাট পাঠানো হয়েছে" },
            { status: 400 }
          );
        }

        const {
          reviewer_name,
          reviewer_email,
          rating,
          note,
          target_type = "general",
          target_id = null,
          has_invested,
          user_identity,
          investment_details,
        } = payload;

        // Validation
        if (typeof rating !== "number" || isNaN(rating) || rating < 0 || rating > 1) {
          return Response.json(
            { success: false, error: "রেটিং মান ০ থেকে ১ এর মধ্যে হতে হবে" },
            { status: 400 }
          );
        }

        const cleanNote = (note || "").trim();
        if (!cleanNote) {
          return Response.json(
            { success: false, error: "অনুগ্রহ করে আপনার মতামত লিখুন" },
            { status: 400 }
          );
        }

        if (typeof has_invested !== "boolean") {
          return Response.json(
            { success: false, error: "আপনি কি বিনিয়োগ করেছেন তা নির্বাচন করুন" },
            { status: 400 }
          );
        }

        const cleanIdentity = (user_identity || "").trim();
        if (!cleanIdentity) {
          return Response.json(
            { success: false, error: "আপনার পরিচয় উল্লেখ করুন (যেমন: ব্যবসায়ী, চাকরিজীবী)" },
            { status: 400 }
          );
        }

        const validTargetTypes = ["opportunity", "homepage", "general"];
        if (!validTargetTypes.includes(target_type)) {
          return Response.json(
            { success: false, error: "অবৈধ টার্গেট টাইপ" },
            { status: 400 }
          );
        }

        // Pull verified reviewer details from authenticated profile/user metadata to prevent spoofing
        let verifiedName = (reviewer_name || "").trim();
        if (!verifiedName || verifiedName === "বিনিয়োগকারী") {
          verifiedName = authenticatedUser.user_metadata?.full_name || authenticatedUser.email?.split("@")[0] || "বিনিয়োগকারী";
        }
        const verifiedEmail = authenticatedUser.email || (reviewer_email || "").trim() || null;
        const cleanDetails = (investment_details || "").trim() || null;

        // Rate Limiting by IP
        const ip =
          request.headers.get("cf-connecting-ip") ||
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "anonymous";

        // 1. In-memory rate check
        if (!checkRateLimitInMemory(ip)) {
          return Response.json(
            {
              success: false,
              error: "আপনি অতিরিক্ত রিভিউ পাঠিয়েছেন। অনুগ্রহ করে ১ ঘন্টা পর আবার চেষ্টা করুন।",
            },
            { status: 429 }
          );
        }

        // Initialize server DB client: use service role key if available, otherwise default client
        let dbClient = supabase;
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && serviceRoleKey) {
          try {
            dbClient = createClient(supabaseUrl, serviceRoleKey, {
              auth: { autoRefreshToken: false, persistSession: false },
            }) as any;
          } catch (clientErr) {
            console.warn("[submit-review] Error initializing service role client:", clientErr);
          }
        }

        // 2. Database rate check (past 1 hour count)
        try {
          const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
          const { count, error: countError } = await dbClient
            .from("user_reviews")
            .select("id", { count: "exact", head: true })
            .eq("ip_address", ip)
            .gte("created_at", oneHourAgo);

          if (!countError && typeof count === "number" && count >= MAX_REVIEWS_PER_HOUR) {
            return Response.json(
              {
                success: false,
                error: "আপনি ১ ঘন্টায় সর্বোচ্চ ৩টি রিভিউ দিতে পারবেন।",
              },
              { status: 429 }
            );
          }
        } catch (dbErr) {
          console.warn("[submit-review] DB rate limit check non-fatal error:", dbErr);
        }

        // Insert pending review (explicitly status='pending' and linked to authenticated user_id)
        const insertPayload = {
          user_id: authenticatedUser.id,
          reviewer_name: verifiedName,
          reviewer_email: verifiedEmail,
          rating: Number(rating.toFixed(2)),
          note: cleanNote,
          status: "pending" as const,
          target_type,
          target_id: target_type === "opportunity" && target_id ? target_id : null,
          has_invested,
          user_identity: cleanIdentity,
          investment_details: cleanDetails,
          ip_address: ip,
        };

        console.log("[submit-review] Executing insert with payload:", insertPayload);

        const { error } = await dbClient
          .from("user_reviews")
          .insert(insertPayload);

        if (error) {
          console.error("[submit-review] Supabase insert error:", error);
          return Response.json(
            {
              success: false,
              error: error.message || "রিভিউ জমা দিতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।",
              details: error,
            },
            { status: 500 }
          );
        }

        console.log("[submit-review] Insert executed successfully with status='pending'");

        return Response.json({
          success: true,
          message: "আপনার মতামত সফলভাবে জমা হয়েছে। পর্যালোচনার পর এটি প্রকাশিত হবে।",
        });
      },
    },
  },
});
