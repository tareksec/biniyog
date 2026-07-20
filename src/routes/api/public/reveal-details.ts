import { createFileRoute } from "@tanstack/react-router";

const TEST_SECRET = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"; // Google reCAPTCHA v2 test key

async function verifyRecaptcha(token: string, remoteip?: string | null) {
  const secret = process.env.RECAPTCHA_SECRET_KEY || TEST_SECRET;
  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.set("remoteip", remoteip);
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) return false;
  const json = (await res.json()) as { success?: boolean };
  return !!json.success;
}

export const Route = createFileRoute("/api/public/reveal-details")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: {
          projectId?: string;
          recaptchaToken?: string;
          confirmed?: boolean;
        };
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const { projectId, recaptchaToken, confirmed } = payload;
        if (!projectId || typeof projectId !== "string" || projectId.length > 200) {
          return Response.json({ error: "invalid_project" }, { status: 400 });
        }
        if (!recaptchaToken || typeof recaptchaToken !== "string") {
          return Response.json({ error: "missing_recaptcha" }, { status: 400 });
        }
        if (!confirmed) {
          return Response.json({ error: "not_confirmed" }, { status: 400 });
        }

        const ip =
          request.headers.get("cf-connecting-ip") ||
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          null;
        const ok = await verifyRecaptcha(recaptchaToken, ip);
        if (!ok) {
          return Response.json({ error: "recaptcha_failed" }, { status: 403 });
        }

        const { getSensitive } = await import("@/lib/sensitive-data.server");
        const record = getSensitive(projectId);
        if (!record) {
          return Response.json({ error: "not_found" }, { status: 404 });
        }

        return Response.json({
          phone_number: record.phone_number,
          contact_person: record.contact_person,
          bank_details: record.bank_details,
        });
      },
    },
  },
});
