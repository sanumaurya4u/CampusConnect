import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Award,
  Tag,
  XCircle,
} from 'lucide-react'
import { eventService } from '@/services/event.service'
import { useAuth } from '@/features/auth'
import {
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Modal,
  LoadingSpinner,
} from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { CampusEvent, EventRegistration } from '@/types'
import { useDocumentTitle } from '@/hooks'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [event, setEvent] = useState<CampusEvent | null>(null)
  useDocumentTitle(event?.title ? `${event.title} — Event` : 'Event Details')
  const [registration, setRegistration] = useState<EventRegistration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  const loadEventData = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const eventData = await eventService.getEventById(id)
      setEvent(eventData)

      if (eventData && user?.id) {
        const reg = await eventService.getUserEventRegistration(eventData.id, user.id)
        setRegistration(reg && reg.status === 'registered' ? reg : null)
      }
    } catch (err) {
      console.error('Failed to load event:', err)
    } finally {
      setIsLoading(false)
    }
  }, [id, user?.id])

  useEffect(() => {
    loadEventData()
  }, [loadEventData])

  const handleRegister = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } })
      return
    }

    if (!event) return

    setIsActionLoading(true)
    setActionError(null)
    setActionSuccess(null)

    try {
      const reg = await eventService.registerForEvent(event.id, user.id)
      setRegistration(reg)
      setActionSuccess('Registration successful! You have secured a seat for this event.')
      // Increment count
      setEvent((prev) =>
        prev ? { ...prev, registration_count: (prev.registration_count || 0) + 1 } : null
      )
      setTimeout(() => setActionSuccess(null), 5000)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Unable to complete registration. Please try again.'
      setActionError(msg)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleCancelRegistration = async () => {
    if (!user || !event) return

    setIsActionLoading(true)
    setActionError(null)
    setActionSuccess(null)

    try {
      await eventService.cancelRegistration(event.id, user.id)
      setRegistration(null)
      setIsCancelModalOpen(false)
      setActionSuccess('Your registration has been cancelled.')
      // Decrement count
      setEvent((prev) =>
        prev
          ? { ...prev, registration_count: Math.max(0, (prev.registration_count || 1) - 1) }
          : null
      )
      setTimeout(() => setActionSuccess(null), 5000)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Unable to cancel registration. Please try again.'
      setActionError(msg)
    } finally {
      setIsActionLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading event details..." />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Event Not Found</h1>
        <p className="text-gray-600 text-sm">
          The event you are looking for does not exist or has been removed.
        </p>
        <Link to="/events">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Events Directory
          </Button>
        </Link>
      </div>
    )
  }

  const startDate = new Date(event.start_time)
  const endDate = new Date(event.end_time)
  const isPast = endDate < new Date()
  const isRegistered = Boolean(registration)

  const regCount = event.registration_count || 0
  const maxCap = event.max_capacity
  const isFull = maxCap ? regCount >= maxCap : false
  const percentFull = maxCap ? Math.min(100, Math.round((regCount / maxCap) * 100)) : 0

  const timeRange = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <div>
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Campus Events</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" className="text-xs uppercase px-3 py-1 font-bold">
                {event.event_type}
              </Badge>
              <Badge variant="secondary" className="text-xs px-3 py-1">
                {event.category}
              </Badge>
              {isPast && (
                <Badge variant="default" className="text-xs bg-gray-100 text-gray-600">
                  Event Completed
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              {event.title}
            </h1>

            {event.club && (
              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Hosted by</span>
                <Link
                  to={`/clubs/${event.club.slug}`}
                  className="font-bold text-primary hover:underline"
                >
                  {event.club.name}
                </Link>
              </p>
            )}
          </div>

          {/* Registration Action Section */}
          <div className="w-full md:w-auto">
            {isPast ? (
              <Button disabled variant="outline" className="w-full sm:w-auto">
                Event Concluded
              </Button>
            ) : isRegistered ? (
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-success text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Registered & Confirmed</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-error text-xs"
                  onClick={() => setIsCancelModalOpen(true)}
                >
                  Cancel Registration
                </Button>
              </div>
            ) : isFull ? (
              <Button disabled variant="destructive" className="w-full sm:w-auto">
                House Full (Capacity Reached)
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full sm:w-auto shadow-md"
                isLoading={isActionLoading}
                onClick={handleRegister}
                leftIcon={<CheckCircle2 className="h-5 w-5" />}
              >
                {user ? 'Register for Event' : 'Sign in to Register'}
              </Button>
            )}
          </div>
        </div>

        {/* Action Success / Error Alerts */}
        {actionSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 text-sm text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-sm text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Key Info Banner Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Date & Time</p>
              <p className="text-xs font-bold text-gray-900">{formatDate(event.start_time)}</p>
              <p className="text-[11px] text-gray-600">{timeRange}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
            <div className="h-10 w-10 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Venue</p>
              <p className="text-xs font-bold text-gray-900 truncate">{event.venue}</p>
              <p className="text-[11px] text-gray-600">UIET MDU Campus</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
            <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium">Seating Capacity</p>
              <p className="text-xs font-bold text-gray-900">
                {maxCap ? `${regCount} / ${maxCap} Registered` : `${regCount} Registered`}
              </p>
              {maxCap && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                  <div
                    className={`h-full rounded-full ${
                      isFull ? 'bg-red-500' : percentFull >= 80 ? 'bg-amber-500' : 'bg-primary'
                    }`}
                    style={{ width: `${percentFull}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Tags */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-base font-bold text-gray-900">About This Event</h2>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>

              {event.tags && event.tags.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" /> Topics & Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="default" className="text-xs bg-gray-100 text-gray-700">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Attendance & Passport Info */}
        <div className="space-y-6">
          {/* Activity Passport Badge */}
          <Card className="p-6 bg-gradient-to-br from-indigo-900 to-primary text-white space-y-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold">Activity Passport Verified</h3>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Attending this verified UIET session will credit participation points directly into your official student Activity Passport.
            </p>
          </Card>

          {/* Guidelines */}
          <Card className="p-6 space-y-3 text-xs text-gray-600">
            <h3 className="font-bold text-gray-900 text-sm">Attendance Guidelines</h3>
            <ul className="space-y-2 list-disc list-inside text-gray-500">
              <li>Arrive 10 minutes prior to the scheduled start time.</li>
              <li>Carry your student ID card or UIET enrollment number.</li>
              <li>Check in with the student coordinator at the venue entrance.</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Cancel Registration Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Event Registration"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={isActionLoading}
            >
              Keep Registration
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isActionLoading}
              onClick={handleCancelRegistration}
              leftIcon={<XCircle className="h-4 w-4" />}
            >
              Confirm Cancellation
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to cancel your registration for{' '}
          <strong className="text-gray-900">{event.title}</strong>? Your seat will be made available
          to other students.
        </p>
      </Modal>
    </div>
  )
}
