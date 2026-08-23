import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { Button, Input } from '@/components/ui'
import { DEPARTMENTS, SEMESTERS, ROLE_DASHBOARD_ROUTES } from '@/constants'
import type { UserRole } from '@/types'
import { useDocumentTitle } from '@/hooks'

export function SignupPage() {
  useDocumentTitle('Create Account')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('student')
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0])
  const [semester, setSemester] = useState<string>(SEMESTERS[0])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!email.trim()) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setIsSubmitting(true)
    try {
      await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role,
        department,
        semester: role === 'student' ? semester : undefined,
      })

      setIsSuccess(true)

      // Short delay for database trigger & auth profile sync before redirecting
      setTimeout(() => {
        const targetRoute = ROLE_DASHBOARD_ROUTES[role] || '/student/dashboard'
        navigate(targetRoute, { replace: true })
      }, 1000)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to create account right now. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 bg-[#181512] rounded-2xl items-center justify-center text-[#E05326] shadow-xs border border-stone-800">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Join Campus <span className="text-[#E05326]">Connect.</span></h2>
          <p className="text-xs sm:text-sm text-stone-600 font-normal">
            Create your account to discover clubs, join events, and build your portfolio.
          </p>
        </div>

        <div className="editorial-card p-8 sm:p-9 space-y-6">
          <div className="border-b border-[#EFE9DF] pb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-stone-900">Student Registration</h3>
            <span className="text-[10px] font-mono text-[#E05326] font-bold uppercase">UIET 2026</span>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 font-mono">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 font-mono">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>Account created successfully! Redirecting to workspace...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Sakshi Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isSubmitting || isSuccess}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@uiet.mdu.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isSubmitting || isSuccess}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              helperText="Minimum 6 characters"
              disabled={isSubmitting || isSuccess}
            />

            {/* Role Selection */}
            <div>
              <label htmlFor="role-select" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-mono">
                Primary Campus Role
              </label>
              <select
                id="role-select"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={isSubmitting || isSuccess}
                className="w-full px-4 py-2.5 rounded-xl border border-[#DCD5C9] bg-[#FDFCFA] text-xs font-mono font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#181512]/15 focus:border-[#181512]"
              >
                <option value="student">Student (Learner &amp; Participant)</option>
                <option value="organizer">Club Organizer / Society Lead</option>
                <option value="faculty">Faculty Advisor / Teacher In-Charge</option>
              </select>
            </div>

            {/* Department Selection */}
            <div>
              <label htmlFor="dept-select" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-mono">
                Academic Department
              </label>
              <select
                id="dept-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={isSubmitting || isSuccess}
                className="w-full px-4 py-2.5 rounded-xl border border-[#DCD5C9] bg-[#FDFCFA] text-xs font-mono font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#181512]/15 focus:border-[#181512]"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Selection */}
            {role === 'student' && (
              <div>
                <label htmlFor="semester-select" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-mono">
                  Current Semester
                </label>
                <select
                  id="semester-select"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  disabled={isSubmitting || isSuccess}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DCD5C9] bg-[#FDFCFA] text-xs font-mono font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#181512]/15 focus:border-[#181512]"
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
                leftIcon={<UserPlus className="h-4 w-4" />}
              >
                Create Account &rarr;
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs font-mono text-stone-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-[#E05326] hover:underline underline-offset-4"
          >
            Sign in &rarr;
          </Link>
        </p>
      </div>
    </div>
  )
}
