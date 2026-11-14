import { Counter } from "./Counter";
import { TodoChip } from "./TodoChip";

export type Stat = {
  value: number;
  prefix: string;
  suffix: string;
  label: string;
  todo: string | null;
};

type StatsProps = {
  items: ReadonlyArray<Stat>;
  className?: string;
};

// A row of figures: a numeral over its caps label. The label is the term, so it comes
// first in the markup and second on screen.
export function Stats({ items, className }: StatsProps) {
  return (
    <dl className={className ? `stat-row ${className}` : "stat-row"}>
      {items.map((stat) => (
        <div key={stat.label} className="stat">
          <dt className="caps flex items-center gap-8">
            {stat.label}
            {stat.todo ? <TodoChip note={stat.todo} /> : null}
          </dt>
          <dd>
            <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
