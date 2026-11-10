import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-[0_10px_40px_rgba(11,147,136,0.15)]">
        <Link href="/" aria-label="Go to the Dr. Kumar's Hair Transplant home page" className="mx-auto block w-fit transition-opacity hover:opacity-80">
          <Image src="/images/logo.webp" alt="Dr. Kumar's Hair Transplant" width={268} height={77} className="h-auto w-[200px]" priority />
        </Link>
        <h1 className="mt-6 text-center text-[22px] font-semibold">Admin sign in</h1>
        <p className="mt-1 text-center text-[14px] text-gray-500">Manage appointments and blogs</p>
        <LoginForm />
        <Link href="/" className="mt-5 block text-center text-[14px] font-medium text-brand hover:underline">← Back to website</Link>
      </div>
    </main>
  );
}
