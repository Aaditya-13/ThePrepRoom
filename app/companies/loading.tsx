export default function CompaniesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      {/* Title */}
      <div>
        <div className="h-9 w-48 bg-zinc-800/80 rounded-xl" />
      </div>

      {/* Search Input Skeleton */}
      <div className="max-w-md h-11 w-full bg-zinc-800/60 rounded-xl border border-zinc-800" />

      {/* Companies Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-800/80 bg-[#121418] p-5 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="h-5 w-32 bg-zinc-800 rounded-md" />
              <div className="h-5 w-16 bg-zinc-800/80 rounded-full" />
            </div>
            <div className="h-4 w-40 bg-zinc-800/60 rounded-md" />
            <div className="flex gap-2 pt-2">
              <div className="h-5 w-20 rounded-full bg-zinc-800/70" />
              <div className="h-5 w-24 rounded-full bg-zinc-800/70" />
            </div>
            <div className="pt-4 border-t border-zinc-800/80 flex justify-between">
              <div className="h-4 w-28 bg-zinc-800 rounded-md" />
              <div className="h-4 w-4 bg-zinc-800 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
