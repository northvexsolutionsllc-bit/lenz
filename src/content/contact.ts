import { booking } from "./home";

// /contact. CONTENT.md gives this page a purpose, "Form, phone, service area, hours",
// and no copy of its own. Everything on it is taken from elsewhere in CONTENT.md, with
// one exception, marked below.

export const contact = {
  // The field names CONTENT.md 2 uses for these values
  labels: { phone: "Phone", email: "Email", hours: "Hours" },

  form: {
    // CONTENT.md 3.7, step 2. It names the form and labels its button.
    title: booking.steps[1].title,
    // NOT IN CONTENT.md. The architecture table calls for a form on this page and the old
    // site's request form is redirected here (DECISIONS.md 10), but no field list is
    // given. These four are the least a quote needs, well short of the seven fields the
    // audit objected to. They are interface labels, supplied in build, to be confirmed.
    fields: [
      { label: "Name", autoComplete: "name" },
      { label: "Phone", type: "tel", autoComplete: "tel" },
      { label: "Vehicle" },
      { label: "Message", multiline: true },
    ],
  },
} as const;
