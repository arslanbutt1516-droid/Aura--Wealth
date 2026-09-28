export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div>
          <div className="h-8 w-56 skeleton rounded-xl mb-2" />
          <div className="h-4 w-44 skeleton rounded-lg" />
        </div>
        <div className="w-8 h-8 skeleton rounded-lg" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="premium-card p-5">
            <div className="w-10 h-10 rounded-xl skeleton mb-3" />
            <div className="h-7 w-20 skeleton mb-2" />
            <div className="h-3 w-28 skeleton" />
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div>
        <div className="h-4 w-28 skeleton rounded mb-3" />
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="premium-card p-4 flex flex-col items-center gap-2.5">
              <div className="w-10 h-10 skeleton rounded-xl" />
              <div className="h-3 w-14 skeleton rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Main grid skeleton */}
      <div className="grid lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-6">
            <div className="h-5 w-40 skeleton rounded mb-5" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-12 skeleton rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
