import type { Metadata, Viewport } from "next";
import { Cursor } from "@/components/ui/Cursor";
import { Footer } from "@/components/ui/Footer";
import { Header } from "@/components/ui/Header";
import { SkipLink } from "@/components/ui/SkipLink";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { site } from "@/content/site";
import { tokens } from "@/generated/tokens";
import { hasMedia } from "@/lib/media";
import { archivo, instrumentSerif, jetbrainsMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} | ${site.tagline}`,
};

export const viewport: Viewport = {
  // The client's existing theme colour, kept. It is the pine token. DECISIONS.md 2
  themeColor: tokens.pine,
  colorScheme: "dark",
};

// Runs while the document head is parsed, before first paint. It marks the document as
// script-enabled so CSS can hold animated elements back until their animation is ready.
const MARK_SCRIPT_ENABLED = 'document.documentElement.setAttribute("data-js","")';

export default function RootLayout({ children }: LayoutProps<"/">) {
  const hasLogo = hasMedia("logo.svg");

  return (
    <html
      lang="en"
      className={`${archivo.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MARK_SCRIPT_ENABLED }} />
      </head>
      <body>
        <SkipLink />
        <SmoothScroll>
          <Header hasLogo={hasLogo} />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer hasLogo={hasLogo} />
        </SmoothScroll>
        <Cursor />
      </body>
    </html>
  );
}
