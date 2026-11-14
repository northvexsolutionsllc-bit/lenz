import type { Metadata } from "next";
import { ReviewPlaceholder } from "@/components/sections/Reviews";
import { Specimen, State } from "@/components/styleguide/Specimen";
import { CompareSlider } from "@/components/ui/CompareSlider";
import { Counter } from "@/components/ui/Counter";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Footer } from "@/components/ui/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { HeaderBar, MenuSheet } from "@/components/ui/Header";
import { Icon } from "@/components/ui/Icon";
import { Marquee } from "@/components/ui/Marquee";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Pill } from "@/components/ui/Pill";
import { PlaceholderFrame } from "@/components/ui/PlaceholderFrame";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Stats } from "@/components/ui/Stats";
import { StepRow } from "@/components/ui/StepRow";
import { TextLink } from "@/components/ui/TextLink";
import { TodoChip } from "@/components/ui/TodoChip";
import { hero, pricing } from "@/content/home";
import { dealer, guide } from "@/content/pages";
import { FEATURED_PAIR } from "@/content/media";
import { site } from "@/content/site";
import { tokens, type ColourToken } from "@/generated/tokens";
import { getPair } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

// DESIGN.md 2.1. Hex values are read from src/styles/tokens.css at build time.
const COLOURS: Array<{ token: ColourToken; name: string; use: string; swatch: string }> = [
  { token: "night", name: "Night", swatch: "bg-night", use: "Page ground. The darkest thing on the site. Text colour on top of beam and oxide." },
  { token: "pine", name: "Pine", swatch: "bg-pine", use: "The client's existing brand dark. Alternating section bands, header background after scroll." },
  { token: "smoke", name: "Smoke", swatch: "bg-smoke", use: "Raised surfaces: cards, form fields, image frames, the mobile menu sheet." },
  { token: "beam", name: "Beam", swatch: "bg-beam", use: "Primary text. Primary button fill. The restored light." },
  { token: "xenon", name: "Xenon", swatch: "bg-xenon", use: "Accent. Links, focus ring, active states, glow colour, the slider seam, numerals." },
  { token: "oxide", name: "Oxide", swatch: "bg-oxide", use: "The before state only. Haze tint, the before half of comparisons, caution notes, the replace tier." },
];

// DESIGN.md 2.2
const VARIANTS: Array<{ token: string; swatch: string; use: string }> = [
  { token: "--beam-04", swatch: "bg-beam-04", use: "Section band tint over night" },
  { token: "--beam-08", swatch: "bg-beam-08", use: "Card fill over pine" },
  { token: "--beam-12", swatch: "bg-beam-12", use: "Hairline borders, dividers, input borders" },
  { token: "--beam-24", swatch: "bg-beam-24", use: "Disabled text, inactive icons" },
  { token: "--beam-54", swatch: "bg-beam-54", use: "Captions, meta, eyebrow secondary" },
  { token: "--beam-62", swatch: "bg-beam-62", use: "Body copy on dark. The default paragraph colour." },
  { token: "--beam-80", swatch: "bg-beam-80", use: "Lead paragraph, sub-headings" },
];

// DESIGN.md 2.3, the measured figures exactly as stated there
const CONTRAST: Array<{ token: string; swatch: string; night: string; pine: string; smoke: string; verdict: string }> = [
  { token: "--beam", swatch: "bg-beam", night: "17.65", pine: "16.80", smoke: "14.61", verdict: "Pass AAA everywhere. Headings, numerals." },
  { token: "--beam-80", swatch: "bg-beam-80", night: "11.34", pine: "10.91", smoke: "9.76", verdict: "Pass AAA. Lead paragraphs." },
  { token: "--beam-62", swatch: "bg-beam-62", night: "7.13", pine: "6.93", smoke: "6.44", verdict: "Pass AAA on night, AA elsewhere. Body copy." },
  { token: "--beam-54", swatch: "bg-beam-54", night: "5.59", pine: "5.52", smoke: "5.22", verdict: "Pass AA. Captions and eyebrows only, minimum 14px." },
  { token: "--beam-24", swatch: "bg-beam-24", night: "2.01", pine: "2.07", smoke: "2.10", verdict: "Fails everything. Decorative and disabled only." },
  { token: "--xenon", swatch: "bg-xenon", night: "10.38", pine: "9.88", smoke: "8.60", verdict: "Pass AAA. Accent, links, focus ring." },
  { token: "--oxide", swatch: "bg-oxide", night: "6.17", pine: "5.88", smoke: "5.11", verdict: "Pass AA at all sizes." },
];

