import { site } from "@/content/site";

// Stage 1 holds the home route with the two global strings only. The hero arrives in stage 2.
export default function HomePage() {
  return (
    <section className="section">
      <div className="shell flex flex-col gap-16 pt-96">
        <h1 className="wordmark text-beam">{site.wordmark}</h1>
        <p className="body-l">{site.tagline}</p>
      </div>
    </section>
  );
}
