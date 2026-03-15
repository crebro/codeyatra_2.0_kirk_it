import VDFHeader from "@/components/vdf-header";
import VDFHero from "@/components/vdf-hero";
import VDFInputSection from "@/components/vdf-input-section";
import VDFHowItWorks from "@/components/vdf-how-it-works";
import VDFPricing from "@/components/vdf-pricing";
import VDFFooter from "@/components/vdf-footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-vdf-cream">
      <VDFHeader />
      <main>
        <VDFHero />
        <VDFInputSection />
        <VDFHowItWorks />
        <VDFPricing />
      </main>
      <VDFFooter />
    </div>
  );
}
