import Link from "next/link";
import { Hero } from "@/components/hero";
// import { Section } from "@/components/section";
import { ServicesSection } from "@/components/services-section";
import { PricingSection } from "@/components/pricing-section";
import { ProcessSection } from "@/components/process-section";
import { FAQSection } from "@/components/faq-section";
import { OfferSection } from "@/components/offer-section";


export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesSection />
      <OfferSection />
      {/* <PricingSection />
      <ProcessSection /> */}
      <FAQSection />
    </>
  );
}
