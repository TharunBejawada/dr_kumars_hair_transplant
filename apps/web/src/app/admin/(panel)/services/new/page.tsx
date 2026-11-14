import ServicePageForm from "@/components/admin/ServicePageForm";

export const dynamic = "force-dynamic";

export default function NewServicePage() {
  return (
    <div className="mx-auto max-w-[1240px]">
      <ServicePageForm />
    </div>
  );
}

