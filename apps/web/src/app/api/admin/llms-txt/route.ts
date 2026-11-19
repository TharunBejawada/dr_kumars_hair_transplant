import { json, withAdmin } from "@/lib/auth/api";
import { getLlmsConfig, saveLlmsConfig } from "@/lib/db/llms-txt";
import { llmsTxtConfigSchema } from "@drkumar/shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withAdmin(async () => {
  try {
    const config = await getLlmsConfig(true);
    return json({ config });
  } catch (err) {
    console.error("GET /api/admin/llms-txt error:", err);
    return json({ error: "Failed to fetch LLMs.txt configuration" }, 500);
  }
});

export const POST = withAdmin(async (req) => {
  const body = await req.json().catch(() => null);
  const parsed = llmsTxtConfigSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        error: "Validation failed",
        issues: parsed.error.flatten().fieldErrors,
      },
      400
    );
  }

  try {
    const saved = await saveLlmsConfig(parsed.data);
    return json({ config: saved, message: "Configuration saved successfully" });
  } catch (err) {
    console.error("POST /api/admin/llms-txt error:", err);
    return json({ error: "Failed to save LLMs.txt configuration" }, 500);
  }
});

export const PUT = POST;
