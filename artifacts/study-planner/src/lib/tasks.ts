export const TASK_TYPES = ["מטלה", "בחינה", "חזרה"] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export interface Task {
  id: string;
  course: string;
  title: string;
  type: TaskType;
  dueDate: string; // YYYY-MM-DD local calendar date
  completed: boolean;
  createdAt: number;
}

export type TaskInput = Pick<Task, "course" | "title" | "type" | "dueDate">;
export type Urgency = "overdue" | "soon" | "normal" | "done";

const pad = (n: number) => String(n).padStart(2, "0");

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDateKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const date = new Date(y, mo - 1, d, 12); // noon avoids DST edges
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

/** Whole calendar-day difference (due - today), computed via UTC of local parts: DST safe. */
export function dayDiff(todayKey: string, dueKey: string): number {
  const a = parseDateKey(todayKey), b = parseDateKey(dueKey);
  if (!a || !b) return 0;
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((ub - ua) / 86400000);
}

export function getUrgency(task: Task, todayKey: string): Urgency {
  if (task.completed) return "done";
  const diff = dayDiff(todayKey, task.dueDate);
  if (diff < 0) return "overdue";
  if (diff <= 3) return "soon";
  return "normal";
}

export function relativeLabel(task: Task, todayKey: string): string {
  const diff = dayDiff(todayKey, task.dueDate);
  if (diff === 0) return "היום";
  if (diff === 1) return "מחר";
  if (diff === 2) return "בעוד יומיים";
  if (diff > 2) return `בעוד ${diff} ימים`;
  if (diff === -1) return "אתמול";
  if (diff === -2) return "לפני יומיים";
  return `לפני ${-diff} ימים`;
}

const dateFmt = new Intl.DateTimeFormat("he-IL", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
export function formatDate(key: string): string {
  const d = parseDateKey(key);
  return d ? dateFmt.format(d) : key;
}
const longFmt = new Intl.DateTimeFormat("he-IL", { weekday: "long", day: "numeric", month: "long" });
export function formatToday(key: string): string {
  const d = parseDateKey(key);
  return d ? longFmt.format(d) : "";
}

export function isValidTask(v: unknown): v is Task {
  if (!v || typeof v !== "object") return false;
  const t = v as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.course === "string" &&
    typeof t.title === "string" &&
    typeof t.type === "string" &&
    (TASK_TYPES as readonly string[]).includes(t.type) &&
    typeof t.dueDate === "string" &&
    parseDateKey(t.dueDate) !== null &&
    typeof t.completed === "boolean"
  );
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export type FieldErrors = Partial<Record<keyof TaskInput, string>>;

export function validateTask(input: TaskInput): { value: TaskInput; errors: FieldErrors } {
  const value: TaskInput = {
    course: input.course.trim(),
    title: input.title.trim(),
    type: input.type,
    dueDate: input.dueDate.trim(),
  };
  const errors: FieldErrors = {};
  if (!value.course) errors.course = "יש להזין שם קורס";
  else if (value.course.length > 80) errors.course = "שם הקורס ארוך מדי (עד 80 תווים)";
  if (!value.title) errors.title = "יש להזין כותרת למשימה";
  else if (value.title.length > 140) errors.title = "הכותרת ארוכה מדי (עד 140 תווים)";
  if (!(TASK_TYPES as readonly string[]).includes(value.type)) errors.type = "יש לבחור סוג: מטלה, בחינה או חזרה";
  if (!value.dueDate) errors.dueDate = "יש לבחור תאריך יעד";
  else if (!parseDateKey(value.dueDate)) errors.dueDate = "התאריך אינו תקין, נא לבחור תאריך מלוח השנה";
  return { value, errors };
}
