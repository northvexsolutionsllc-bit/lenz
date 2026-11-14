import Link from "next/link";
import type { ComponentPropsWithRef } from "react";

type SmartLinkProps = Omit<ComponentPropsWithRef<"a">, "href"> & { href: string };

const INTERNAL = /^\/(?!\/)/;
const EXTERNAL = /^https?:\/\//;

// One link element for the whole site. Internal paths go through the Next router,
// tel, sms and mailto links stay plain anchors, and outside sites open in a new tab.
export function SmartLink({ href, children, ...rest }: SmartLinkProps) {
  if (INTERNAL.test(href)) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }

  const outside = EXTERNAL.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <a href={href} {...outside} {...rest}>
      {children}
    </a>
  );
}
