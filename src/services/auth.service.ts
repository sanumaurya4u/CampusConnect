import { supabase } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types'

export interface SignUpParams {
  email: string
  password: string
  fullName: string
  role?: UserRole
  department?: string
  semester?: string
}

export interface SignInParams {
  email: string
  password: string
}

export const authService = {
  /**
   * Sign up a new user with metadata that triggers profile creation in PostgreSQL.
   */
  async signUp({ email, password, fullName, role = 'student', department, semester }: SignUpParams) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          department: department || null,
          semester: semester || null,
        },
      },
    })

    if (error) {
      throw error
    }

    // Ensure profile row exists even if database trigger timing differs slightly
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: data.user.id,
            full_name: fullName,
            email: email,
            role,
            department: department || null,
            semester: semester || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )

      if (profileError) {
        console.warn('Profile upsert notice:', profileError.message)
      }
    }

    return data
  },

  /**
   * Sign in an existing user with email and password.
   */
  async signIn({ email, password }: SignInParams) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Sign out the currently authenticated user.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  },

  /**
   * Get the current session.
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      throw error
    }
    return data.session
  },

  /**
   * Get current authenticated user.
   */
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      throw error
    }
    return data.user
  },

  /**
   * Get user profile from public.profiles table.
   */
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching profile:', error.message)
      return null
    }

    return data as Profile | null
  },

  /**
   * Update profile fields.
   */
  async updateProfile(userId: string, updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Profile
  },
}
