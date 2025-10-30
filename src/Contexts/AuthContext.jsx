import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const initialized = sessionStorage.getItem('auth_initialized')

        if (!initialized) {
          // First load in this tab: clear any existing session so user must sign in
          await supabase.auth.signOut()
          sessionStorage.setItem('auth_initialized', '1')
          if (!mounted) return
          setUser(null)
        } else {
          // Subsequent reloads in same tab: restore session if present
          const { data } = await supabase.auth.getSession()
          if (!mounted) return
          setUser(data.session?.user ?? null)
        }
      } catch (err) {
        console.warn('Auth init error', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      if (listener?.subscription) listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async ({ email, password }) => {
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signUp = async ({ email, password }) => {
    return supabase.auth.signUp({ email, password })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    // Clear the initialization flag so a future new tab will force login again
    sessionStorage.removeItem('auth_initialized')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)