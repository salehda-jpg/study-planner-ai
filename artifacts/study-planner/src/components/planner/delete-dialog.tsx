import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Task } from "@/lib/tasks";

interface Props {
  task: Task | null;
  onCancel: () => void;
  onConfirm: (task: Task) => void;
}

export function DeleteDialog({ task, onCancel, onConfirm }: Props) {
  return (
    <AlertDialog open={!!task} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent dir="rtl" className="rounded-3xl sm:max-w-md">
        <AlertDialogHeader className="text-right sm:text-right">
          <AlertDialogTitle className="font-display text-xl">למחוק את המשימה?</AlertDialogTitle>
          <AlertDialogDescription className="text-base leading-relaxed">
            {task && (
              <>
                המשימה <strong className="text-foreground">"{task.title}"</strong> בקורס{" "}
                <strong className="text-foreground">{task.course}</strong> תימחק לצמיתות. לא ניתן לבטל פעולה זו.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:justify-start sm:space-x-0">
          <AlertDialogAction
            onClick={() => task && onConfirm(task)}
            className="min-h-12 rounded-xl bg-destructive px-6 text-destructive-foreground hover:bg-destructive/90"
            data-testid="button-confirm-delete"
          >
            כן, למחוק
          </AlertDialogAction>
          <AlertDialogCancel className="mt-0 min-h-12 rounded-xl px-6" data-testid="button-cancel-delete">
            השארת המשימה
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
