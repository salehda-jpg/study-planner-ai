import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusFilter = "all" | "pending" | "completed";
const options: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "הכול" },
  { value: "pending", label: "ממתינות" },
  { value: "completed", label: "הושלמו" },
];

interface Props {
  status: StatusFilter;
  course: string;
  courses: string[];
  onStatus: (s: StatusFilter) => void;
  onCourse: (c: string) => void;
  onReset: () => void;
  active: boolean;
}

export function Filters({ status, course, courses, onStatus, onCourse, onReset, active }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end" role="group" aria-label="סינון משימות">
      <fieldset>
        <legend className="mb-1.5 text-xs font-semibold text-muted-foreground">מצב</legend>
        <div className="inline-flex rounded-xl bg-secondary/70 p-1">
          {options.map((o) => (
            <label
              key={o.value}
              className={cn(
                "relative flex min-h-10 cursor-pointer items-center rounded-lg px-4 text-sm font-semibold transition-all has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/25",
                status === o.value ? "bg-card text-primary shadow-sm" : "text-secondary-foreground/70 hover:text-secondary-foreground",
              )}
            >
              <input type="radio" name="status-filter" value={o.value} checked={status === o.value} onChange={() => onStatus(o.value)} className="sr-only" data-testid={`filter-status-${o.value}`} />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="sm:w-56">
        <label htmlFor="course-filter" className="mb-1.5 block text-xs font-semibold text-muted-foreground">קורס</label>
        <div className="relative">
          <select
            id="course-filter"
            value={course}
            onChange={(e) => onCourse(e.target.value)}
            className="min-h-12 w-full appearance-none rounded-xl border bg-card pe-4 ps-10 text-sm font-medium outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-primary/15"
            data-testid="select-course-filter"
          >
            <option value="">כל הקורסים</option>
            {courses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        </div>
      </div>
      {active && (
        <button type="button" onClick={onReset} className="min-h-12 rounded-xl px-4 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25" data-testid="button-reset-filters">
          איפוס סינון
        </button>
      )}
    </div>
  );
}
