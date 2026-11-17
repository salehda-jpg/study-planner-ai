import { AlertTriangle, HardDrive } from "lucide-react";
import type { StorageState } from "@/hooks/use-tasks";

interface Props {
  state: StorageState;
  onRetry: () => void;
  onReload: () => void;
  onReset: () => void;
  onCopy: () => void;
}

const btn =
  "min-h-11 rounded-xl border border-current/20 bg-card px-4 text-sm font-semibold transition-colors hover:bg-card/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25";

export function StorageBanner({ state, onRetry, onReload, onReset, onCopy }: Props) {
  if (state === "ok") return null;
  const content = {
    corrupt: {
      title: "לא הצלחנו לקרוא את המשימות השמורות",
      body: "המידע השמור בדפדפן נראה פגום. כדי לא לאבד אותו, המתכנן נמצא כעת במצב קריאה בלבד ולא ישמור דבר מעליו. אפשר להעתיק את המידע הגולמי, לנסות לטעון שוב, או לגבות אותו ולהתחיל רשימה חדשה.",
    },
    unavailable: {
      title: "האחסון בדפדפן אינו זמין",
      body: "ייתכן שמדובר בגלישה פרטית או בהגדרות חסימה. אפשר להמשיך לעבוד, אבל המשימות לא יישמרו לאחר סגירת הדף.",
    },
    "save-failed": {
      title: "השמירה האחרונה לא הצליחה",
      body: "השינויים מוצגים במסך אך לא נשמרו בדפדפן. ייתכן שהאחסון מלא. נסו שוב בעוד רגע.",
    },
  }[state];
  const Icon = state === "unavailable" ? HardDrive : AlertTriangle;
  return (
    <div role="alert" className="rise mb-6 rounded-2xl border border-[hsl(356_70%_85%)] bg-[hsl(356_80%_97%)] p-4 text-[hsl(356_60%_30%)] sm:p-5" data-testid="banner-storage">
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <div className="flex-1">
          <p className="font-display font-semibold">{content.title}</p>
          <p className="mt-1 text-sm leading-relaxed">{content.body}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {state === "corrupt" && (
              <>
                <button type="button" className={btn} onClick={onCopy} data-testid="button-copy-raw">העתקת המידע הגולמי</button>
                <button type="button" className={btn} onClick={onReload} data-testid="button-reload-storage">ניסיון טעינה חוזר</button>
                <button type="button" className={btn} onClick={onReset} data-testid="button-reset-storage">גיבוי והתחלה מחדש</button>
              </>
            )}
            {state === "save-failed" && (
              <button type="button" className={btn} onClick={onRetry} data-testid="button-retry-save">ניסיון שמירה חוזר</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
