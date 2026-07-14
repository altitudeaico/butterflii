import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/useAuth'
import { homeRouteForRole } from '../auth/RoleRoute'
import { artistLogins } from '../auth/artistLogins'
import { AvatarTile } from '../components/AvatarTile'
import { PinPad } from '../components/PinPad'
import { Button } from '../components/Button'

export function LoginPage() {
  const { session, profile, loading } = useAuth()
  const [showAdultForm, setShowAdultForm] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState<(typeof artistLogins)[number] | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session && profile) {
    return <Navigate to={homeRouteForRole(profile.role)} replace />
  }

  async function handleAdultSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('That email and password combination did not work.')
    setSubmitting(false)
  }

  async function handlePin(pin: string) {
    if (!selectedArtist) return
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: selectedArtist.authEmail,
      password: pin,
    })
    if (error) setError("That PIN didn't work, try again.")
    setSubmitting(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="text-center">
        <h1 className="font-serif text-4xl text-brand-purple-deep">Butterflii HQ</h1>
        <p className="mt-1 text-sm text-brand-dark/60">Sign in to see your board</p>
      </div>

      {selectedArtist ? (
        <div className="flex flex-col items-center gap-6">
          <p className="text-lg font-semibold">Hi {selectedArtist.displayName}, enter your PIN</p>
          <PinPad onComplete={handlePin} disabled={submitting} />
          <button
            className="text-sm text-brand-dark/50 underline"
            onClick={() => {
              setSelectedArtist(null)
              setError(null)
            }}
          >
            Not you?
          </button>
        </div>
      ) : showAdultForm ? (
        <form onSubmit={handleAdultSubmit} className="flex w-full max-w-xs flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="min-h-11 rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="min-h-11 rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
          <button
            type="button"
            className="text-sm text-brand-dark/50 underline"
            onClick={() => {
              setShowAdultForm(false)
              setError(null)
            }}
          >
            Back
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-4">
            {artistLogins.map((artist) => (
              <AvatarTile
                key={artist.slug}
                avatar={artist.avatar}
                label={artist.displayName}
                onClick={() => setSelectedArtist(artist)}
              />
            ))}
          </div>
          <button
            className="text-sm text-brand-dark/50 underline"
            onClick={() => setShowAdultForm(true)}
          >
            I'm an adult
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
