// Setting animation up is not urgent, and a page of sections sets up a lot of it. Done
// all at once, inside the same turn that makes the page interactive, it adds up to one
// long task. So each piece is queued here and run when the main thread is free, a piece
// or two at a time, in the order it was asked for.

type Job = () => void;

// How long a job may be kept waiting when the thread is never idle, in ms
const PATIENCE = 200;
// Run another job in the same turn only if this much idle time is left, in ms
const HEADROOM = 8;

const queue: Job[] = [];
let scheduled = false;

function run(deadline?: IdleDeadline) {
  scheduled = false;
  do {
    queue.shift()?.();
  } while (queue.length > 0 && deadline !== undefined && deadline.timeRemaining() > HEADROOM);
  if (queue.length > 0) schedule();
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(run, { timeout: PATIENCE });
  else window.setTimeout(run, 16);
}

/**
 * Queues `job` for an idle moment. Returns a function that cancels it if it has not run.
 * `first` puts it ahead of everything already waiting: for the one job whose result the
 * others measure against.
 */
export function whenIdle(job: Job, first = false): () => void {
  if (first) queue.unshift(job);
  else queue.push(job);
  schedule();
  return () => {
    const at = queue.indexOf(job);
    if (at >= 0) queue.splice(at, 1);
  };
}
