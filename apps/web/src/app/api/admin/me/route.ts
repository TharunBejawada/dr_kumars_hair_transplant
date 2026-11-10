import { json, withAdmin } from "@/lib/auth/api";

export const GET = withAdmin(async (_req, session) => json({ email: session.email, role: session.role }));
