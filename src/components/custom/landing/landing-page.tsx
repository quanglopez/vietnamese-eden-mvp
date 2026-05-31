import { LandingFaq } from "@/components/custom/landing/landing-faq";
import { LandingFeatures } from "@/components/custom/landing/landing-features";
import { LandingFooter } from "@/components/custom/landing/landing-footer";
import { LandingHeader } from "@/components/custom/landing/landing-header";
import { LandingHero } from "@/components/custom/landing/landing-hero";
import { LandingHowItWorks } from "@/components/custom/landing/landing-how-it-works";
import { LandingPricing } from "@/components/custom/landing/landing-pricing";
import { LandingProblem } from "@/components/custom/landing/landing-problem";
import { LandingUseCases } from "@/components/custom/landing/landing-use-cases";
import { LandingWaitlist } from "@/components/custom/landing/landing-waitlist";

export function LandingPage() {
  return (
    <div className="scroll-smooth">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingProblem />
        <LandingHowItWorks />
        <LandingFeatures />
        <LandingUseCases />
        <LandingPricing />
        <LandingWaitlist />
        <LandingFaq />
      </main>
      <LandingFooter />
    </div>
  );
}
