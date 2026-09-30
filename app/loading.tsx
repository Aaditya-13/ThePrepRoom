export default function Loading() {
  return (
    <div className="min-h-screen bg-[#090a0d] text-white">
      {/* Hero Skeleton */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 min-h-[calc(100vh-4rem)] flex items-center py-10 lg:py-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="h-12 sm:h-16 w-3/4 bg-zinc-800/60 rounded-2xl animate-pulse mx-auto lg:mx-0" />
              <div className="h-6 w-1/2 bg-zinc-800/40 rounded-xl animate-pulse mx-auto lg:mx-0" />
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <div className="h-12 w-44 rounded-full bg-blue-600/30 animate-pulse" />
                <div className="h-12 w-44 rounded-full bg-zinc-800/60 animate-pulse" />
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-80 h-72 rounded-3xl bg-zinc-800/40 animate-pulse border border-zinc-800/60" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
