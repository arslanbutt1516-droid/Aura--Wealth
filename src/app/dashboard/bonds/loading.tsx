export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 skeleton rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="premium-card p-5">
            <div className="h-5 w-32 skeleton rounded mb-3" />
            <div className="h-10 skeleton rounded-xl mb-2" />
            <div className="h-3 w-24 skeleton rounded" />
          </div>
        ))}
      </div>
      <div className="glass-card p-6">
        <div className="h-5 w-36 skeleton rounded mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 skeleton rounded-xl mb-3" />
        ))}
      </div>
    </div>
  );
}
