import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ServicesRedirectPage({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/department/${slug}`);
}
