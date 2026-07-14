import { useAuth } from '../../auth/useAuth'

export function ArtistHome() {
  const { profile, signOut } = useAuth()
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center gap-6 px-6 py-10 text-center">
      <span className="text-6xl">🦋</span>
      <h1 className="font-serif text-3xl text-brand-purple-deep">
        Hi {profile?.display_name}!
      </h1>
      <div className="w-full rounded-3xl bg-white p-6 shadow-sm ring-1 ring-brand-pink/30">
        <p className="text-brand-dark/70">
          Your path to winning and your ladder are coming really soon. Get ready!
        </p>
      </div>
      <button onClick={signOut} className="mt-auto text-sm text-brand-dark/40 underline">
        Sign out
      </button>
    </div>
  )
}
