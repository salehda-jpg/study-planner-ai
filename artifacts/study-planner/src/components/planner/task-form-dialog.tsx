import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TASK_TYPES, validateTask, type FieldErrors, type Task, type TaskInput, type TaskType } from "@/lib/tasks";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  courses: string[];
  defaultDate: string;
  onSubmit: (input: TaskInput) => boolean;
}

const fieldCls =
  "w-full min-h-12 rounded-xl border bg-card px-4 text-base text-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-4 focus:ring-primary/15 placeholder:text-muted-foreground/70";

export function TaskFormDialog({ open, onOpenChange, task, courses, defaultDate, onSubmit }: Props) {
  const uid = useId();
  const [values, setValues] = useState<TaskInput>({ course: "", title: "", type: "מטלה", dueDate: defaultDate });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const refs = {
    course: useRef<HTMLInputElement>(null),
    title: useRef<HTMLInputElement>(null),
    type: useRef<HTMLInputElement>(null),
    dueDate: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    if (open) {
      setValues(task ? { course: task.course, title: task.title, type: task.type, dueDate: task.dueDate } : { course: "", title: "", type: "מטלה", dueDate: defaultDate });
      setErrors({});
      setSaveError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task]);

  const set = <K extends keyof TaskInput>(k: K, v: TaskInput[K]) => {
    setValues((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const { value, errors: errs } = validateTask(values);
    setErrors(errs);
    const first = (["course", "title", "type", "dueDate"] as const).find((k) => errs[k]);
    if (first) {
      refs[first].current?.focus();
      return;
    }
    const ok = onSubmit(value);
    if (!ok) {
      setSaveError("השמירה בדפדפן נכשלה. ייתכן שהאחסון מלא או חסום. השינוי מוצג כעת אך עלול לא להישמר.");
      return;
    }
    onOpenChange(false);
  };

  const err = (k: keyof TaskInput) =>
    errors[k] ? (
      <p id={`${uid}-${k}-err`} role="alert" className="mt-1.5 text-sm font-medium text-destructive" data-testid={`error-${k}`}>
        {errors[k]}
      </p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-h-[92dvh] overflow-y-auto rounded-3xl border-card-border p-0 sm:max-w-lg">
        <div className="ruled rounded-t-3xl border-b bg-secondary/60 px-6 pb-5 pt-6">
          <DialogHeader className="text-right sm:text-right">
            <DialogTitle className="font-display text-2xl font-bold text-foreground">
              {task ? "עריכת משימה" : "משימה חדשה"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {task ? "אפשר לעדכן כל פרט. השינויים נשמרים במכשיר שלך." : "כמה פרטים קטנים, ופינה אחת פחות להחזיק בראש."}
            </DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={submit} noValidate className="space-y-5 px-6 pb-6 pt-5">
          <div>
            <label htmlFor={`${uid}-course`} className="mb-1.5 block text-sm font-semibold">
              שם הקורס <span className="text-destructive" aria-hidden>*</span>
            </label>
            <input
              ref={refs.course}
              id={`${uid}-course`}
              list={`${uid}-courses`}
              className={cn(fieldCls, errors.course && "border-destructive")}
              value={values.course}
              onChange={(e) => set("course", e.target.value)}
              placeholder="לדוגמה: מבוא לסטטיסטיקה"
              aria-required="true"
              aria-invalid={!!errors.course}
              aria-describedby={errors.course ? `${uid}-course-err` : undefined}
              autoComplete="off"
              data-testid="input-course"
            />
            <datalist id={`${uid}-courses`}>
              {courses.map((c) => <option key={c} value={c} />)}
            </datalist>
            {err("course")}
          </div>

          <div>
            <label htmlFor={`${uid}-title`} className="mb-1.5 block text-sm font-semibold">
              כותרת המשימה <span className="text-destructive" aria-hidden>*</span>
            </label>
            <input
              ref={refs.title}
              id={`${uid}-title`}
              className={cn(fieldCls, errors.title && "border-destructive")}
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="לדוגמה: תרגיל בית 3"
              aria-required="true"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? `${uid}-title-err` : undefined}
              autoComplete="off"
              data-testid="input-title"
            />
            {err("title")}
          </div>

          <fieldset aria-describedby={errors.type ? `${uid}-type-err` : undefined}>
            <legend className="mb-1.5 block text-sm font-semibold">
              סוג <span className="text-destructive" aria-hidden>*</span>
            </legend>
            <div className="grid grid-cols-3 gap-2" role="radiogroup">
              {TASK_TYPES.map((t, i) => (
                <label
                  key={t}
                  className={cn(
                    "flex min-h-12 cursor-pointer items-center justify-center rounded-xl border bg-card text-base font-medium transition-all has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/20",
                    values.type === t ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20" : "hover:border-primary/50 hover:bg-secondary/50",
                  )}
                >
                  <input
                    ref={i === 0 ? refs.type : undefined}
                    type="radio"
                    name={`${uid}-type`}
                    value={t}
                    checked={values.type === t}
                    onChange={() => set("type", t as TaskType)}
                    className="sr-only"
                    data-testid={`radio-type-${i}`}
                  />
                  {t}
                </label>
              ))}
            </div>
            {err("type")}
          </fieldset>

          <div>
            <label htmlFor={`${uid}-date`} className="mb-1.5 block text-sm font-semibold">
              תאריך יעד <span className="text-destructive" aria-hidden>*</span>
            </label>
            <input
              ref={refs.dueDate}
              id={`${uid}-date`}
              type="date"
              className={cn(fieldCls, "text-right", errors.dueDate && "border-destructive")}
              value={values.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.dueDate}
              aria-describedby={errors.dueDate ? `${uid}-dueDate-err` : undefined}
              data-testid="input-due-date"
            />
            {err("dueDate")}
          </div>

          {saveError && (
            <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{saveError}</p>
          )}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-start">
            <button
              type="submit"
              className="min-h-12 rounded-xl bg-primary px-6 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
              data-testid="button-save-task"
            >
              {task ? "שמירת שינויים" : "הוספת משימה"}
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="min-h-12 rounded-xl border bg-card px-6 font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              data-testid="button-cancel-task"
            >
              ביטול
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
