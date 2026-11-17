import { useCallback, useRef, useState } from "react";
import { backupAndReset, loadTasks, saveTasks, type LoadResult } from "@/lib/storage";
import { newId, type Task, type TaskInput } from "@/lib/tasks";

export type StorageState = "ok" | "corrupt" | "unavailable" | "save-failed";

export function useTasks() {
  const initial = useRef<LoadResult | null>(null);
  if (initial.current === null) initial.current = loadTasks();
  const init = initial.current;

  const [tasks, setTasks] = useState<Task[]>(init.status === "ok" ? init.tasks : []);
  const [storageState, setStorageState] = useState<StorageState>(init.status);
  const corruptRaw = useRef<string | null>(init.status === "corrupt" ? init.raw : null);
  const stateRef = useRef(storageState);
  const tasksRef = useRef(tasks);

  const commit = useCallback((updater: (prev: Task[]) => Task[]) => {
    // Never write while stored data is corrupt: protects the user's original data.
    if (stateRef.current === "corrupt") return false;
    const next = updater(tasksRef.current);
    let ok = true;
    if (stateRef.current !== "unavailable") {
      ok = saveTasks(next);
      const st: StorageState = ok ? "ok" : "save-failed";
      stateRef.current = st;
      setStorageState(st);
    }
    tasksRef.current = next;
    setTasks(next);
    return ok;
  }, []);

  const addTask = useCallback(
    (input: TaskInput) =>
      commit((prev) => [...prev, { ...input, id: newId(), completed: false, createdAt: Date.now() }]),
    [commit],
  );
  const updateTask = useCallback(
    (id: string, input: TaskInput) => commit((prev) => prev.map((t) => (t.id === id ? { ...t, ...input } : t))),
    [commit],
  );
  const toggleTask = useCallback(
    (id: string) => commit((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))),
    [commit],
  );
  const deleteTask = useCallback((id: string) => commit((prev) => prev.filter((t) => t.id !== id)), [commit]);

  const retrySave = useCallback(() => commit((prev) => prev), [commit]);

  const resetCorrupt = useCallback((): string | null => {
    if (!corruptRaw.current) return null;
    const key = backupAndReset(corruptRaw.current);
    if (key) {
      corruptRaw.current = null;
      stateRef.current = "ok";
      setStorageState("ok");
      tasksRef.current = [];
      setTasks([]);
    }
    return key;
  }, []);

  const reload = useCallback(() => {
    const r = loadTasks();
    corruptRaw.current = r.status === "corrupt" ? r.raw : null;
    stateRef.current = r.status;
    setStorageState(r.status);
    tasksRef.current = r.status === "ok" ? r.tasks : [];
    setTasks(tasksRef.current);
  }, []);

  return {
    tasks,
    storageState,
    readOnly: storageState === "corrupt",
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    retrySave,
    resetCorrupt,
    reload,
    getCorruptRaw: () => corruptRaw.current,
  };
}
