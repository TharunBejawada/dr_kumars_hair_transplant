import Animations from "@/components/Animations";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Treatments from "@/components/Treatments";
import Doctor from "@/components/Doctor";
import Conditions from "@/components/Conditions";
import WhyChoose from "@/components/WhyChoose";
import Results from "@/components/Results";
import Appointment from "@/components/Appointment";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import ConsultationPopup from "@/components/ConsultationPopup";
import ScrollToTop from "@/components/ScrollToTop";
import { clinic } from "@/lib/content";
import { listTreatments } from "@/lib/db/treatments";
import { isTreatmentLive } from "@drkumar/shared";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: "Dr. Kumar's Skin & Hair Transplant Center",
  medicalSpecialty: "Dermatology",
  telephone: clinic.phone,
  email: clinic.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "301, K1 Promo Building, Above Ratnadeep Super Market, Kondapur",
    addressLocality: "Hyderabad",
    addressRegion: "Telangana",
    postalCode: "500084",
    addressCountry: "IN",
  },
  founder: { "@type": "Physician", name: "Dr. Ashok Kumar", medicalSpecialty: "Dermatology" },
};

export default async function Home() {
  let initialTreatments: { title: string; slug: string; serviceCategory: string }[] = [];
  let allLiveTreatments: import("@drkumar/shared").Treatment[] = [];
  try {
    const all = await listTreatments();
    allLiveTreatments = all.filter(isTreatmentLive);
    initialTreatments = allLiveTreatments.map((t) => ({
      title: t.title,
      slug: t.slug,
      serviceCategory: t.serviceCategory,
    }));
  } catch {
    // Client Header gracefully falls back to /api/treatments
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SmoothScroll />
      <Animations />
      <Header initialTreatments={initialTreatments} />
      <main>
        <Hero />
        <About />
        <Treatments dynamicTreatments={allLiveTreatments} />
        <Doctor />
        <Conditions />
        <WhyChoose />
        <Results />
        <Appointment />
      </main>
      <Footer initialTreatments={initialTreatments} />
      <FloatingContact />
      <ConsultationPopup />
      <ScrollToTop />
    </>
  );
}
