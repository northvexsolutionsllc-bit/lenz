import fs from "node:fs";
import path from "node:path";

// Server only. Client supplied media lives in public/media under the exact filenames
// listed in DESIGN.md 5. A slot renders its PlaceholderFrame until its file exists, so
// the real files drop in without a code change.

const MEDIA_DIR = path.join(process.cwd(), "public", "media");

export function hasMedia(file: string): boolean {
  return fs.existsSync(path.join(MEDIA_DIR, file));
}

export function mediaSrc(file: string): string {
  return `/media/${file}`;
}

/** A media slot as the components receive it: the expected filename, and its URL once the file exists. */
export type MediaSlot = {
  file: string;
  src: string | null;
};

export function resolveSlot(file: string): MediaSlot {
  return { file, src: hasMedia(file) ? mediaSrc(file) : null };
}
