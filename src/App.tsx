import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/features/auth'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { router } from '@/routes'
import { isSupabaseConfigured } from '@/lib/supabase'

export default function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl text-center space-y-6 shadow-xl border border-gray-200">
          <div className="h-16 w-16 mx-auto bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-gray-900 font-sans">Supabase Config Missing</h1>
            <p className="text-sm text-gray-500 leading-relaxed font-sans">
              This application requires Supabase environment variables to function.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl text-left text-xs text-gray-600 space-y-2 font-sans">
            <p className="font-semibold text-gray-800">To fix this on Vercel:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Go to your Vercel Project Dashboard.</li>
              <li>Navigate to <strong>Settings</strong> &gt; <strong>Environment Variables</strong>.</li>
              <li>Add the following keys (copy values from your <code>.env.local</code>):
                <ul className="list-disc pl-4 mt-1 font-mono text-[10px]">
                  <li><code>SUPABASE_URL</code> (or <code>VITE_SUPABASE_URL</code>)</li>
                  <li><code>SUPABASE_ANON_KEY</code> (or <code>VITE_SUPABASE_ANON_KEY</code>)</li>
                </ul>
              </li>
              <li>Redeploy your project or trigger a new deployment.</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  )
}

