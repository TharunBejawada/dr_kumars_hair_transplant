import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-[0_10px_40px_rgba(11,147,136,0.15)]">
        <Image src="/images/logo.webp" alt="Dr. Kumar's Hair Transplant" width={268} height={77} className="mx-auto h-auto w-[200px]" priority />
        <h1 className="mt-6 text-center text-[22px] font-semibold">Admin sign in</h1>
        <p className="mt-1 text-center text-[14px] text-gray-500">Manage appointments and blogs</p>
        <LoginForm />
      </div>
    </main>
  );
}
