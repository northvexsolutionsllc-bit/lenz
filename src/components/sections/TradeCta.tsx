"use client";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { dealer } from "@/content/pages";
import { jumpToAnchor } from "@/lib/anchor";

type TradeCtaProps = {
  /** The id of the form section to jump to */
  target: string;
};

// The call to action of /dealer-and-auction. CONTENT.md 6
// It leads to the short form further down the same page.
export function TradeCta({ target }: TradeCtaProps) {
  return (
    <PrimaryButton
      href={`#${target}`}
      onClick={(event) => {
        if (jumpToAnchor(target)) event.preventDefault();
      }}
    >
      {dealer.cta}
    </PrimaryButton>
  );
}
