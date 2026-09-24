type WorkspaceLoadingVariant = "home" | "list" | "map" | "form" | "table";

function SkeletonBlock({ className }: { className: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-(--khvi-radius-sm) bg-(--khvi-teal)/12 ${className}`} />;
}

function LoadingHeader() {
  return (
    <header aria-hidden="true" className="border-b border-[#d6e0e4] bg-white">
      <div className="mx-auto flex min-h-18 max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <SkeletonBlock className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 space-y-2">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="h-2.5 w-40 max-w-[42vw]" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-9 w-20" />
          <SkeletonBlock className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </header>
  );
}

function PageHeading({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-3">
      <SkeletonBlock className="h-3 w-32" />
      <SkeletonBlock className={compact ? "h-8 w-56" : "h-10 w-72 max-w-[80vw]"} />
      <SkeletonBlock className="h-3.5 w-full max-w-2xl" />
      <SkeletonBlock className="h-3.5 w-4/5 max-w-xl" />
    </div>
  );
}

function RequestCards() {
  return (
    <div className="mt-6 grid gap-3">
      {["one", "two", "three"].map((key) => (
        <div key={key} className="border border-[#d6e0e4] bg-white p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex gap-2">
                <SkeletonBlock className="h-6 w-20" />
                <SkeletonBlock className="h-6 w-24" />
              </div>
              <SkeletonBlock className="h-5 w-64 max-w-[80%]" />
              <SkeletonBlock className="h-3 w-full max-w-2xl" />
              <SkeletonBlock className="h-3 w-3/4 max-w-xl" />
            </div>
            <div className="flex shrink-0 items-center justify-between gap-4 border-t border-[#eef2f4] pt-4 lg:w-64 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
              <SkeletonBlock className="h-5 w-28" />
              <SkeletonBlock className="h-11 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FormFields() {
  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-2">
      {["one", "two", "three", "four", "five", "six"].map((key) => (
        <div key={key} className="space-y-2">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-12 w-full" />
        </div>
      ))}
    </div>
  );
}

function TableRows() {
  return (
    <div className="mt-6 overflow-hidden border border-[#d6e0e4] bg-white">
      <div className="grid grid-cols-4 gap-4 border-b border-[#d6e0e4] px-5 py-4">
        {["one", "two", "three", "four"].map((key) => <SkeletonBlock key={key} className="h-3 w-24" />)}
      </div>
      {["one", "two", "three", "four", "five", "six"].map((key) => (
        <div key={key} className="grid grid-cols-4 gap-4 border-b border-[#eef2f4] px-5 py-5 last:border-b-0">
          {["one", "two", "three", "four"].map((cell) => <SkeletonBlock key={cell} className="h-3 w-full max-w-36" />)}
        </div>
      ))}
    </div>
  );
}

export function WorkspaceLoadingSkeleton({ variant = "list" }: { variant?: WorkspaceLoadingVariant }) {
  return (
    <div aria-busy="true" className="min-h-screen bg-(--khvi-paper) text-(--khvi-ink)">
      <LoadingHeader />
      <main className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        {variant === "home" ? (
          <>
            <PageHeading />
            <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <SkeletonBlock className="min-h-72 w-full rounded-(--khvi-radius-md)" />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                <SkeletonBlock className="min-h-32 w-full rounded-(--khvi-radius-md)" />
                <SkeletonBlock className="min-h-32 w-full rounded-(--khvi-radius-md)" />
              </div>
            </div>
          </>
        ) : variant === "map" ? (
          <>
            <PageHeading compact />
            <div className="mt-7 flex flex-wrap gap-2">
              {["one", "two", "three", "four"].map((key) => <SkeletonBlock key={key} className="h-10 w-28" />)}
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <SkeletonBlock className="min-h-[430px] w-full rounded-(--khvi-radius-md)" />
              <div className="space-y-3">
                <SkeletonBlock className="h-5 w-44" />
                <SkeletonBlock className="h-3 w-64 max-w-full" />
                <RequestCards />
              </div>
            </div>
          </>
        ) : variant === "form" ? (
          <>
            <PageHeading compact />
            <FormFields />
            <div className="mt-8 flex justify-end">
              <SkeletonBlock className="h-12 w-36" />
            </div>
          </>
        ) : variant === "table" ? (
          <>
            <PageHeading compact />
            <div className="mt-7 flex flex-wrap gap-2">
              {["one", "two", "three"].map((key) => <SkeletonBlock key={key} className="h-10 w-28" />)}
            </div>
            <TableRows />
          </>
        ) : (
          <>
            <PageHeading compact />
            <div className="mt-7 flex flex-wrap gap-2">
              {["one", "two", "three", "four", "five"].map((key) => <SkeletonBlock key={key} className="h-10 w-24" />)}
            </div>
            <RequestCards />
          </>
        )}
      </main>
    </div>
  );
}

export function WorkspaceDataLoadingSkeleton({ variant = "table" }: { variant?: "list" | "table" }) {
  return (
    <div aria-busy="true" className="animate-pulse">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <SkeletonBlock className="h-5 w-48" />
          <SkeletonBlock className="h-3 w-72 max-w-[70vw]" />
        </div>
        <SkeletonBlock className="h-10 w-28" />
      </div>
      {variant === "table" ? <TableRows /> : <RequestCards />}
    </div>
  );
}
