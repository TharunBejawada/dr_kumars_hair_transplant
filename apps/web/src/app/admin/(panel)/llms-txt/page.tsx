import { getLlmsConfig } from "@/lib/db/llms-txt";
import LlmsTxtAdmin from "@/components/admin/LlmsTxtAdmin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "LLMs.txt Management | Dr. Kumar's Admin",
};

export default async function LlmsTxtAdminPage() {
  const config = await getLlmsConfig(true);

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-6">
        <h1 className="text-[26px] font-bold text-gray-900">
          LLMs.txt Management
        </h1>
        <p className="mt-1 text-[14px] text-gray-600">
          Configure, curate, and organize your site&apos;s AI discovery file following the standard{" "}
          <a
            href="https://llmstxt.org"
            target="_blank"
            rel="noreferrer"
            className="text-brand underline hover:text-brand-2"
          >
            https://llmstxt.org
          </a>{" "}
          specification. Publicly rendered on-demand at <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">/llms.txt</code>.
        </p>
      </div>

      <LlmsTxtAdmin initialConfig={config} />
    </div>
  );
}
