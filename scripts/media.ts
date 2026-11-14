// Derives the media slots the site uses from the client's original files.
//
//   npm run media
//
// The originals in lenzrescue-assets/ are before and after composites: two photos side by
// side with the words BEFORE and AFTER baked into a band along the bottom. The site needs
// each photo on its own, at the ratios in DESIGN.md section 5, so this script cuts them
// out. Nothing is retouched, recoloured, mirrored or upscaled. Each output is a plain
// rectangle of pixels from one original, re-encoded as JPEG.
//
// The outputs are committed, so the site builds without the originals. Run this again
// only if a crop box below changes. When the client supplies properly matched pairs
// (CONTENT.md section 11, item 6), drop them into public/media under the same filenames
// and delete the matching entries here.
//
// Pair crops are chosen so the lens sits in roughly the same place in both halves, which
// is what lets the comparison slider read as one lens. work-02 is split on a diagonal and
// cannot be cut into a matching pair, so slot 02 stays empty.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE = "lenzrescue-assets";
const OUT = path.join("public", "media");

type Crop = {
  /** Output filename, exactly as listed in DESIGN.md section 5 */
  out: string;
  source: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

const CROPS: Crop[] = [
  // Comparison pairs, 3/2
  { out: "before-01.jpg", source: "work-01.jpeg", left: 0, top: 16, width: 550, height: 367 },
  { out: "after-01.jpg", source: "work-01.jpeg", left: 629, top: 26, width: 550, height: 367 },
  { out: "before-03.jpg", source: "work-03.jpeg", left: 250, top: 100, width: 620, height: 413 },
  { out: "after-03.jpg", source: "work-03.jpeg", left: 1020, top: 12, width: 1000, height: 667 },
  { out: "before-04.jpg", source: "work-04.jpeg", left: 0, top: 12, width: 1000, height: 667 },
  { out: "after-04.jpg", source: "work-04.jpeg", left: 1020, top: 12, width: 1000, height: 667 },
  { out: "before-05.jpg", source: "work-05.jpeg", left: 0, top: 12, width: 1000, height: 667 },
  { out: "after-05.jpg", source: "work-05.jpeg", left: 1228, top: 0, width: 645, height: 430 },

  // Gallery tiles, 4/3: the finished half of each composite
  { out: "gallery-01.jpg", source: "work-01.jpeg", left: 606, top: 0, width: 533, height: 400 },
  { out: "gallery-02.jpg", source: "work-02.jpeg", left: 465, top: 65, width: 490, height: 367 },
  { out: "gallery-03.jpg", source: "work-03.jpeg", left: 1038, top: 0, width: 923, height: 692 },
  { out: "gallery-04.jpg", source: "work-04.jpeg", left: 1020, top: 0, width: 923, height: 692 },
  { out: "gallery-05.jpg", source: "work-05.jpeg", left: 1040, top: 0, width: 923, height: 692 },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const crop of CROPS) {
    const file = path.join(OUT, crop.out);
    await sharp(path.join(SOURCE, crop.source))
      .extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(file);
    console.info(`${crop.out}  ${crop.width}x${crop.height}  from ${crop.source}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
