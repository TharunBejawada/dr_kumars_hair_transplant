import Link from "next/link";
import { listServicePages } from "@/lib/db/services";
import ServicesTable from "@/components/admin/ServicesTable";

export const dynamic = "force-dynamic";

export default async function ServicesAdminPage() {
  const pages = await listServicePages();

  return (
    <div className="mx-auto max-w-[1240px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">Services & Detail Pages</h1>
          <p className="mt-1 text-[14px] text-gray-600">
            Manage your 4 core services (Hair, Skin & Cosmetic, Dermatology, STD) and customized details pages.
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="rounded-lg bg-brand px-5 py-2.5 text-[15px] font-semibold text-white shadow-sm hover:bg-brand-2 transition"
        >
          + Add Detail Page
        </Link>
      </div>

      <ServicesTable initial={pages} />
    </div>
  );
}

