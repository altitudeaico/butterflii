import { useAuth } from '../../auth/useAuth'
import { ArtworkWorkspace } from '../ArtworkWorkspace'

export function ArtistHome() {
  const { signOut } = useAuth()
  return <main className="mx-auto min-h-screen max-w-5xl space-y-6 px-5 py-8">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-brand-purple">Butterflii HQ</p><h1 className="font-serif text-3xl">Welcome to your studio, Elsie!</h1><p className="text-sm text-brand-dark/60">My creative space</p></div>
      <button onClick={signOut} className="text-sm underline">Sign out</button>
    </header>
    <p className="text-sm text-brand-dark/70">Give your artwork a name, tell us about it and choose a price. Mum or Dad can review it.</p>
    <ArtworkWorkspace />
  </main>
}
