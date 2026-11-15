import Animations from "./Animations";
import SmoothScroll from "./SmoothScroll";
import Header from "./Header";
import Footer from "./Footer";
import FloatingContact from "./FloatingContact";
import ConsultationPopup from "./ConsultationPopup";
import { listTreatments } from "@/lib/db/treatments";
import { isTreatmentLive } from "@drkumar/shared";

/** Common chrome (header, footer, smooth scroll, floating contact) for inner public pages. */
export default async function PublicShell({ children }: { children: React.ReactNode }) {
  let initialTreatments: { title: string; slug: string; serviceCategory: string }[] = [];
  try {
    const all = await listTreatments();
    initialTreatments = all.filter(isTreatmentLive).map((t) => ({
      title: t.title,
      slug: t.slug,
      serviceCategory: t.serviceCategory,
    }));
  } catch {
    // Client Header gracefully falls back to /api/treatments
  }

  return (
    <>
      <SmoothScroll />
      <Animations />
      <Header initialTreatments={initialTreatments} />
      <main>{children}</main>
      <Footer />
      <FloatingContact />
      <ConsultationPopup />
    </>
  );
}
