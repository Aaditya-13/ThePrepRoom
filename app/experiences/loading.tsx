export default function ExperiencesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-pulse">
      {/* Title */}
      <div>
        <div className="h-9 w-64 bg-zinc-800/80 rounded-xl" />
      </div>

      {/* 3-Column Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Filter Sidebar Skeleton */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-4">
          <div className="rounded-2xl border border-zinc-800/80 bg-[#111317] p-4 space-y-4">
            <div className="h-5 w-24 bg-zinc-800 rounded-md" />
            <div className="space-y-2 pt-2">
              <div className="h-8 w-full bg-zinc-800/60 rounded-xl" />
              <div className="h-8 w-full bg-zinc-800/60 rounded-xl" />
              <div className="h-8 w-full bg-zinc-800/60 rounded-xl" />
              <div className="h-8 w-full bg-zinc-800/60 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Middle Column: Search & Feed Skeleton */}
        <section className="lg:col-span-6 xl:col-span-6 space-y-4 min-w-0">
          <div className="h-11 w-full bg-zinc-800/60 rounded-xl border border-zinc-800" />

          {/* 3 Mock Feed Cards */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-800/80 bg-[#121418] p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 bg-zinc-800 rounded-md" />
                  <div className="h-5 w-16 bg-zinc-800/80 rounded-full" />
                </div>
                <div className="h-5 w-48 bg-zinc-700/60 rounded-md" />
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-zinc-800/60 rounded-sm" />
                  <div className="h-3 w-4/5 bg-zinc-800/60 rounded-sm" />
                </div>
                <div className="pt-3 border-t border-zinc-800/60 flex justify-between">
                  <div className="h-4 w-28 bg-zinc-800 rounded-md" />
                  <div className="h-4 w-16 bg-zinc-800 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Trending Skeleton */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-4">
          <div className="rounded-2xl border border-zinc-800/80 bg-[#111317] p-4 space-y-3">
            <div className="h-5 w-32 bg-zinc-800 rounded-md" />
            <div className="h-16 w-full bg-zinc-800/50 rounded-xl" />
            <div className="h-16 w-full bg-zinc-800/50 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
