import { Hero } from "@/components/hero";
// import { PricingSection } from "@/components/pricing-section";
// import { ProcessSection } from "@/components/process-section";
import { FAQSection } from "@/components/faq-section";
import { OfferSection } from "@/components/offer-section";
import { DiagnosisSection } from "@/components/diagnosis-section";


export default function HomePage() {
  return (
    <>
      <Hero />
      <DiagnosisSection />
      <OfferSection />
      <FAQSection />
    </>
  );
}
