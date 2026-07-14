import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export type AuthState = {
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  // True from the moment a password-recovery link lands until
  // completePasswordRecovery() is called. While true, the app should show the
  // set-new-password screen instead of routing into a lens, even though a
  // real session already exists (the recovery link signs the user in).
  passwordRecovery: boolean
  completePasswordRecovery: () => void
}

export const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [passwordRecovery, setPasswordRecovery] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadProfile(nextSession: Session | null) {
      if (!nextSession) {
        if (!cancelled) {
          setProfile(null)
          setLoading(false)
        }
        return
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', nextSession.user.id)
        .single()
      if (cancelled) return
      if (error) {
        // A session with no matching profiles row (role) is not a lens we
        // can render; treat it as signed out rather than guessing a role.
        console.error('Failed to load profile for session', error)
        setProfile(null)
      } else {
        setProfile(data)
      }
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (cancelled) return
      setSession(initialSession)
      loadProfile(initialSession)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true)
      setSession(nextSession)
      setLoading(true)
      loadProfile(nextSession)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        signOut,
        passwordRecovery,
        completePasswordRecovery: () => setPasswordRecovery(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
