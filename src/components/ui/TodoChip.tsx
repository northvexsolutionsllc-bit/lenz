type TodoChipProps = {
  /** The text that follows TODO(owner) in CONTENT.md, verbatim: what is still needed. */
  note: string;
  className?: string;
};

// A small oxide chip reading TODO. It marks a fact the owner has still to confirm, so the
// client can see exactly what is missing while they review. DECISIONS.md 14
// The note is the tooltip, and is read out after the word by a screen reader.
// Text on oxide is night, never beam. DESIGN.md 2.3
export function TodoChip({ note, className }: TodoChipProps) {
  return (
    <span className={className ? `todo-chip caps ${className}` : "todo-chip caps"} title={note}>
      TODO<span className="sr-only">{` ${note}`}</span>
    </span>
  );
}
