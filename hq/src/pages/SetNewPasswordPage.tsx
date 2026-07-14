import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/useAuth'
import { Button } from '../components/Button'

// Shown whenever a password-recovery link lands (see AuthProvider's
// PASSWORD_RECOVERY handling), for whichever of the three accounts requested
// it. Replaces the normal routed screens until a new password is set.
export function SetNewPasswordPage() {
  const { profile, completePasswordRecovery } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Use at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Those passwords do not match.')
      return
    }
    setSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (error) {
      setError('Could not set that password, try again.')
      return
    }
    completePasswordRecovery()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-12">
      <div className="text-center">
        <h1 className="font-serif text-3xl text-brand-purple-deep">Set a new password</h1>
        {profile?.display_name && (
          <p className="mt-1 text-sm text-brand-dark/60">for {profile.display_name}</p>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-3">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          className="min-h-11 rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
          className="min-h-11 rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save password'}
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  )
}
