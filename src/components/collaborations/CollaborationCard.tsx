import { Handshake, Calendar, MessageSquare } from 'lucide-react'
import { Card, Badge } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { ClubCollaboration } from '@/types'

interface CollaborationCardProps {
  collaboration: ClubCollaboration
  currentClubId?: string
}

export function CollaborationCard({ collaboration, currentClubId }: CollaborationCardProps) {
  const isInitiator = currentClubId === collaboration.initiator_club_id
  const partnerClub = isInitiator ? collaboration.target_club : collaboration.initiator_club

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success'
      case 'completed':
        return 'primary'
      case 'pending':
        return 'warning'
      case 'rejected':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Card hoverable className="p-6 bg-white space-y-4">
      {/* Header with Clubs and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-900 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
            {collaboration.initiator_club?.name || 'Initiator'}
          </span>
          <Handshake className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="px-2.5 py-1 rounded-lg bg-secondary/10 text-secondary">
            {collaboration.target_club?.name || 'Partner Club'}
          </span>
        </div>

        <Badge variant={getStatusBadgeVariant(collaboration.status)} className="text-xs uppercase">
          {collaboration.status === 'pending' ? 'Pending Review' : collaboration.status}
        </Badge>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h4 className="text-base font-bold text-gray-900">{collaboration.title}</h4>
        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
          {collaboration.description}
        </p>
      </div>

      {/* Dates & Notes */}
      <div className="pt-2 space-y-1.5 text-xs text-gray-500">
        {collaboration.proposed_dates && (
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-medium text-gray-700">Timeline:</span> {collaboration.proposed_dates}
          </p>
        )}

        {collaboration.initiator_notes && (
          <p className="flex items-start gap-1.5 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-[11px] text-gray-600">
            <MessageSquare className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-gray-700">Proposal Note:</strong> {collaboration.initiator_notes}
            </span>
          </p>
        )}

        {collaboration.target_response && (
          <p className="flex items-start gap-1.5 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100 text-[11px] text-emerald-800">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-emerald-900">Partner Response:</strong>{' '}
              {collaboration.target_response}
            </span>
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
        <span>Proposed {formatDate(collaboration.created_at)}</span>
        {partnerClub && (
          <span className="font-semibold text-gray-600">
            {isInitiator ? `Sent to ${partnerClub.name}` : `Received from ${partnerClub.name}`}
          </span>
        )}
      </div>
    </Card>
  )
}
