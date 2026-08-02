import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../config/supabase'
import {
  getCurrentSession,
  getProfile,
  signInWithEmail,
  signOut as signOutService,
} from '../services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading') // loading | authenticated | unauthenticated

  const loadProfile = useCallback(async (userId) => {
    try {
      const data = await getProfile(userId)
      setProfile(data)
    } catch (err) {
      console.error('Error loading profile', err)
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const current = await getCurrentSession()
        if (!mounted) return
        if (current) {
          setSession(current)
          setUser(current.user)
          setStatus('authenticated')
          loadProfile(current.user.id)
        } else {
          setStatus('unauthenticated')
        }
      } catch (err) {
        console.error('Session init error', err)
        if (mounted) setStatus('unauthenticated')
      }
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return
      if (nextSession) {
        setSession(nextSession)
        setUser(nextSession.user)
        setStatus('authenticated')
        if (['SIGNED_IN', 'INITIAL_SESSION', 'USER_UPDATED'].includes(event)) {
          loadProfile(nextSession.user.id)
        }
      } else {
        setSession(null)
        setUser(null)
        setProfile(null)
        setStatus('unauthenticated')
      }
    })

    return () => {
      mounted = false
      listener?.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(async (email, password) => {
    return signInWithEmail(email, password)
  }, [])

  const signOut = useCallback(async () => {
    try {
      await signOutService()
    } finally {
      setSession(null)
      setUser(null)
      setProfile(null)
      setStatus('unauthenticated')
    }
  }, [])

  const refreshProfile = useCallback(() => {
    if (user) loadProfile(user.id)
  }, [user, loadProfile])

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      status,
      signIn,
      signOut,
      refreshProfile,
    }),
    [session, user, profile, status, signIn, signOut, refreshProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
