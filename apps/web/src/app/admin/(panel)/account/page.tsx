import { requireSessionPage } from "@/lib/auth/session";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const s = await requireSessionPage();
  return (
    <div className="mx-auto max-w-[900px]">
      <h1 className="text-[26px] font-semibold">Account</h1>
      <p className="mt-1 text-[14px] text-gray-500">Signed in as <strong>{s.email}</strong> ({s.role})</p>
      <h2 className="mt-8 text-[18px] font-semibold">Change password</h2>
      <p className="mt-1 text-[14px] text-gray-500">Changing your password signs you out of all other devices.</p>
      <ChangePasswordForm />
    </div>
  );
}
