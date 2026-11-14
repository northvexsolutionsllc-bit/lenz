import type { Metadata } from "next";
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
import { hero } from "@/content/home";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

// CONTENT.md gives the home page no meta title or description of its own. The title is
// the name and the tagline, and the description is the hero lead, word for word.
export const metadata: Metadata = pageMetadata({
  path: "/",
  title: `${site.name} | ${site.tagline}`,
  description: hero.lead,
});

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
      <BeforeAfter id="before-after" />
      <Process band />
      <Booking />
      <Pricing />
      <Guarantee />
      <Story />
      <FinalCta />
    </>
  );
}
