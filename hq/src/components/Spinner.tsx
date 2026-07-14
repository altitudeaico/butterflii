export function Spinner() {
  return (
    <div className="flex h-full min-h-[50vh] items-center justify-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-brand-purple/20 border-t-brand-purple"
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
