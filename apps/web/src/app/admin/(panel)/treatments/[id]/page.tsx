import { notFound } from "next/navigation";
import { getTreatment } from "@/lib/db/treatments";
import TreatmentForm from "@/components/admin/TreatmentForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditTreatmentPage({ params }: Props) {
  const { id } = await params;
  const treatment = await getTreatment(id);
  if (!treatment) notFound();

  return <TreatmentForm treatment={treatment} />;
}

