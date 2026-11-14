import { Hero } from "@/components/hero/Hero";
import { Process } from "@/components/process/Process";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Booking } from "@/components/sections/Booking";
import { FinalCta } from "@/components/sections/FinalCta";
import { Guarantee } from "@/components/sections/Guarantee";
import { Kinetic } from "@/components/sections/Kinetic";
import { Pricing } from "@/components/sections/Pricing";
import { Problem } from "@/components/sections/Problem";
import { Services } from "@/components/sections/Services";
import { Story } from "@/components/sections/Story";

// The home page, in the order of CONTENT.md section 3.
// Reviews (3.11) is built in src/components/sections/Reviews.tsx and deliberately left
// out of this order until real reviews exist. DECISIONS.md 11
export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <Kinetic />
      <Services />
      <BeforeAfter />
      <Process band />
      <Booking />
      <Pricing />
      <Guarantee />
      <Story />
      <FinalCta />
    </>
  );
}
