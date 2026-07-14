import { useAuth } from '../../auth/useAuth'
import { Button } from '../../components/Button'

export function OpsAdminHome() {
  const { profile, signOut } = useAuth()
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-purple">
          Ops admin
        </p>
        <h1 className="font-serif text-3xl">Welcome, {profile?.display_name}</h1>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-brand-pink/30">
        <p className="text-brand-dark/60">
          Your delivery board, overdue and blocked items, land here in Phase 1.
        </p>
      </div>
      <Button variant="outline" onClick={signOut} className="mt-auto">
        Sign out
      </Button>
    </div>
  )
}
