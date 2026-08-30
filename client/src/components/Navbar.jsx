import { useState } from 'react'
import { LayoutDashboard, LogOut, Menu, Plus, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  function closeMenu() {
    setIsOpen(false)
  }

  function handleLogout() {
    logout()
    closeMenu()
    navigate('/login')
  }

  return (
    <header className='border-b border-slate-800 bg-slate-950'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6'>
        <div className='flex h-16 items-center justify-between'>
          <Link to='/dashboard' onClick={closeMenu} className='flex items-center gap-2'>
            <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 font-bold text-slate-950'>D</span>
            <span className='text-lg font-semibold tracking-tight'>DevBoard</span>
          </Link>

          <nav className='hidden items-center gap-2 md:flex'>
            {isAuthenticated ? (
              <>
                <Link to='/dashboard' className='inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white'>
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>

                <button type='button' className='inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300'>
                  <Plus size={16} />
                  New task
                </button>

                <div className='ml-2 flex items-center gap-3 border-l border-slate-800 pl-3'>
                  <span className='max-w-32 truncate text-sm text-slate-400'>{user?.name || 'Account'}</span>
                  <button type='button' onClick={handleLogout} className='inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white'>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to='/login' className='rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white'>
                  Login
                </Link>
                <Link to='/signup' className='rounded-lg bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300'>
                  Sign up
                </Link>
              </>
            )}
          </nav>

          <button type='button' onClick={() => setIsOpen(current => !current)} className='inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white md:hidden'>
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {isOpen && (
          <div className='border-t border-slate-800 py-3 md:hidden'>
            <nav className='flex flex-col gap-1'>
              {isAuthenticated ? (
                <>
                  <div className='px-3 py-2 text-sm text-slate-500'>
                    Signed in as{' '}
                    <span className='text-slate-300'>{user?.name || 'Account'}</span>
                  </div>
                  <Link to='/dashboard' onClick={closeMenu} className='inline-flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white'>
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                  <button type='button' onClick={closeMenu} className='inline-flex items-center gap-3 rounded-lg bg-cyan-400 px-3 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300'>
                    <Plus size={18} />
                    New task
                  </button>
                  <button type='button' onClick={handleLogout} className='inline-flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white'>
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to='/login' onClick={closeMenu} className='rounded-lg px-3 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white'>
                    Login
                  </Link>
                  <Link to='/signup' onClick={closeMenu} className='rounded-lg bg-cyan-400 px-3 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300'>
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
