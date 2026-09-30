export default function QuestionsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
      {/* Title */}
      <div>
        <div className="h-9 w-60 bg-zinc-800/80 rounded-xl" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-[#111317] border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="h-11 w-full bg-zinc-800/60 rounded-xl" />
        <div className="flex flex-wrap gap-2 pt-3 border-t border-zinc-800/80">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-7 w-20 rounded-full bg-zinc-800/70" />
          ))}
        </div>
      </div>

      {/* Questions List Skeleton */}
      <div className="divide-y divide-zinc-800/80 border border-zinc-800/80 rounded-2xl bg-[#121418] overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 rounded-full bg-zinc-800" />
              <div className="h-4 w-24 rounded-full bg-zinc-800/70" />
            </div>
            <div className="h-6 w-3/4 bg-zinc-800 rounded-md" />
            <div className="h-4 w-1/3 bg-zinc-800/60 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
