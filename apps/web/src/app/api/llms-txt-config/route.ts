import { NextResponse, type NextRequest } from "next/server";
import { getLlmsConfig, saveLlmsConfig } from "@/lib/db/llms-txt";
import { llmsTxtConfigSchema } from "@drkumar/shared";
import { json, withAdmin } from "@/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public GET /api/llms-txt-config
 * Returns the current LLMs.txt configuration as JSON with caching headers.
 */
export async function GET() {
  try {
    const config = await getLlmsConfig();
    return NextResponse.json(
      { config },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err) {
    console.error("GET /api/llms-txt-config failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch LLMs.txt configuration" },
      { status: 500 }
    );
  }
}

/**
 * Admin POST /api/llms-txt-config
 * Updates the configuration. Requires admin authentication.
 */
export const POST = withAdmin(async (req: NextRequest) => {
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
    return json({
      config: saved,
      message: "Configuration saved successfully",
    });
  } catch (err) {
    console.error("POST /api/llms-txt-config failed:", err);
    return json(
      { error: "Failed to update LLMs.txt configuration" },
      500
    );
  }
});

export const PUT = POST;
