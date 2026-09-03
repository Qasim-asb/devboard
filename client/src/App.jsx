import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import TaskDetails from './pages/TaskDetails'
import PublicRoute from './components/PublicRoute'

function App() {
  return (
    <BrowserRouter>
      <div className='min-h-screen bg-slate-950 text-slate-100'>
        <Navbar />

        <main>
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
              </PublicRoute>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
