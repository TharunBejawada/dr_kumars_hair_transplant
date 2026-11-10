import Animations from "./Animations";
import SmoothScroll from "./SmoothScroll";
import Header from "./Header";
import Footer from "./Footer";
import FloatingContact from "./FloatingContact";
import ConsultationPopup from "./ConsultationPopup";

/** Common chrome (header, footer, smooth scroll, floating contact) for inner public pages. */
export default function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <Animations />
      <Header />
      <main>{children}</main>
      <Footer />
      <FloatingContact />
      <ConsultationPopup />
    </>
  );
}
