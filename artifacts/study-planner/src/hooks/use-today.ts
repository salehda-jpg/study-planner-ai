import { useEffect, useState } from "react";
import { toDateKey } from "@/lib/tasks";

/** Current local calendar date key; refreshes on focus, visibility and every 30s. */
export function useToday(): string {
  const [today, setToday] = useState(() => toDateKey(new Date()));
  useEffect(() => {
    const update = () => setToday(toDateKey(new Date()));
    const onVis = () => { if (document.visibilityState === "visible") update(); };
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", onVis);
    const id = window.setInterval(update, 30_000);
    return () => {
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(id);
    };
  }, []);
  return today;
}
