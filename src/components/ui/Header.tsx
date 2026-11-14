"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type Ref } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import { PrimaryButton } from "./PrimaryButton";
import { SmartLink } from "./SmartLink";

const DESKTOP = "(min-width: 1280px)";
const SCROLLED_AFTER = 100; // px. DESIGN.md 6
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

type HeaderProps = {
  /** True once public/media/logo.svg exists. Until then the wordmark is set in type. */
  hasLogo?: boolean;
};

// DESIGN.md 6: transparent over the hero. After 100px of scroll it becomes pine at
// 72 percent with a 16px backdrop blur and a beam-12 bottom hairline. It hides on scroll
// down and shows on scroll up, 320ms. The right side holds the phone number in caps and
// the primary button. Below the desktop breakpoint the nav moves into a full-screen
// smoke sheet with links in h3, staggered in at 60ms each.
export function Header({ hasLogo = false }: HeaderProps) {
  const pathname = usePathname();
  const sheetId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // The menu is open only for the route it was opened on, so any navigation closes it
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  // Scroll state is written straight to the element so scrolling never re-renders React
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    let last = window.scrollY;

    const update = () => {
      const y = window.scrollY;
      header.dataset.scrolled = String(y > SCROLLED_AFTER);
      if (y <= SCROLLED_AFTER) {
        header.dataset.hidden = "false";
        last = y;
        return;
      }
      const delta = y - last;
      if (Math.abs(delta) < 4) return;
      header.dataset.hidden = String(delta > 0);
      last = y;
    };

    const frame = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, [pathname]);

  // While the sheet is open: lock the page behind it, keep focus inside the header and
  // the sheet, close on Escape, and close if the viewport grows past the breakpoint.
  useEffect(() => {
    if (!open) return;

    const header = headerRef.current;
    const sheet = sheetRef.current;
    const toggle = toggleRef.current;
    if (!header || !sheet) return;

    const root = document.documentElement;
    const behind = Array.from(document.querySelectorAll<HTMLElement>("main, .site-footer"));
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    behind.forEach((el) => el.setAttribute("inert", ""));

    const focusables = () =>
      [...header.querySelectorAll<HTMLElement>(FOCUSABLE), ...sheet.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.getClientRects().length > 0,
      );

    sheet.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenOn(null);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        first.focus();
      }
    };

    const desktop = window.matchMedia(DESKTOP);
    const onDesktop = () => {
      if (desktop.matches) setOpenOn(null);
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onDesktop);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onDesktop);
      root.style.overflow = previousOverflow;
      behind.forEach((el) => el.removeAttribute("inert"));
      // Hand focus back to the toggle if it was still inside the sheet
      if (sheet.contains(document.activeElement)) toggle?.focus();
    };
  }, [open]);

  return (
    <>
      <HeaderBar
        ref={headerRef}
        toggleRef={toggleRef}
        hasLogo={hasLogo}
        pathname={pathname}
        open={open}
        sheetId={sheetId}
        onToggle={() => setOpenOn(open ? null : pathname)}
      />
      <MenuSheet ref={sheetRef} id={sheetId} pathname={pathname} open={open} />
    </>
  );
}

type HeaderBarProps = {
  ref?: Ref<HTMLElement>;
  toggleRef?: Ref<HTMLButtonElement>;
  hasLogo?: boolean;
  pathname?: string;
  open?: boolean;
  sheetId?: string;
  onToggle?: () => void;
  /** Styleguide only: render in place instead of fixed, optionally in the scrolled state. */
  specimen?: "top" | "scrolled";
  /** Accessible name of the nav. Only the styleguide specimens override it. */
  navLabel?: string;
};

// The bar itself, with no behaviour of its own
export function HeaderBar({
  ref,
  toggleRef,
  hasLogo,
  pathname,
  open = false,
  sheetId,
  onToggle,
  specimen,
  navLabel = "Primary",
}: HeaderBarProps) {
  return (
    <header
      ref={ref}
      className="site-header"
      data-menu={open ? "open" : "closed"}
      data-static={specimen ? "true" : undefined}
      data-scrolled={specimen ? String(specimen === "scrolled") : undefined}
    >
      <div className="shell flex items-center justify-between gap-24 py-12 xl:py-16">
        <SmartLink href="/" className="wordmark text-beam inline-flex items-center py-12">
          {hasLogo ? (
            <Image src="/media/logo.svg" alt={site.name} width={160} height={32} unoptimized className="h-32 w-auto" />
          ) : (
            site.wordmark
          )}
        </SmartLink>

        <nav aria-label={navLabel} className="hidden xl:block">
          <ul className="flex items-center gap-32">
            {site.nav.map((item) => (
              <li key={item.href}>
                <SmartLink
                  href={item.href}
                  className="nav-link caps"
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-16 xl:gap-24">
          <a href={site.phone.href} className="nav-link caps hidden sm:inline-flex">
            {site.phone.display}
          </a>
          <PrimaryButton href={site.sms.href} className="hidden xl:inline-flex">
            {site.cta.primary}
          </PrimaryButton>
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle xl:hidden"
            aria-expanded={open}
            aria-controls={sheetId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={onToggle}
          >
            <span className="menu-toggle-lines" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}

type MenuSheetProps = {
  ref?: Ref<HTMLDivElement>;
  id?: string;
  pathname?: string;
  open: boolean;
  /** Styleguide only: render in place instead of fixed and full-screen. */
  specimen?: boolean;
  /** Accessible name of the nav. Only the styleguide specimens override it. */
  navLabel?: string;
};

// The mobile menu: a full-screen smoke sheet, links in h3, staggered in at 60ms each
export function MenuSheet({ ref, id, pathname, open, specimen = false, navLabel = "Menu" }: MenuSheetProps) {
  return (
    <div
      id={id}
      ref={ref}
      className={specimen ? "menu-sheet" : "menu-sheet xl:hidden"}
      data-open={open}
      data-static={specimen ? "true" : undefined}
      data-lenis-prevent
      inert={!open}
    >
      <div className={specimen ? "shell flex flex-col gap-48 py-32" : "shell flex min-h-full flex-col justify-between gap-48 pt-96 pb-32"}>
        <nav aria-label={navLabel}>
          <ul className="flex flex-col gap-16">
            {site.nav.map((item, index) => (
              <li key={item.href} className="menu-sheet-item" style={{ "--i": index } as CSSProperties}>
                <SmartLink
                  href={item.href}
                  className="menu-sheet-link h3"
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="menu-sheet-item flex flex-col items-start gap-24" style={{ "--i": site.nav.length } as CSSProperties}>
          <a href={site.phone.href} className="nav-link caps">
            {site.phone.display}
          </a>
          <PrimaryButton href={site.sms.href}>{site.cta.primary}</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
