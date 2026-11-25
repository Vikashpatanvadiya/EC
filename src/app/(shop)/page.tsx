import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Designs } from "@/components/Designs";
import { Steps } from "@/components/Steps";
import { Story } from "@/components/Story";
import { ClosingCta } from "@/components/ClosingCta";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Designs />
      <Steps />
      <Story />
      <ClosingCta />
    </>
  );
}
