export function AvatarTile({
  avatar,
  label,
  onClick,
}: {
  avatar: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-24 w-24 flex-col items-center justify-center gap-1 rounded-3xl bg-white p-3 shadow-md ring-1 ring-brand-pink/50 transition-transform active:scale-95"
    >
      <span className="text-4xl">{avatar}</span>
      <span className="text-sm font-semibold text-brand-dark">{label}</span>
    </button>
  )
}
