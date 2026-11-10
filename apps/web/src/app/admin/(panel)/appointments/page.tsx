import { listAppointments } from "@/lib/db/appointments";
import AppointmentsTable from "@/components/admin/AppointmentsTable";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const appointments = await listAppointments();
  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="text-[26px] font-semibold">Appointment bookings</h1>
      <p className="mt-1 text-[14px] text-gray-500">Requests submitted from the website form.</p>
      <AppointmentsTable initial={appointments} />
    </div>
  );
}
