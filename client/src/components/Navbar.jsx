import { LayoutDashboard, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <header className='border-b border-slate-800 bg-slate-950/95 backdrop-blur'>
      <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6'>
        <Link to='/' className='flex items-center gap-2 font-semibold tracking-tight'>
          <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-sm font-bold text-slate-950'>D</span>
          <span className='text-lg'>DevBoard</span>
        </Link>

        <nav className='flex items-center gap-2'>
          <Link to='/' className='inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white'>
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          <button type='button' className='inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400'>
            <Plus size={16} />
            New task
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
