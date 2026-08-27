import { useState } from 'react'
import { LayoutDashboard, Menu, Plus, X } from 'lucide-react'
import { Link } from 'react-router-dom'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  function closeMenu() {
    setIsOpen(false)
  }

  return (
    <header className='border-b border-slate-800 bg-slate-950'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6'>
        <div className='flex h-16 items-center justify-between'>
          <Link to='/' onClick={closeMenu} className='flex items-center gap-2'>
            <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 font-bold text-slate-950'>D</span>
            <span className='text-lg font-semibold tracking-tight'>DevBoard</span>
          </Link>

          <nav className='hidden items-center gap-2 md:flex'>
            <Link to='/' className='inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white'>
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <button type='button' className='inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300'>
              <Plus size={16} />
              New task
            </button>
          </nav>

          <button type='button' onClick={() => setIsOpen(current => !current)} className='inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white md:hidden'>
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {isOpen && (
          <div className='border-t border-slate-800 py-3 md:hidden'>
            <nav className='flex flex-col gap-1'>
              <Link to='/' onClick={closeMenu} className='inline-flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white'>
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <button type='button' onClick={closeMenu} className='inline-flex items-center gap-3 rounded-lg bg-cyan-400 px-3 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300'>
                <Plus size={18} />
                New task
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
