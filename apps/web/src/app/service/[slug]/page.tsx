import { permanentRedirect } from "next/navigation";
import { getTreatmentBySlug } from "@/lib/db/treatments";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ServiceRedirectPage({ params }: Props) {
  const { slug } = await params;
  const treatment = await getTreatmentBySlug(slug.toLowerCase()).catch(() => null);
  if (treatment?.serviceCategory) {
    permanentRedirect(`/${treatment.serviceCategory}/${treatment.slug}`);
  }
  permanentRedirect(`/${slug}`);
}
