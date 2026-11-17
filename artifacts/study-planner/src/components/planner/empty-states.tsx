import { NotebookPen, Plus, SearchX } from "lucide-react";

export function EmptyPlanner({ onAdd, disabled }: { onAdd: () => void; disabled: boolean }) {
  return (
    <div className="rise ruled relative overflow-hidden rounded-3xl border border-dashed border-primary/30 bg-card/70 px-6 py-14 text-center" data-testid="empty-planner">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/25">
        <NotebookPen className="h-8 w-8" aria-hidden />
      </div>
      <h2 className="mt-5 font-display text-2xl font-bold">דף חלק, ראש צלול</h2>
      <p className="mx-auto mt-2 max-w-sm leading-relaxed text-muted-foreground">
        עוד אין כאן משימות. התחילו מהדבר הקרוב ביותר: מטלה, בחינה או חזרה, והמתכנן ידאג להזכיר מה דחוף.
      </p>
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:opacity-50"
        data-testid="button-add-first"
      >
        <Plus className="h-5 w-5" aria-hidden />
        הוספת המשימה הראשונה
      </button>
    </div>
  );
}

export function EmptyFiltered({ onReset }: { onReset: () => void }) {
  return (
    <div className="rise rounded-3xl border bg-card/70 px-6 py-12 text-center" data-testid="empty-filtered">
      <SearchX className="mx-auto h-10 w-10 text-primary/60" aria-hidden />
      <h2 className="mt-4 font-display text-xl font-bold">אין משימות שתואמות את הסינון</h2>
      <p className="mt-2 text-muted-foreground">נסו לשנות את הבחירה, או להציג שוב את כל המשימות.</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 min-h-12 rounded-xl border border-primary/30 bg-card px-6 font-semibold text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
        data-testid="button-reset-filters-empty"
      >
        איפוס סינון
      </button>
    </div>
  );
}
