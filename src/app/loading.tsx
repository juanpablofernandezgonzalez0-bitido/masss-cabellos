export default function LoadingPage() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-[var(--border)]" />
      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-[var(--border)]" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-[var(--border)]" />
        ))}
      </div>
    </div>
  );
}
