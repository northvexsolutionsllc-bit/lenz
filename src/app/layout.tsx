import type { Metadata, Viewport } from "next";
import { JsonLd } from "@/components/JsonLd";
import { Cursor } from "@/components/ui/Cursor";
import { Footer } from "@/components/ui/Footer";
import { Header } from "@/components/ui/Header";
import { SkipLink } from "@/components/ui/SkipLink";
import { Clarity } from "@/components/providers/Clarity";
import { PageTransition } from "@/components/providers/PageTransition";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { site } from "@/content/site";
import { tokens } from "@/generated/tokens";
import { hasMedia } from "@/lib/media";
import { pageMetadata } from "@/lib/metadata";
import { businessSchema } from "@/lib/schema";
import { archivo, instrumentSerif, jetbrainsMono } from "./fonts";
import "./globals.css";

// The defaults every route starts from. Each page then sets its own with pageMetadata.
// The icon is drawn at build time by scripts/generate.ts.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  ...pageMetadata({ path: "/", title: `${site.name} | ${site.tagline}` }),
  alternates: undefined,
  icons: { icon: { url: "/generated/icon.svg", type: "image/svg+xml" } },
};

export const viewport: Viewport = {
  // The client's existing theme colour, kept. It is the pine token. DECISIONS.md 2
  themeColor: tokens.pine,
  colorScheme: "dark",
};

// Runs while the document head is parsed, before first paint. It marks the document as
// script-enabled so CSS can hold animated elements back until their animation is ready.
const MARK_SCRIPT_ENABLED = 'document.documentElement.setAttribute("data-js","")';

// DECISIONS.md 10. The old site was one page of anchors, and a fragment never reaches the
// server. So on a first load of the home page with one of the old anchors, this sends the
// visitor to the page that replaced it. location.replace drops the hash on the way.
const OLD_ANCHORS: Record<string, string> = {
  "#services": "/headlight-restoration",
  "#results": "/gallery",
  "#guide": "/vehicle-guide",
  "#about": "/about",
  "#contact": "/contact",
  "#request": "/contact",
  "#process": "/headlight-restoration",
};
const REDIRECT_OLD_ANCHORS = `(function(){var to=${JSON.stringify(OLD_ANCHORS)}[location.hash];if(location.pathname==="/"&&to)location.replace(to)})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  const hasLogo = hasMedia("logo.svg");

  return (
    <html
      lang="en"
      className={`${archivo.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `${REDIRECT_OLD_ANCHORS};${MARK_SCRIPT_ENABLED}` }} />
      </head>
      <body>
        {/* The business itself, on every page. CONTENT.md 10 */}
        <JsonLd data={businessSchema()} />
        <SkipLink />
        <SmoothScroll>
          <PageTransition>
            <Header hasLogo={hasLogo} />
            <main id="main" tabIndex={-1}>
              {children}
            </main>
            <Footer hasLogo={hasLogo} />
            <Clarity />
          </PageTransition>
        </SmoothScroll>
        <Cursor />
      </body>
    </html>
  );
}
