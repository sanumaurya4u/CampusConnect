import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  School,
  BookOpen,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  Compass,
} from 'lucide-react'
import { useAuth } from '@/features/auth'
import { authService } from '@/services/auth.service'
import { clubService } from '@/services/club.service'
import { Button, Input, Card, CardBody, CardHeader, Badge } from '@/components/ui'
import {
  DEPARTMENTS,
  SEMESTERS,
  ROLE_LABELS,
  AVAILABLE_INTERESTS,
  AVAILABLE_GOALS,
} from '@/constants'
import { getInitials } from '@/lib/utils'
import type { ClubMember } from '@/types'
import { useDocumentTitle } from '@/hooks'

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  useDocumentTitle('My Profile')

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [department, setDepartment] = useState(profile?.department || DEPARTMENTS[0])
  const [semester, setSemester] = useState(profile?.semester || SEMESTERS[0])
  const [bio, setBio] = useState(profile?.bio || '')
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile?.interests || [])
  const [selectedGoals, setSelectedGoals] = useState<string[]>(profile?.goals || [])
  const [joinedClubs, setJoinedClubs] = useState<ClubMember[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setDepartment(profile.department || DEPARTMENTS[0])
      setSemester(profile.semester || SEMESTERS[0])
      setBio(profile.bio || '')
      setSelectedInterests(profile.interests || [])
      setSelectedGoals(profile.goals || [])
    }
  }, [profile])

  useEffect(() => {
    async function loadClubs() {
      if (user?.id) {
        const clubs = await clubService.getUserClubs(user.id)
        setJoinedClubs(clubs)
      }
    }
    loadClubs()
  }, [user?.id])

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)
    setErrorMessage(null)

    if (!user?.id) return

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.')
      return
    }

    setIsSaving(true)
    try {
      await authService.updateProfile(user.id, {
        full_name: fullName.trim(),
        department,
        semester: profile?.role === 'student' ? semester : null,
        bio: bio.trim() || null,
        interests: selectedInterests,
        goals: selectedGoals,
        avatar_url: profile?.avatar_url || null,
      })

      await refreshProfile()
      setSuccessMessage('Profile updated successfully.')
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to update profile. Please try again.'
      setErrorMessage(message)
    } finally {
      setIsSaving(false)
    }
  }

  const roleLabel = profile?.role ? ROLE_LABELS[profile.role] : 'Student'
  const initials = getInitials(fullName || profile?.full_name || user?.email || 'User')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your personal details, campus interests, academic information, and joined clubs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="text-center p-6 space-y-4">
            <div className="mx-auto h-24 w-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold shadow-inner">
              {initials}
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">{fullName || 'Campus User'}</h2>
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </p>
            </div>

            <div className="pt-2">
              <Badge variant="primary" className="text-xs px-3 py-1">
                {roleLabel}
              </Badge>
            </div>

            {profile?.department && (
              <div className="pt-3 border-t border-gray-100 text-xs text-gray-600 text-left space-y-1.5">
                <p className="flex items-center gap-1.5 font-medium text-gray-700">
                  <School className="h-3.5 w-3.5 text-primary" />
                  {profile.department}
                </p>
                {profile.role === 'student' && profile.semester && (
                  <p className="flex items-center gap-1.5 text-gray-500">
                    <BookOpen className="h-3.5 w-3.5 text-secondary" />
                    {profile.semester}
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Joined Clubs Sidebar */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" /> Joined Clubs ({joinedClubs.length})
              </h3>
              <Link to="/clubs" className="text-xs text-primary hover:underline">
                Find More
              </Link>
            </div>

            {joinedClubs.length === 0 ? (
              <p className="text-xs text-gray-500 py-2">
                No clubs joined yet.{' '}
                <Link to="/clubs" className="text-primary hover:underline">
                  Explore clubs
                </Link>
              </p>
            ) : (
              <div className="space-y-2 pt-1">
                {joinedClubs.map((m) => {
                  if (!m.club) return null
                  return (
                    <Link
                      key={m.id}
                      to={`/clubs/${m.club.slug}`}
                      className="block p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-xs font-semibold text-gray-900 truncate">{m.club.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{m.club.category}</p>
                    </Link>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Edit Form & Interests */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-gray-900">Personal & Academic Details</h2>
            </CardHeader>
            <CardBody>
              {successMessage && (
                <div className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2.5 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-sm text-error">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Full Name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isSaving}
                />

                <div>
                  <label
                    htmlFor="email-readonly"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email Address (Read-only)
                  </label>
                  <input
                    id="email-readonly"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-100 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label
                    htmlFor="department-field"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Department
                  </label>
                  <select
                    id="department-field"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {profile?.role === 'student' && (
                  <div>
                    <label
                      htmlFor="semester-field"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Current Semester
                    </label>
                    <select
                      id="semester-field"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      disabled={isSaving}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                      {SEMESTERS.map((sem) => (
                        <option key={sem} value={sem}>
                          {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="bio-field"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio-field"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Introduce yourself to the campus community..."
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>

                {/* Interests & Skills Section */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" /> Interests & Skills
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select topics you want to learn, practice, or collaborate on.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_INTERESTS.map((interest) => {
                      const isSelected = selectedInterests.includes(interest)
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          disabled={isSaving}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {interest}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Campus Goals Section */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-secondary" /> Campus Goals
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    What do you want to achieve during your university journey?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_GOALS.map((goal) => {
                      const isSelected = selectedGoals.includes(goal)
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleGoal(goal)}
                          disabled={isSaving}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-secondary text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {goal}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isSaving}
                    leftIcon={<Save className="h-4 w-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
