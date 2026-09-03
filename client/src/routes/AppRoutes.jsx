import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import PublicRoute from '../components/PublicRoute'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import TaskDetails from '../pages/TaskDetails'

function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Navigate to='/dashboard' replace />} />

      <Route path='/dashboard' element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path='/dashboard/tasks/:id' element={
        <ProtectedRoute>
          <TaskDetails />
        </ProtectedRoute>
      } />

      <Route path='/login' element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      <Route path='/signup' element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      } />
    </Routes>
  )
}

export default AppRoutes
