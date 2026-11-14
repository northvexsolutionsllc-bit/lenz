"use client";

import type { FormEvent } from "react";
import { site } from "@/content/site";
import { PrimaryButton } from "./PrimaryButton";

export type EnquiryField = {
  label: string;
  type?: "text" | "tel" | "number";
  autoComplete?: string;
  /** A larger, multi-line field */
  multiline?: boolean;
};

type EnquiryFormProps = {
  /** Names the form, and becomes the subject of the message it writes */
  subject: string;
  fields: ReadonlyArray<EnquiryField>;
  /** The label of the submit button */
  submit: string;
};

// A short enquiry form. DESIGN.md 2.1 and 4: smoke fields, a beam-12 hairline, 10px
// radius. MOTION.md 8: a field does nothing beyond the focus ring and a 160ms border
// colour change.
//
// No form service is specified for this site, and every route is static, so the form
// writes an email: submitting it opens the visitor's mail app with the message addressed
// to the business and filled in. Without script the browser does the same from the
// form's own mailto action. Swap this for a form service by changing onSubmit alone.
export function EnquiryForm({ subject, fields, submit }: EnquiryFormProps) {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = fields.map((field) => `${field.label}: ${String(data.get(field.label) ?? "").trim()}`).join("\n");
    // A mailto address, handed to the mail app. The page itself stays where it is.
    window.open(`${site.email.href}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_self");
  };

  return (
    <form className="form" action={site.email.href} method="post" encType="text/plain" aria-label={subject} onSubmit={onSubmit}>
      {fields.map((field) => (
        <label key={field.label} className="field">
          <span className="caps">{field.label}</span>
          {field.multiline ? (
            <textarea className="field-input body" name={field.label} rows={4} required />
          ) : (
            <input
              className="field-input body"
              name={field.label}
              type={field.type ?? "text"}
              autoComplete={field.autoComplete}
              min={field.type === "number" ? 1 : undefined}
              required
            />
          )}
        </label>
      ))}
      <PrimaryButton type="submit">{submit}</PrimaryButton>
    </form>
  );
}
