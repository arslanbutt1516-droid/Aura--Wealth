export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#060714] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-t-sky-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-t-transparent border-r-violet-500 border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-lg tracking-tight">
            Aura <span className="gradient-text">Wealth</span>
          </p>
          <p className="text-slate-500 text-xs mt-1">Loading terminal…</p>
        </div>
      </div>
    </div>
  );
}
