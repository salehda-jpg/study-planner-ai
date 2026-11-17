import { useMemo, useRef, useState } from "react";
import { BookOpenCheck, Plus, Search, X } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { useToday } from "@/hooks/use-today";
import { useToast } from "@/hooks/use-toast";
import { formatToday, getUrgency, type Task, type TaskInput } from "@/lib/tasks";
import { STORAGE_KEY } from "@/lib/storage";
import { TaskFormDialog } from "@/components/planner/task-form-dialog";
import { DeleteDialog } from "@/components/planner/delete-dialog";
import { TaskCard } from "@/components/planner/task-card";
import { StorageBanner } from "@/components/planner/storage-banner";
import { EmptyFiltered, EmptyPlanner } from "@/components/planner/empty-states";
import { Filters, type StatusFilter } from "@/components/planner/filters";

export default function Planner() {
  const today = useToday();
  const { toast } = useToast();
  const store = useTasks();
  const { tasks, readOnly } = store;

  const [status, setStatus] = useState<StatusFilter>("all");
  const [course, setCourse] = useState("");
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const listHeadingRef = useRef<HTMLHeadingElement>(null);

  const courses = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.course))).sort((a, b) => a.localeCompare(b, "he")),
    [tasks],
  );
  const effectiveCourse = course && courses.includes(course) ? course : "";

  const counts = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length;
    const overdue = tasks.filter((t) => getUrgency(t, today) === "overdue").length;
    const soon = tasks.filter((t) => getUrgency(t, today) === "soon").length;
    return { total: tasks.length, completed, pending: tasks.length - completed, overdue, soon };
  }, [tasks, today]);

  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("he");
    const list = tasks.filter(
      (t) =>
        (status === "all" || (status === "pending" ? !t.completed : t.completed)) &&
        (!effectiveCourse || t.course === effectiveCourse) &&
        (!query || t.title.toLocaleLowerCase("he").includes(query) || t.course.toLocaleLowerCase("he").includes(query)),
    );
    return list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (!a.completed) return a.dueDate.localeCompare(b.dueDate) || a.createdAt - b.createdAt;
      return b.dueDate.localeCompare(a.dueDate) || a.createdAt - b.createdAt;
    });
  }, [tasks, status, effectiveCourse, search]);

  const filtersActive = status !== "all" || !!effectiveCourse || !!search.trim();
  const resetFilters = () => { setStatus("all"); setCourse(""); setSearch(""); };

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (t: Task) => { setEditing(t); setFormOpen(true); };

  const saveWarn = () =>
    toast({ variant: "destructive", title: "השמירה נכשלה", description: "השינוי מוצג אך לא נשמר בדפדפן." });

  const handleSubmit = (input: TaskInput) => {
    const ok = editing ? store.updateTask(editing.id, input) : store.addTask(input);
    if (ok) toast({ title: editing ? "המשימה עודכנה" : "המשימה נוספה", description: input.title });
    return ok;
  };

  const handleToggle = (t: Task) => {
    if (!store.toggleTask(t.id)) saveWarn();
  };

  const handleDelete = (t: Task) => {
    const ok = store.deleteTask(t.id);
    setDeleting(null);
    if (ok) toast({ title: "המשימה נמחקה", description: t.title });
    else saveWarn();
    window.setTimeout(() => listHeadingRef.current?.focus(), 50);
  };

  const copyRaw = async () => {
    const raw = store.getCorruptRaw();
    if (!raw) return;
    try {
      await navigator.clipboard.writeText(raw);
      toast({ title: "המידע הועתק", description: "אפשר להדביק אותו בקובץ לשמירה." });
    } catch {
      toast({ variant: "destructive", title: "ההעתקה נכשלה", description: `המידע נשמר תחת המפתח ${STORAGE_KEY} באחסון הדפדפן.` });
    }
  };

  const resetCorrupt = () => {
    const key = store.resetCorrupt();
    if (key) toast({ title: "נוצר גיבוי והרשימה התחילה מחדש", description: `המידע הישן נשמר תחת ${key}.` });
    else toast({ variant: "destructive", title: "לא ניתן היה ליצור גיבוי", description: "לא בוצע שינוי במידע השמור." });
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "בוקר טוב" : hour < 17 ? "צהריים טובים" : hour < 21 ? "ערב טוב" : "לילה טוב";

  const summary =
    counts.total === 0
      ? "המקום שלך לסדר את הסמסטר."
      : counts.overdue > 0
        ? `${counts.overdue === 1 ? "משימה אחת עברה" : `${counts.overdue} משימות עברו`} את מועד היעד. צעד אחד בכל פעם.`
        : counts.soon > 0
          ? `${counts.soon === 1 ? "משימה אחת מתקרבת" : `${counts.soon} משימות מתקרבות`} בימים הקרובים.`
          : counts.pending === 0
            ? "הכול הושלם. מגיע לך רגע של שקט."
            : "אין שום דבר דחוף. זמן טוב להתקדם בנחת.";

  return (
    <div className="planner-bg min-h-[100dvh]">
      <a href="#tasks" className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground">
        דילוג לרשימת המשימות
      </a>
      <header className="relative overflow-hidden bg-[hsl(224_70%_30%)] text-[hsl(210_60%_98%)]">
        <div aria-hidden className="absolute inset-0 opacity-[0.12] [background-image:repeating-linear-gradient(to_bottom,transparent_0_31px,white_31px_32px)]" />
        <div aria-hidden className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[hsl(199_90%_60%)] opacity-25 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-5 pb-24 pt-8 sm:px-8 sm:pt-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/12 ring-1 ring-white/20">
                <BookOpenCheck className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-display text-lg font-bold tracking-tight">מתכנן הלימודים</span>
            </div>
            <p className="text-sm text-white/70" data-testid="text-today">{formatToday(today)}</p>
          </div>
          <h1 className="rise mt-10 font-display text-4xl font-extrabold leading-tight sm:text-5xl">{greeting}.</h1>
          <p className="rise mt-2 max-w-lg text-lg text-white/80" style={{ animationDelay: "80ms" }} data-testid="text-summary">{summary}</p>
        </div>
      </header>

      <main className="relative mx-auto -mt-16 max-w-4xl px-4 pb-24 sm:px-8">
        <section aria-label="סיכום" className="rise grid grid-cols-3 overflow-hidden rounded-3xl border bg-card shadow-xl shadow-primary/10" style={{ animationDelay: "120ms" }}>
          {[
            { label: "סך הכול", value: counts.total, id: "total" },
            { label: "ממתינות", value: counts.pending, id: "pending" },
            { label: "הושלמו", value: counts.completed, id: "completed" },
          ].map((s, i) => (
            <div key={s.id} className={`px-4 py-5 sm:px-7 sm:py-6 ${i > 0 ? "border-r" : ""}`}>
              <p className="text-xs font-semibold text-muted-foreground sm:text-sm">{s.label}</p>
              <p className="mt-1 font-display text-3xl font-bold tabular-nums text-primary sm:text-4xl" data-testid={`count-${s.id}`} aria-live="polite">{s.value}</p>
            </div>
          ))}
        </section>

        <div className="mt-6">
          <StorageBanner state={store.storageState} onRetry={() => store.retrySave()} onReload={store.reload} onReset={resetCorrupt} onCopy={copyRaw} />
        </div>

        <section id="tasks" aria-labelledby="tasks-heading" className="mt-4">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="tasks-heading" ref={listHeadingRef} tabIndex={-1} className="font-display text-2xl font-bold outline-none">המשימות שלי</h2>
              {tasks.length > 0 && (
                <p className="mt-1 text-sm text-muted-foreground" aria-live="polite" data-testid="text-visible-count">
                  מוצגות {visible.length} מתוך {tasks.length}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={openAdd}
              disabled={readOnly}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:opacity-50"
              data-testid="button-add-task"
            >
              <Plus className="h-5 w-5" aria-hidden />
              משימה חדשה
            </button>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-2xl border bg-card/70 p-3 backdrop-blur-sm" role="search" aria-label="חיפוש משימות">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="חיפוש לפי משימה או קורס"
                aria-label="חיפוש לפי משימה או קורס"
                className="min-h-12 w-full rounded-xl border bg-card pe-3 ps-10 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
                data-testid="input-task-search"
              />
            </div>
            <button
              type="button"
              onClick={() => { setSearch(""); searchRef.current?.focus(); }}
              disabled={!search}
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-1 rounded-xl px-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 disabled:cursor-default disabled:opacity-40"
              data-testid="button-clear-search"
            >
              <X className="h-4 w-4" aria-hidden />
              ניקוי חיפוש
            </button>
          </div>

          {tasks.length > 0 && (
            <div className="mt-5 rounded-2xl border bg-card/70 p-4 backdrop-blur-sm">
              <Filters status={status} course={effectiveCourse} courses={courses} onStatus={setStatus} onCourse={setCourse} onReset={resetFilters} active={filtersActive} />
            </div>
          )}

          <div className="mt-5">
            {tasks.length === 0 ? (
              readOnly ? null : <EmptyPlanner onAdd={openAdd} disabled={readOnly} />
            ) : visible.length === 0 ? (
              <EmptyFiltered onReset={resetFilters} />
            ) : (
              <ul className="space-y-3" aria-label="רשימת משימות">
                {visible.map((t, i) => (
                  <TaskCard key={t.id} task={t} today={today} readOnly={readOnly} index={i} onToggle={handleToggle} onEdit={openEdit} onDelete={setDeleting} />
                ))}
              </ul>
            )}
          </div>

          {tasks.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground" aria-label="מקרא צבעים">
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[hsl(356_72%_52%)]" aria-hidden />באיחור</span>
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[hsl(42_95%_52%)]" aria-hidden />היום עד 3 ימים</span>
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />בהמשך</span>
            </div>
          )}
        </section>
      </main>

      <TaskFormDialog open={formOpen} onOpenChange={setFormOpen} task={editing} courses={courses} defaultDate={today} onSubmit={handleSubmit} />
      <DeleteDialog task={deleting} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  );
}
