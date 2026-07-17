// Server-only module. The ".server.ts" suffix keeps this file out of client bundles.
// Load via dynamic import from inside a server route/handler.
import raw from "../data/sensitive-projects.data.json";

export type SensitiveRecord = {
  phone_number: string;
  contact_person: string;
  bank_details: string;
};

const data = raw as Record<string, SensitiveRecord>;

export function getSensitive(projectId: string): SensitiveRecord | null {
  return data[projectId] ?? null;
}
