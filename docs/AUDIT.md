# AUDIT.md

The existing lenzrescue.com, as found on 14 November 2026. This is the baseline the rebuild is
measured against, and the inventory of what already exists.

---

## 1. What the site is today

| | |
|---|---|
| URL | https://lenzrescue.com/ |
| Business | Lenz Rescue, mobile headlight restoration |
| Owner | Adain, son of Kris Poulter. Started at seventeen. |
| Service area | Antioch, Brentwood, Pittsburg, Oakley and surrounding |
| Phone | 925-812-5524 |
| Email | LenzRescue@gmail.com |
| Price | Starting at $125 |
| Guarantee | 3 years, free touch-ups, no published terms |
| Pages | **One.** Every nav item is an in-page anchor. |
| Page weight of the HTML | about 6.5KB |
| Theme colour | `#07170f` |
| Platform | Could not be determined. Asset paths are generic `/assets/...` with no CMS signature. |

Nav anchors: `#top`, `#services`, `#results`, `#guide`, `#about`, `#contact`, `#request`.

Section order: hero, what we do, vehicle guide, previous work, pricing, three steps, our story,
service request form, about, CTA, contact, footer.

---

## 2. What is already good and must survive

Three things. Do not lose them in the rebuild.

1. **The honesty.** The vehicle guide tells customers that some lenses will not come back. Almost
   nobody in this trade says that out loud. It is the strongest trust signal the business has and it
   gets its own page in the rebuild.
2. **The italic in the H1.** "Bring clarity *back to the road.*" The second half is already set in
   italic. That instinct becomes the `.accent` serif style used site-wide, so the type system grows
   out of their own idea rather than being imposed.
3. **The owner story.** A seventeen year old running a real local trade business is specific and
   impossible for a competitor to copy. It needs to be told with more confidence and a lot less
   repetition.

---

## 3. Asset inventory

Everything the site currently has. This is the whole library.

| File | Type | Verdict |
|---|---|---|
| `/assets/logo.jpg` | Logo, JPEG | Must be redrawn as SVG. A JPEG logo cannot sit cleanly on a dark ground and will show compression edges at any size. |
| `/assets/work-01.jpeg` | Work photo | Keep, re-treat, needs real alt text |
| `/assets/work-02.jpeg` | Work photo | Keep, re-treat, needs real alt text |
| `/assets/work-03.jpeg` | Work photo | Keep, re-treat, needs real alt text |
| `/assets/work-04.jpeg` | Work photo | Keep, re-treat, needs real alt text |
| `/assets/work-05.jpeg` | Work photo | Keep, re-treat, needs real alt text |
| `/assets/google-review-qr.png` | QR code | Keep on print and on the contact page only. A QR code on a website that the visitor is already browsing is pointing them nowhere. Replace with a real link to the Google profile. |
| `/assets/square-icon.png` | Icon | Remove. Unlinked, and payment logos in a footer look cheap. |

No video. No stock imagery. No og:image. No favicon beyond `square-icon.png`. No srcset anywhere.

**Note on retrieval.** These files could not be downloaded during this audit. The server returned an
error on every direct image request even though the HTML references them normally. The client or the
developer will need to pull them from the source files or the hosting account directly. This is also
worth flagging to the client as a live problem: if an automated client cannot fetch the images, there
is a reasonable chance some crawlers and link previewers cannot either.

**Also broken, same cause:** `https://lenzrescue.com/assets/` returns the homepage HTML with every
image reference rewritten to `/assets/assets/...`. That is a relative-path bug in whatever is serving
the site.

---

## 4. Problems found

Ordered by how much each one costs the business.

**Commercial**

1. **No social proof at all.** The copy refers to "every review" and shows zero reviews, no rating,
   no count, no names. A QR code is not social proof.
2. **Five unlabelled photos carry all the visual proof.** No before and after pairing, no captions,
   no vehicle named, identical generic alt text on all five. For a business that lives entirely on
   visible transformation, this is the biggest single miss on the site.
3. **Pricing is a dead end.** "Starting at $125" with no range, no fog light price and no worked
   example means every visitor has to text before learning anything. Price anxiety is where most of
   them leave.
4. **The request form asks for seven fields** while the hero tells people to just send a text. Two
   competing paths, and the harder one is the one with the button.
5. **The guarantee has no terms**, stated three times.
6. **No hours anywhere**, so nobody knows when they can be reached.

**Structural and SEO**

7. **One page.** Nothing exists to rank for any service plus city combination, which is how
   essentially all of this business's search demand is phrased.
8. **`/sitemap.xml` and `/sitemap_index.xml` both return the homepage HTML with a 200.** A soft 404
   on both. There is no sitemap.
9. **Generic alt text**, the same string five times.
10. **No structured data.** No LocalBusiness, no Service, no FAQ, no aggregateRating.
11. **No og:image**, so every share and every text message preview is blank.

**Content**

12. **The story is told twice**, in "Our story" and again in "About", in near-identical words.
13. **The 3 year guarantee appears three times.** Repetition is being used in place of proof.
14. **The vehicle guide ends by pushing the decision back to the visitor** ("send photos first")
    before it has shown them any evidence that the work is good.

**Build quality**

15. **Process step numbers render as "1. 1", "2. 2", "3. 3"**, a duplicate-numbering bug in the
    markup, sitting in the middle of the page.
16. **Footer "Z" icon links to `#process`**, which is not a section in the menu and has no label.
17. **Footer Square icon is not a link.**
18. **Footer logo has an empty alt** while the header logo has a real one. Inconsistent, though the
    empty one is arguably correct for a decorative repeat.
19. **Logo is a JPEG.**

---

## 5. The logo

The current logo is a JPEG. Before anything else ships, it needs a vector redraw so it can sit on
`--night` without a visible box, scale to the header and the favicon, and render in a single colour.

Two options to put to the client:

- **Redraw as-is.** Trace the existing mark faithfully to SVG, clean the curves, produce a one-colour
  version in `--beam` for dark backgrounds and one in `--night` for light. Lowest risk, no brand
  argument.
- **Redraw and tighten.** Same mark, but with the letterforms rebuilt in Archivo to match the site's
  type system, so the wordmark and the site are visibly the same family.

`TODO(owner)` which option, and confirm there is no existing vector file sitting on someone's
computer before anyone redraws anything.

---

## 6. What the rebuild has to prove

If the new site does not do these five things better than the old one, it was not worth building.

1. A visitor can see a genuine before and after inside three seconds of landing.
2. A visitor knows roughly what it will cost before they contact anyone.
3. A visitor in Antioch can find the site by searching for headlight restoration in Antioch.
4. A visitor can see that other people in their town have used this business and were happy.
5. A dealer or auction buyer gets a page written for them, with volume pricing, not a page about a
   seventeen year old.
