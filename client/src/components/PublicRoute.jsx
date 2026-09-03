import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

function PublicRoute({ children }) {
  const { isAuthenticated, isCheckingAuth } = useAuth()

  if (isCheckingAuth) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center px-4'>
        <div className='rounded-xl border border-slate-800 bg-slate-900 px-5 py-4 text-sm text-slate-400'>
          Checking your session...
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />
  }

  return children
}

export default PublicRoute
