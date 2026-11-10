import Image from "next/image";
import { requireSessionPage } from "@/lib/auth/session";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSessionPage();
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col bg-brand text-white md:w-[240px]">
        <div className="flex items-center justify-center bg-white p-4">
          <Image src="/images/logo.webp" alt="Dr. Kumar's Hair Transplant" width={268} height={77} className="h-auto w-[170px]" />
        </div>
        <AdminNav email={session.email} role={session.role} />
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
