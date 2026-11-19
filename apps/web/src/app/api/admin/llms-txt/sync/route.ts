import { json, withAdmin } from "@/lib/auth/api";
import { getLlmsConfig, syncEntitiesWithConfig } from "@/lib/db/llms-txt";
import { llmsTxtConfigSchema } from "@drkumar/shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withAdmin(async (req) => {
  try {
    const body = await req.json().catch(() => null);
    let baseConfig = body ? llmsTxtConfigSchema.safeParse(body).data : undefined;
    if (!baseConfig) {
      baseConfig = await getLlmsConfig(true);
    }

    const { config, addedCount } = await syncEntitiesWithConfig(baseConfig);
    return json({
      config,
      addedCount,
      message:
        addedCount > 0
          ? `Successfully synced ${addedCount} new entity${addedCount === 1 ? "" : "ies"} from database.`
          : "All active database entities are already present in the configuration.",
    });
  } catch (err) {
    console.error("POST /api/admin/llms-txt/sync error:", err);
    return json({ error: "Failed to sync entities with database" }, 500);
  }
});
