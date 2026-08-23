import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn, GraduationCap, AlertCircle } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { Button, Input } from '@/components/ui'
import { ROLE_DASHBOARD_ROUTES } from '@/constants'
import type { UserRole } from '@/types'
import { useDocumentTitle } from '@/hooks'

export function LoginPage() {
  useDocumentTitle('Sign In')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { signIn, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Please enter both email and password.')
      return
    }

    setIsSubmitting(true)
    try {
      await signIn({ email: email.trim(), password })

      // Determine redirect path
      if (from && from !== '/login') {
        navigate(from, { replace: true })
      } else {
        const targetRole: UserRole = profile?.role || 'student'
        navigate(ROLE_DASHBOARD_ROUTES[targetRole] || '/student/dashboard', { replace: true })
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to sign in right now. Please check your credentials.'
      if (message.toLowerCase().includes('invalid login credentials')) {
        setError('Invalid email or password. Please try again.')
      } else {
        setError(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 bg-[#181512] rounded-2xl items-center justify-center text-[#E05326] shadow-xs border border-stone-800">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Welcome <span className="text-[#E05326]">Back.</span></h2>
          <p className="text-xs sm:text-sm text-stone-600 font-normal">
            Sign in to access your campus societies, events, and Activity Passport.
          </p>
        </div>

        <div className="editorial-card p-8 sm:p-9 space-y-6">
          <div className="border-b border-[#EFE9DF] pb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-stone-900">Account Credentials</h3>
            <span className="text-[10px] font-mono text-[#E05326] font-bold uppercase">UIET Secure</span>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 font-mono">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="College / Email Address"
              type="email"
              placeholder="you@uiet.mdu.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isSubmitting}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isSubmitting}
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
                leftIcon={<LogIn className="h-4 w-4" />}
              >
                Sign In to Campus Connect
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs font-mono text-stone-600">
          Don&apos;t have an account yet?{' '}
          <Link
            to="/signup"
            className="font-bold text-[#E05326] hover:underline underline-offset-4"
          >
            Create an account &rarr;
          </Link>
        </p>
      </div>
    </div>
  )
}
