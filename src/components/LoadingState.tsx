export function Spinner({ className = "size-3.5" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`${className} inline-block shrink-0 animate-spin rounded-full border border-current border-r-transparent motion-reduce:animate-none`}
    />
  )
}

export function DocumentGridSkeleton({
  count = 4,
  compact = false,
}: {
  count?: number
  compact?: boolean
}) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className={`border-b border-r border-[#cfcdc4] p-5 sm:p-6 ${
            compact ? "min-h-52" : "min-h-64 sm:min-h-72"
          }`}
        >
          <div className="h-full animate-pulse motion-reduce:animate-none">
            <div className="mb-10 flex justify-between">
              <div className="h-2 w-5 rounded-full bg-[#dedcd4]" />
              <div className="h-2 w-10 rounded-full bg-[#dedcd4]" />
            </div>
            <div className="h-6 w-2/3 rounded-sm bg-[#dedcd4]" />
            <div className="mt-3 h-6 w-1/2 rounded-sm bg-[#e8e6df]" />
            <div className="mt-20 space-y-2">
              <div className="h-2 w-full rounded-full bg-[#e2e0d8]" />
              <div className="h-2 w-5/6 rounded-full bg-[#e2e0d8]" />
              <div className="h-2 w-2/3 rounded-full bg-[#e2e0d8]" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export function LibraryLoadingScreen() {
  return (
    <main
      className="min-h-screen bg-[#f5f4ef] px-5 py-6 text-[#191918] sm:px-8 sm:py-8 lg:px-12"
      aria-busy="true"
      aria-label="Loading documents"
    >
      <div className="mx-auto max-w-[1360px]">
        <header className="flex items-center justify-between">
          <div className="size-8 animate-pulse bg-[#191918] motion-reduce:animate-none" />
          <div className="h-9 w-32 animate-pulse bg-[#dedcd4] motion-reduce:animate-none" />
        </header>
        <section className="pt-24 sm:pt-32 lg:pt-40">
          <div className="mb-8 border-b border-[#cfcdc4] pb-5 sm:mb-10">
            <div className="mb-4 h-2.5 w-20 animate-pulse rounded-full bg-[#d5d3cb] motion-reduce:animate-none" />
            <div className="h-12 w-56 animate-pulse rounded-sm bg-[#dedcd4] motion-reduce:animate-none sm:h-16 sm:w-72" />
          </div>
          <div className="grid grid-cols-1 border-l border-t border-[#cfcdc4] sm:grid-cols-2 xl:grid-cols-4">
            <DocumentGridSkeleton />
          </div>
        </section>
      </div>
    </main>
  )
}

export function ComposerLoadingScreen() {
  return (
    <main
      className="min-h-screen bg-[#fbfaf7] text-[#191918]"
      aria-busy="true"
      aria-label="Opening document"
    >
      <header className="fixed inset-x-0 top-0 flex h-16 items-center justify-between px-4 sm:px-7">
        <div className="size-9 animate-pulse rounded-full bg-[#e3e1d9] motion-reduce:animate-none" />
        <div className="h-9 w-24 animate-pulse bg-[#dedcd4] motion-reduce:animate-none" />
      </header>
      <div className="mx-auto max-w-[760px] animate-pulse px-6 pb-32 pt-32 motion-reduce:animate-none sm:px-10 sm:pt-40">
        <div className="h-16 w-4/5 rounded-sm bg-[#e3e1d9] sm:h-20" />
        <div className="mt-14 space-y-4">
          <div className="h-3 w-full rounded-full bg-[#e8e6df]" />
          <div className="h-3 w-11/12 rounded-full bg-[#e8e6df]" />
          <div className="h-3 w-4/5 rounded-full bg-[#e8e6df]" />
          <div className="h-3 w-9/12 rounded-full bg-[#e8e6df]" />
        </div>
      </div>
    </main>
  )
}

export function LoginLoadingScreen() {
  return (
    <main
      className="grid min-h-screen place-items-center bg-[#f5f4ef] px-5 text-[#191918]"
      aria-busy="true"
      aria-label="Loading sign in"
    >
      <div className="w-full max-w-[420px] border border-[#cfcdc4] bg-[#fbfaf7] p-7 sm:p-10">
        <div className="size-9 animate-pulse bg-[#191918] motion-reduce:animate-none" />
        <div className="mt-12 h-2.5 w-28 animate-pulse rounded-full bg-[#dedcd4] motion-reduce:animate-none" />
        <div className="mt-4 h-10 w-3/4 animate-pulse rounded-sm bg-[#dedcd4] motion-reduce:animate-none" />
        <div className="mt-5 h-3 w-full animate-pulse rounded-full bg-[#e8e6df] motion-reduce:animate-none" />
        <div className="mt-10 space-y-5">
          <div className="h-11 animate-pulse bg-[#e3e1d9] motion-reduce:animate-none" />
          <div className="h-11 animate-pulse bg-[#e3e1d9] motion-reduce:animate-none" />
          <div className="h-11 animate-pulse bg-[#191918] motion-reduce:animate-none" />
        </div>
      </div>
    </main>
  )
}
