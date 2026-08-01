export default function AuthLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading authentication page"
      className="space-y-8"
    >
      <div className="space-y-3">
        <div className="bg-muted h-4 w-24 animate-pulse rounded" />
        <div className="bg-muted h-9 w-52 animate-pulse rounded" />
        <div className="bg-muted h-5 w-full animate-pulse rounded" />
      </div>
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="bg-muted h-4 w-28 animate-pulse rounded" />
          <div className="bg-muted h-11 w-full animate-pulse rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="bg-muted h-4 w-20 animate-pulse rounded" />
          <div className="bg-muted h-11 w-full animate-pulse rounded-lg" />
        </div>
        <div className="bg-muted h-11 w-full animate-pulse rounded-lg" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
