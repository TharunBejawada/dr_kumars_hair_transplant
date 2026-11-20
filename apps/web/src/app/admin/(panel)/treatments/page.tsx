import Link from "next/link";
import { listTreatments } from "@/lib/db/treatments";
import TreatmentsTable from "@/components/admin/TreatmentsTable";
import { FaPlus } from "react-icons/fa6";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TreatmentsAdminPage() {
  const treatments = await listTreatments();

  return (
    <div className="mx-auto max-w-[1240px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">Treatments & Services Mapping</h1>
          <p className="mt-1 text-[14px] text-gray-600">
            Manage treatments across clinical categories. Every treatment maps exclusively to one service category (Hair, Skin & Cosmetic, Dermatology, STD).
          </p>
        </div>
        <Link
          href="/admin/treatments/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm hover:bg-brand-2 transition"
        >
          <FaPlus className="size-3.5" />
          <span>Add New Treatment</span>
        </Link>
      </div>

      <TreatmentsTable initial={treatments} />
    </div>
  );
}