const REVERSE: Array<{ pair: string; ratio: string; verdict: string }> = [
  { pair: "--night on --beam", ratio: "17.65", verdict: "Pass AAA. This is the primary button." },
  { pair: "--night on --xenon", ratio: "10.38", verdict: "Pass AAA" },
  { pair: "--night on --oxide", ratio: "6.17", verdict: "Pass AA" },
  { pair: "--beam on --oxide", ratio: "2.86", verdict: "FAIL. Forbidden." },
  { pair: "--xenon on --oxide", ratio: "1.68", verdict: "FAIL. Forbidden." },
];

const MARQUEE_ITEMS = ["Antioch", "Brentwood", "Pittsburg", "Oakley", "Discovery Bay", "Bay Point"] as const;

export default function StyleguidePage() {
  const pair = getPair(FEATURED_PAIR);
  const todoStat = hero.stats.find((stat) => stat.todo !== null);
  return (
    <div className="shell flex flex-col gap-96 pt-160 pb-96">
      <header className="flex flex-col gap-16">
        <Eyebrow>Internal, not indexed</Eyebrow>
        <h1 className="h2">Styleguide</h1>
        <p className="body-l">
          Every token, type style and component in the build, on both grounds. Values come from docs/DESIGN.md and
          docs/MOTION.md and from nowhere else.
        </p>
      </header>

      {/* ------------------------------------------------------------ Colour */}
      <section className="flex flex-col gap-48" aria-labelledby="sg-colour">
        <h2 id="sg-colour" className="h2">
          Colour
        </h2>

        <div className="flex flex-col gap-16">
          <h3 className="h3">The six</h3>
          <ul className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
            {COLOURS.map((colour) => (
              <li key={colour.token} className="flex flex-col gap-12">
                <div className={`h-96 rounded-card border border-beam-12 ${colour.swatch}`} />
                <p className="caps">
                  --{colour.token} / {tokens[colour.token]}
                </p>
                <p className="h3">{colour.name}</p>
                <p className="small">{colour.use}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-16">
          <h3 className="h3">The seven opacity variants</h3>
          <p className="small">All derived from beam. Shown over night, pine and smoke.</p>
          <ul className="grid gap-16 sm:grid-cols-2 lg:grid-cols-4">
            {VARIANTS.map((variant) => (
              <li key={variant.token} className="flex flex-col gap-12">
                <div className="grid grid-cols-3 overflow-hidden rounded-card border border-beam-12">
                  <div className="bg-night">
                    <div className={`h-64 ${variant.swatch}`} />
                  </div>
                  <div className="bg-pine">
                    <div className={`h-64 ${variant.swatch}`} />
                  </div>
                  <div className="bg-smoke">
                    <div className={`h-64 ${variant.swatch}`} />
                  </div>
                </div>
                <p className="caps">{variant.token}</p>
                <p className="small">{variant.use}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-16">
          <h3 className="h3">Contrast</h3>
          <p className="small">
            The measured ratios from DESIGN.md 2.3. Alpha values are composited against the stated background first,
            then measured. The three backgrounds are the only three that exist.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-left">
              <thead>
                <tr className="border-b border-beam-12">
                  <th scope="col" className="caps py-12 pr-24">
                    Foreground
                  </th>
                  <th scope="col" className="caps py-12 pr-24">
                    on night
                  </th>
                  <th scope="col" className="caps py-12 pr-24">
                    on pine
                  </th>
                  <th scope="col" className="caps py-12 pr-24">
                    on smoke
                  </th>
                  <th scope="col" className="caps py-12">
                    Verdict
                  </th>
                </tr>
              </thead>
              <tbody>
                {CONTRAST.map((row) => (
                  <tr key={row.token} className="border-b border-beam-12">
                    <th scope="row" className="caps py-12 pr-24">
                      {row.token}
                    </th>
                    {(
                      [
                        ["bg-night", row.night],
                        ["bg-pine", row.pine],
                        ["bg-smoke", row.smoke],
                      ] as const
                    ).map(([ground, ratio]) => (
                      <td key={ground} className="py-12 pr-24">
                        <div className="flex items-center gap-12">
                          <div className={`rounded-chip border border-beam-12 p-8 ${ground}`}>
                            <div className={`h-16 w-32 rounded-chip ${row.swatch}`} />
                          </div>
                          <span className="small">{ratio}</span>
                        </div>
                      </td>
                    ))}
                    <td className="small py-12">{row.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-left">
              <caption className="caps pb-12 text-left">Reverse pairs, for text sitting on a filled element</caption>
              <thead>
                <tr className="border-b border-beam-12">
                  <th scope="col" className="caps py-12 pr-24">
                    Pair
                  </th>
                  <th scope="col" className="caps py-12 pr-24">
                    Ratio
                  </th>
                  <th scope="col" className="caps py-12">
                    Verdict
                  </th>
                </tr>
              </thead>
              <tbody>
                {REVERSE.map((row) => (
                  <tr key={row.pair} className="border-b border-beam-12">
                    <th scope="row" className="caps py-12 pr-24">
                      {row.pair}
                    </th>
                    <td className="small py-12 pr-24">{row.ratio}</td>
                    <td className="small py-12">{row.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="body">Any text sitting on oxide is night. Never beam, never xenon.</p>
        </div>

        <div className="flex flex-col gap-16">
          <h3 className="h3">Glow</h3>
          <p className="small">Glow replaces shadow everywhere. Two values only. DESIGN.md 2.4</p>
          <ul className="grid gap-48 py-48 sm:grid-cols-2">
            <li className="flex flex-col items-center gap-24">
              <div className="glow-specimen-xenon h-64 w-160 rounded-card border border-beam-12 bg-smoke" />
              <p className="caps">--glow-xenon / focus and active states</p>
            </li>
            <li className="flex flex-col items-center gap-24">
              <div className="glow-specimen-beam h-64 w-160 rounded-card border border-beam-12 bg-smoke" />
              <p className="caps">--glow-beam / hero beam, slider seam, primary hover</p>
            </li>
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------------------- Type */}
      <section className="flex flex-col gap-48" aria-labelledby="sg-type">
        <h2 id="sg-type" className="h2">
          Type
        </h2>

        <ul className="flex flex-col gap-48">
          <TypeRow name=".wordmark" spec="Archivo 700, wdth 110, line height 1, tracking 0.14em, uppercase">
            <p className="wordmark text-beam">{site.wordmark}</p>
          </TypeRow>
          <TypeRow name=".display with .accent" spec="Archivo 600, wdth 88, line height 0.90, tracking -0.035em. Accent: Instrument Serif italic, 1.06em, xenon">
            <p className="display">
              Bring clarity <span className="accent">back to the road.</span>
            </p>
          </TypeRow>
          <TypeRow name=".h2 with .accent" spec="Archivo 600, wdth 92, line height 0.96, tracking -0.028em">
            <p className="h2">
              Three services. <span className="accent">One standard.</span>
            </p>
          </TypeRow>
          <TypeRow name=".h3" spec="Archivo 600, wdth 100, line height 1.12, tracking -0.015em">
            <p className="h3">You see less of the road</p>
          </TypeRow>
          <TypeRow name=".kinetic" spec="Archivo 700, wdth 70, line height 0.84, tracking -0.045em, uppercase">
            <div className="overflow-hidden">
              <p className="kinetic whitespace-nowrap">Restore. Protect. Repeat.</p>
            </div>
          </TypeRow>
          <TypeRow name=".numeral" spec="JetBrains Mono 500, line height 1, tracking -0.02em, lining tabular figures">
            <p className="numeral">$125</p>
          </TypeRow>
          <TypeRow name=".body-l" spec="Archivo 400, line height 1.48, tracking -0.01em, beam-80, capped at 52ch">
            <p className="body-l">
              Cloudy headlights cut how far you can see at night. We restore the lens you already have, at your
              driveway, for a fraction of what new assemblies cost.
            </p>
          </TypeRow>
          <TypeRow name=".body" spec="Archivo 400, 1.0625rem, line height 1.62, beam-62, capped at 62ch">
            <p className="body">
              Headlight plastic is coated at the factory. Sun and road grit wear that coating off, the plastic
              underneath oxidizes, and the lens goes yellow and milky. The bulb is still working. The light just cannot
              get out.
            </p>
          </TypeRow>
          <TypeRow name=".small" spec="Archivo 400, 0.875rem, line height 1.5, beam-62">
            <p className="small">{site.serviceAreaLine}</p>
          </TypeRow>
          <TypeRow name=".caps" spec="JetBrains Mono 500, 0.75rem, line height 1.3, tracking 0.18em, uppercase, beam-54">
            <p className="caps">Mobile service, East Contra Costa</p>
          </TypeRow>
        </ul>
      </section>

      {/* -------------------------------------------------------- Components */}
      <section className="flex flex-col gap-48" aria-labelledby="sg-components">
        <h2 id="sg-components" className="h2">
          Components
        </h2>

        <Specimen
          title="Header"
          spec="Transparent over the hero. After 100px of scroll: pine at 72 percent, 16px backdrop blur, beam-12 bottom hairline. Hides on scroll down, shows on scroll up, 320ms. The live header is at the top of this page."
          stacked
        >
          {(ground) => (
            <>
              <State label="Over the hero">
                <div className="w-full">
                  <HeaderBar specimen="top" sheetId={`sg-sheet-${ground}`} navLabel={`Primary, over the hero, on ${ground}`} />
                </div>
              </State>
              <State label="After 100px of scroll">
                <div className="w-full">
                  <HeaderBar specimen="scrolled" sheetId={`sg-sheet-${ground}`} navLabel={`Primary, scrolled, on ${ground}`} />
                </div>
              </State>
              <State label="Mobile menu sheet, open">
                <div className="w-full overflow-hidden rounded-card border border-beam-12">
                  <MenuSheet id={`sg-sheet-${ground}`} open specimen navLabel={`Menu, on ${ground}`} />
                </div>
              </State>
            </>
          )}
        </Specimen>

        <Specimen
          title="PrimaryButton"
          spec="Beam fill, night label, 10px radius, 14px 28px padding, caps label. Hover: beam glow plus a 2 percent scale. Magnetic on fine pointers only."
        >
          <State label="Default">
            <PrimaryButton href={site.sms.href}>{site.cta.primary}</PrimaryButton>
          </State>
          <State label="Hover">
            <PrimaryButton href={site.sms.href} preview="hover">
              {site.cta.primary}
            </PrimaryButton>
          </State>
          <State label="Focus">
            <PrimaryButton href={site.sms.href} preview="focus">
              {site.cta.primary}
            </PrimaryButton>
          </State>
        </Specimen>

        <Specimen
          title="SecondaryButton"
          spec="Transparent fill, 1px beam-24 border, beam label. Hover: border and label go xenon, background goes beam-04."
        >
          <State label="Default">
            <SecondaryButton href={site.phone.href}>{site.cta.secondary}</SecondaryButton>
          </State>
          <State label="Hover">
            <SecondaryButton href={site.phone.href} preview="hover">
              {site.cta.secondary}
            </SecondaryButton>
          </State>
          <State label="Focus">
            <SecondaryButton href={site.phone.href} preview="focus">
              {site.cta.secondary}
            </SecondaryButton>
          </State>
        </Specimen>

        <Specimen
          title="TextLink"
          spec="Beam label, 1px underline in beam-24 sitting 4px below the baseline. On hover the underline wipes to xenon, left to right, over 320ms."
        >
          <State label="Default">
            <TextLink href="/headlight-restoration" className="body">
              See the process
            </TextLink>
          </State>
          <State label="Hover">
            <TextLink href="/headlight-restoration" className="body" preview="hover">
              See the process
            </TextLink>
          </State>
          <State label="Focus">
            <TextLink href="/headlight-restoration" className="body" preview="focus">
              See the process
            </TextLink>
          </State>
        </Specimen>

        <Specimen title="Pill" spec="Beam-08 fill, caps label, 999px radius, 6px 14px. Service areas and tags.">
          <State label="Tag">
            <Pill>Local small business</Pill>
          </State>
          <State label="Link">
            <Pill href="/headlight-restoration-antioch-ca">Antioch</Pill>
          </State>
          <State label="Link, hover">
            <Pill href="/headlight-restoration-antioch-ca" preview="hover">
              Antioch
            </Pill>
          </State>
          <State label="Link, focus">
            <Pill href="/headlight-restoration-antioch-ca" preview="focus">
              Antioch
            </Pill>
          </State>
        </Specimen>

        <Specimen title="Eyebrow" spec="Caps in beam-54 preceded by a 24px wide 1px rule in xenon. Sits above every H2.">
          <div className="flex flex-col gap-16">
            <Eyebrow>Why it matters</Eyebrow>
            <p className="h2">
              A hazy lens is not <span className="accent">only a looks problem.</span>
            </p>
          </div>
        </Specimen>

        <Specimen
          title="Counter"
          spec="Numeral. Counts from 0 to its target when it enters the viewport, 1200ms, ease-beam. Holds its final width while it counts. Static under reduced motion."
        >
          <ul className="flex flex-wrap gap-48">
            <li className="flex flex-col gap-8">
              <Counter value={125} prefix="$" />
              <p className="caps">Starting price</p>
            </li>
            <li className="flex flex-col gap-8">
              <Counter value={3} suffix=" YR" />
              <p className="caps">Guarantee</p>
            </li>
            <li className="flex flex-col gap-8">
              <Counter value={1} suffix=" HR" />
              <p className="caps">Typical visit</p>
            </li>
          </ul>
        </Specimen>

        <Specimen
          title="GlassCard"
          spec="Smoke fill, beam-12 hairline, 10px radius, 32px padding. Hover: hairline goes to xenon at 40 percent and the card lifts by 2px. No shadow."
        >
          <State label="Default">
            <GlassCard className="flex flex-col gap-16">
              <p className="numeral">Night</p>
              <h4 className="h3">You see less of the road</h4>
              <p className="body">
                A badly oxidized lens scatters light instead of throwing it forward. The part of the road you lose is
                the part furthest away, which is the part you need.
              </p>
            </GlassCard>
          </State>
          <State label="Hover">
            <GlassCard className="flex flex-col gap-16" preview="hover">
              <p className="numeral">Resale</p>
              <h4 className="h3">It ages the whole car</h4>
              <p className="body">
                Yellow headlights read as neglect. On a clean car they are the first thing a buyer or an appraiser
                notices.
              </p>
            </GlassCard>
          </State>
        </Specimen>

        <Specimen
          title="StepRow"
          spec="A numbered process row. Numeral in xenon at 40 percent, h3 title, body copy. The number has a leading zero and is set in mono."
        >
          <ol className="flex flex-col gap-32">
            <StepRow number={1} title="Send photos">
              Text clear pictures of both headlights in daylight. That is enough for us to tell you what we are working
              with.
            </StepRow>
            <StepRow number={2} title="Get your quote">
              A real number, not a range, usually the same day.
            </StepRow>
            <StepRow number={3} title="We come to you">
              Driveway, work parking lot, wherever the car is. You do not have to be there the whole time.
            </StepRow>
          </ol>
        </Specimen>

        <Specimen
          title="Marquee"
          spec="Caps, scrolling horizontally at 40s per loop, beam-54, pauses on hover. A static wrapped list under reduced motion."
          stacked
        >
          {(ground) => (
            <>
              <State label="Running">
                <div className="w-full">
                  <Marquee items={MARQUEE_ITEMS} label={`Service areas, running, on ${ground}`} />
                </div>
              </State>
              <State label="Paused on hover">
                <div className="w-full">
                  <Marquee items={MARQUEE_ITEMS} label={`Service areas, paused, on ${ground}`} preview="hover" />
                </div>
              </State>
            </>
          )}
        </Specimen>

        <Specimen
          title="Cursor"
          spec="Fine pointers only. A 28px ring, 1px beam-54. Over a gallery image: 96px, beam-04 fill. Over a button: 8px, xenon fill. Off for reduced motion and coarse pointers. The live ring follows the pointer on this page."
        >
          <div className="flex flex-wrap items-start gap-48">
            <State label="Default">
              <div className="cursor" data-static="true" data-state="default" />
            </State>
            <State label="Over a gallery image">
              <div className="cursor" data-static="true" data-state="media" />
            </State>
            <State label="Over a button">
              <div className="cursor" data-static="true" data-state="button" />
            </State>
          </div>
        </Specimen>

        <Specimen
          title="PlaceholderFrame"
          spec="Correct aspect ratio, smoke fill, beam-12 dashed hairline, centred caps label with the expected filename and ratio. The four ratios are the only four that exist."
        >
          <div className="grid w-full grid-cols-2 gap-16">
            <PlaceholderFrame file="hero-poster.jpg" ratio="16/9" />
            <PlaceholderFrame file="gallery-01.jpg" ratio="4/3" />
            <PlaceholderFrame file="before-01.jpg" ratio="3/2" />
            <PlaceholderFrame file="owner.jpg" ratio="4/5" />
          </div>
        </Specimen>

        <Specimen
          title="CompareSlider"
          spec="Before underneath, after clipped on top. Drag anywhere, click to position, arrows 4 percent, shift 12, Home and End. A 2px beam seam with the beam glow and a 44px smoke handle. BEFORE in oxide, AFTER in xenon. Opens from 100 to 38 once, on first scroll into view."
        >
          <div className="w-full">
            <CompareSlider
              before={pair.before}
              after={pair.after}
              beforeAlt={pair.beforeAlt}
              afterAlt={pair.afterAlt}
              sizes="(min-width: 1024px) 42vw, 100vw"
            />
          </div>
        </Specimen>

        <Specimen
          title="MediaFrame"
          spec="10px frame, beam-12 hairline, no shadow. Filter stack and a night multiply overlay, oxide tint on before images, xenon tint on after images. Hover lifts the overlay and relaxes the filter over 640ms. An empty slot shows its PlaceholderFrame."
        >
          <div className="grid w-full grid-cols-2 gap-16">
            <State label="Before">
              <MediaFrame slot={pair.before} ratio="3/2" alt={pair.beforeAlt} tone="before" sizes="(min-width: 1024px) 21vw, 50vw" className="w-full" />
            </State>
            <State label="After">
              <MediaFrame slot={pair.after} ratio="3/2" alt={pair.afterAlt} tone="after" sizes="(min-width: 1024px) 21vw, 50vw" className="w-full" />
            </State>
          </div>
        </Specimen>

        <Specimen
          title="TodoChip"
          spec="A small oxide chip reading TODO, with night text, beside every TODO(owner) item in CONTENT.md. The note is its tooltip. Removed in the final pass."
        >
          {todoStat?.todo ? (
            <p className="caps flex items-center gap-8">
              {todoStat.label}
              <TodoChip note={todoStat.todo} />
            </p>
          ) : null}
        </Specimen>

        <Specimen
          title="Check row and caution callout"
          spec="An inclusion: a xenon check, an h3 title and a line of body copy, between beam-12 hairlines. The caution has an oxide border and an oxide chip. Text on oxide is night, never beam."
        >
          <ul className="rule-list w-full">
            {pricing.inclusions.slice(0, 2).map((item) => (
              <li key={item.title} className="check-row">
                <Icon name="check" size={20} className="check-row-icon" />
                <div className="flex flex-col gap-4">
                  <h4 className="h3">{item.title}</h4>
                  <p className="body">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <aside className="caution">
            <p className="caution-chip caps">{pricing.caution.chip}</p>
            <p className="body">{pricing.caution.body}</p>
          </aside>
        </Specimen>

        <Specimen
          title="Stats"
          spec="A row of figures: a numeral over its caps label, each one a Counter. Used for the price and the guarantee."
        >
          <Stats items={hero.stats.slice(0, 2)} />
        </Specimen>

        <Specimen
          title="Tier"
          spec="A tier of the vehicle guide: a smoke card whose short rule and numeral take the tier's assigned accent. Xenon restores well, beam takes extra work, oxide is replace instead."
        >
          <ol className="flex w-full flex-col gap-16">
            {guide.tiers.map((tier, index) => (
              <li key={tier.title} className="tier" data-accent={tier.accent}>
                <div className="tier-copy">
                  <p className="numeral tier-numeral" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h4 className="h3">{tier.title}</h4>
                </div>
              </li>
            ))}
          </ol>
        </Specimen>

        <Specimen
          title="Form"
          spec="Smoke fields, a beam-12 hairline, 10px radius, caps labels. On focus: the focus ring and a 160ms border colour change to xenon, nothing more. The submit is a PrimaryButton."
        >
          {(ground) => (
            <div className="w-full">
              <EnquiryForm
                subject={`${dealer.cta}, specimen on ${ground}`}
                submit={dealer.cta}
                fields={dealer.form.slice(0, 2).map((label) => ({ label }))}
              />
            </div>
          )}
        </Specimen>

        <Specimen
          title="Reviews, placeholder state"
          spec="The state the reviews section holds until the client supplies the Google profile, the rating, the count and three review texts. It is kept out of the page order and only appears here."
          stacked
        >
          <ReviewPlaceholder />
        </Specimen>

        <Specimen
          title="Focus"
          spec="Every interactive element: 2px solid xenon outline, 3px offset, radius inherited. Shown on focus for keyboard and mouse alike."
        >
          <div className="flex flex-wrap items-center gap-32">
            <PrimaryButton href={site.sms.href} preview="focus">
              {site.cta.primary}
            </PrimaryButton>
            <TextLink href={site.email.href} className="body" preview="focus">
              {site.email.display}
            </TextLink>
            <Pill href="/headlight-restoration-oakley-ca" preview="focus">
              Oakley
            </Pill>
          </div>
        </Specimen>

        <Specimen
          title="Footer"
          spec="Night ground, three columns on desktop, stacked on mobile. Service areas as Pills, phone and email as TextLinks, Facebook and Instagram icons at 20px in beam-54. Nothing in it animates."
          stacked
        >
          {(ground) => (
            <div className="w-full overflow-hidden rounded-card border border-beam-12">
              <Footer navLabel={`Footer specimen, on ${ground}`} />
            </div>
          )}
        </Specimen>
      </section>
    </div>
  );
}

function TypeRow({ name, spec, children }: { name: string; spec: string; children: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-12 border-t border-beam-12 pt-24">
      <p className="caps">{name}</p>
      {children}
      <p className="small">{spec}</p>
    </li>
  );
}
