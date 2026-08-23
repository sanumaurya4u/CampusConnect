import { Link } from 'react-router-dom'
import { Home, Compass } from 'lucide-react'
import { useDocumentTitle } from '@/hooks'
import { Button, Card } from '@/components/ui'

export function NotFoundPage() {
  useDocumentTitle('404 Page Not Found')
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 sm:p-10 text-center space-y-6 shadow-xl border border-gray-200">
        <div className="space-y-2">
          <span className="text-6xl sm:text-7xl font-extrabold bg-gradient-to-r from-primary via-indigo-600 to-secondary bg-clip-text text-transparent">
            404
          </span>
          <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
            The campus resource, club, or event link you are trying to access does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Home className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Campus Home
            </Button>
          </Link>
          <Link to="/clubs" className="w-full sm:w-auto">
            <Button
              size="md"
              leftIcon={<Compass className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Explore Clubs
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
