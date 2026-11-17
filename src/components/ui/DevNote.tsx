type DevNoteProps = {
  /** What is still owed, in the owner's checklist's own words. Null in a production build. */
  note: string | null;
  className?: string;
};

// A working note, for whoever is building the site: a small chip that marks a fact the
// owner has still to confirm, with the note as its tooltip.
//
// It is for development only. In a production build it renders nothing, and the notes
// themselves are left out of the build: every one of them in the content files sits
// behind the same check. A visitor must never be able to read one.
export function DevNote({ note, className }: DevNoteProps) {
  if (process.env.NODE_ENV !== "development" || !note) return null;

  return (
    <span className={className ? `dev-note caps ${className}` : "dev-note caps"} title={note}>
      TODO<span className="sr-only">{` ${note}`}</span>
    </span>
  );
}
