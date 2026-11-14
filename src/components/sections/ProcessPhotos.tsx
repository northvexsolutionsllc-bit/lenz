import { MediaFrame } from "@/components/ui/MediaFrame";
import { process } from "@/content/home";
import { resolveSlot } from "@/lib/media";

// The four process photo slots from DESIGN.md 5: process-01.jpg to process-04.jpg, one
// per stage, 3/2. They sit under the process on the service page.
//
// Alt text follows the CONTENT.md 9 pattern, "[Stage name] stage of headlight
// restoration, [what is visible]". What is visible can only be said once a photo exists,
// so until then the alt text is the first half of the pattern.
export function ProcessPhotos() {
  return (
    <ul className="grid grid-cols-2 gap-16 pt-48 lg:grid-cols-4 lg:gap-24">
      {process.stages.map((stage, index) => (
        <li key={stage.title} className="flex flex-col gap-12">
          <MediaFrame
            slot={resolveSlot(`process-0${index + 1}.jpg`)}
            ratio="3/2"
            alt={`${stage.title} stage of headlight restoration`}
            sizes="(min-width: 1024px) 22vw, 46vw"
          />
          <p className="caps">{stage.title}</p>
        </li>
      ))}
    </ul>
  );
}
