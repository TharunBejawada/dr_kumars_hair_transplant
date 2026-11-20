import { redirect } from "next/navigation";
import { getServicePage } from "@/lib/db/services";
import ServicePageForm from "@/components/admin/ServicePageForm";

export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const page = await getServicePage((await params).id);
  if (!page) redirect("/admin/services");

  return (
    <div className="mx-auto max-w-[1240px]">
      <ServicePageForm page={page} />
    </div>
  );
}

