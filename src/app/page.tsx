import { Footer } from "@/components/landing/Footer";
import { HandmadeStory } from "@/components/landing/HandmadeStory";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";

export default function Home() {
  return (
    <div id="top" className="min-h-screen overflow-clip">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <HandmadeStory />
      </main>
      <Footer />
    </div>
  );
}
