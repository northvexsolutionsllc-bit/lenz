// The first focusable element on every page. It sits off screen until it takes focus.
// It borrows the primary button's look but not its magnet: it must hold still.
export function SkipLink() {
  return (
    <a href="#main" className="skip-link btn btn-primary">
      <span className="btn-face">
        <span className="caps">Skip to content</span>
      </span>
    </a>
  );
}
