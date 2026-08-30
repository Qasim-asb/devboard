import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'

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
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
