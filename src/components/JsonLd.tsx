type JsonLdProps = {
  /** One or more schema.org objects. Each is written as its own block. */
  data: object | object[];
};

// Structured data for a page. CONTENT.md 10
// A plain script element, as the Next.js guide recommends, with "<" escaped so that no
// string in the data can close the element early.
export function JsonLd({ data }: JsonLdProps) {
  const blocks = Array.isArray(data) ? data : [data];

  return (
    <>
      {blocks.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}
