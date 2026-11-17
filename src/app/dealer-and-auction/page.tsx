import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { TRADE_FORM_ID, TradeForm, TradePoints, VolumePricing } from "@/components/sections/Trade";
import { TradeCta } from "@/components/sections/TradeCta";
import { PageHero } from "@/components/ui/PageHero";
import { dealer } from "@/content/pages";
import { getRoute } from "@/content/routes";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";

const PATH = "/dealer-and-auction";

export const metadata: Metadata = pageMetadata({ path: PATH });

// The trade service page. CONTENT.md 6, DECISIONS.md 5
// A different audience and a different voice: no story, no first names, no consumer
// call to action. Volume, consistency, turnaround, and a short form.
export default function DealerAndAuctionPage() {
  return (
    <>
      {/* No price in the structured data: volume pricing is still owed by the owner */}
      <JsonLd
        data={[
          serviceSchema({ path: PATH, name: getRoute(PATH).name }),
          breadcrumbSchema(PATH),
        ]}
      />

      <PageHero lead={dealer.lead} actions={<TradeCta target={TRADE_FORM_ID} />}>
        {dealer.title.plain} <span className="accent">{dealer.title.accent}</span>
      </PageHero>

      <TradePoints />
      <VolumePricing />
      <TradeForm />
    </>
  );
}
