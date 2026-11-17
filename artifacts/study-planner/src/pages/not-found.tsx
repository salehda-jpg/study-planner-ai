import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="planner-bg flex min-h-[100dvh] items-center justify-center px-5">
      <div className="rise max-w-md rounded-3xl border bg-card p-8 text-center shadow-xl shadow-primary/10">
        <p className="font-display text-5xl font-extrabold text-primary">404</p>
        <h1 className="mt-3 font-display text-2xl font-bold">הדף לא נמצא</h1>
        <p className="mt-2 text-muted-foreground">הכתובת הזו לא קיימת. המשימות שלך מחכות בדף הראשי.</p>
        <Link href="/" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground" data-testid="link-home">
          חזרה למתכנן
        </Link>
      </div>
    </div>
  );
}
