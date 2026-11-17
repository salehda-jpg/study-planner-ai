import { isValidTask, type Task } from "./tasks";

export const STORAGE_KEY = "study-planner.tasks.v1";

export type LoadResult =
  | { status: "ok"; tasks: Task[] }
  | { status: "corrupt"; raw: string }
  | { status: "unavailable" };

function getStorage(): Storage | null {
  try {
    const s = window.localStorage;
    const probe = "__sp_probe__";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export function loadTasks(): LoadResult {
  const s = getStorage();
  if (!s) return { status: "unavailable" };
  let raw: string | null;
  try {
    raw = s.getItem(STORAGE_KEY);
  } catch {
    return { status: "unavailable" };
  }
  if (raw === null) return { status: "ok", tasks: [] };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isValidTask)) return { status: "corrupt", raw };
    return { status: "ok", tasks: parsed };
  } catch {
    return { status: "corrupt", raw };
  }
}

export function saveTasks(tasks: Task[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}

/** Copies corrupt data to a backup key, then starts fresh. Returns backup key or null. */
export function backupAndReset(raw: string): string | null {
  try {
    const key = `${STORAGE_KEY}.backup-${Date.now()}`;
    window.localStorage.setItem(key, raw);
    window.localStorage.setItem(STORAGE_KEY, "[]");
    return key;
  } catch {
    return null;
  }
}
