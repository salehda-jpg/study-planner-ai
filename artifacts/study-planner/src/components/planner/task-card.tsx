import { Check, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { formatDate, getUrgency, relativeLabel, type Task } from "@/lib/tasks";
import { cn } from "@/lib/utils";

interface Props {
  task: Task;
  today: string;
  readOnly: boolean;
  index: number;
  onToggle: (t: Task) => void;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
}

const urgencyStyle = {
  overdue: { bar: "bg-[hsl(356_72%_52%)]", card: "border-[hsl(356_70%_85%)] bg-[hsl(356_80%_98%)]", chip: "bg-[hsl(356_75%_93%)] text-[hsl(356_65%_36%)]", label: "באיחור" },
  soon: { bar: "bg-[hsl(42_95%_52%)]", card: "border-[hsl(44_85%_78%)] bg-[hsl(46_100%_97%)]", chip: "bg-[hsl(45_95%_88%)] text-[hsl(32_80%_28%)]", label: "בקרוב" },
  normal: { bar: "bg-primary", card: "bg-card", chip: "bg-secondary text-secondary-foreground", label: "" },
  done: { bar: "bg-muted-foreground/30", card: "bg-card/60", chip: "bg-muted text-muted-foreground", label: "הושלם" },
} as const;

const typeStyle: Record<string, string> = {
  "מטלה": "border-primary/30 text-primary",
  "בחינה": "border-[hsl(230_60%_40%)] bg-[hsl(230_60%_40%)] text-white",
  "חזרה": "border-[hsl(199_70%_70%)] text-[hsl(199_80%_30%)]",
};

const iconBtn =
  "inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-40";

export function TaskCard({ task, today, readOnly, index, onToggle, onEdit, onDelete }: Props) {
  const u = getUrgency(task, today);
  const s = urgencyStyle[u];
  return (
    <li
      className={cn(
        "rise group relative flex items-start gap-3 overflow-hidden rounded-2xl border p-4 pr-5 shadow-sm shadow-primary/5 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 sm:items-center sm:gap-4",
        s.card,
      )}
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
      data-testid={`card-task-${task.id}`}
      data-urgency={u}
    >
      <span aria-hidden className={cn("absolute inset-y-0 right-0 w-1.5", s.bar)} />
      <button
        type="button"
        onClick={() => onToggle(task)}
        disabled={readOnly}
        aria-pressed={task.completed}
        aria-label={task.completed ? `ביטול השלמה: ${task.title}` : `סימון כהושלמה: ${task.title}`}
        className={cn(
          "mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 sm:mt-0 disabled:opacity-40",
          task.completed ? "border-primary bg-primary text-primary-foreground scale-100" : "border-primary/35 bg-card text-transparent hover:border-primary hover:text-primary/40",
        )}
        data-testid={`button-toggle-${task.id}`}
      >
        <Check className="h-5 w-5" strokeWidth={3} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-primary" data-testid={`text-course-${task.id}`}>{task.course}</span>
          <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", typeStyle[task.type])}>{task.type}</span>
          {s.label && <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", s.chip)}>{s.label}</span>}
        </div>
        <h3
          className={cn(
            "mt-1 break-words font-display text-lg font-semibold leading-snug transition-colors",
            task.completed && "text-muted-foreground line-through decoration-primary/40 decoration-2",
          )}
          data-testid={`text-title-${task.id}`}
        >
          {task.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground" data-testid={`text-due-${task.id}`}>
          <time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time>
          {!task.completed && (
            <span className={cn("ms-2 font-semibold", u === "overdue" ? "text-[hsl(356_65%_42%)]" : u === "soon" ? "text-[hsl(32_80%_32%)]" : "text-foreground/70")}>
              · {relativeLabel(task, today)}
            </span>
          )}
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:opacity-70 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        {task.completed && (
          <button type="button" onClick={() => onToggle(task)} disabled={readOnly} className={cn(iconBtn, "hidden sm:inline-flex")} aria-label={`החזרה לממתינות: ${task.title}`} title="החזרה לממתינות" data-testid={`button-undo-${task.id}`}>
            <RotateCcw className="h-[18px] w-[18px]" />
          </button>
        )}
        <button type="button" onClick={() => onEdit(task)} disabled={readOnly} className={iconBtn} aria-label={`עריכה: ${task.title}`} title="עריכה" data-testid={`button-edit-${task.id}`}>
          <Pencil className="h-[18px] w-[18px]" />
        </button>
        <button type="button" onClick={() => onDelete(task)} disabled={readOnly} className={cn(iconBtn, "hover:bg-destructive/10 hover:text-destructive")} aria-label={`מחיקה: ${task.title}`} title="מחיקה" data-testid={`button-delete-${task.id}`}>
          <Trash2 className="h-[18px] w-[18px]" />
        </button>
      </div>
    </li>
  );
}
