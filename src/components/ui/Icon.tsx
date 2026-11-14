import type { ReactNode } from "react";

export type IconName = "facebook" | "instagram" | "chevron-left" | "chevron-right" | "arrow-down" | "check" | "star";

const PATHS: Record<IconName, ReactNode> = {
  facebook: <path d="M14 8.5V7a1.5 1.5 0 0 1 1.5-1.5H17v-3h-2.5a4 4 0 0 0-4 4v2H8v3h2.5v10H14v-10h2.6l.4-3z" />,
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.25 6.75h.01" />
    </>
  ),
  "chevron-left": <path d="M14.5 6 8.5 12l6 6" />,
  "chevron-right": <path d="m9.5 6 6 6-6 6" />,
  "arrow-down": <path d="M12 4v16m0 0-6-6m6 6 6-6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  star: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z" />,
};

type IconProps = {
  name: IconName;
  /** Rendered size in px. Icons are drawn on a 24 unit grid. */
  size?: number;
  className?: string;
};

// Stroked line icons that take the current text colour. Always decorative: the element
// that holds an icon carries the accessible name.
export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
