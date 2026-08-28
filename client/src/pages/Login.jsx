import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (isSubmitting) {
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to login.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className='mx-auto max-w-md px-4 py-12 sm:px-6'>
      <div className='rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8'>
        <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400 text-slate-950'>
          <LogIn size={21} />
        </div>

        <h1 className='mt-5 text-2xl font-bold'>Welcome back</h1>
        <p className='mt-2 text-sm text-slate-400'>Sign in to continue to DevBoard.</p>

        {error && <div className='mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300'>{error}</div>}

        <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
          <div>
            <label className='mb-2 block text-sm text-slate-300'>Email</label>
            <input type='email' value={email} onChange={e => setEmail(e.target.value)} required autoComplete='email' className='w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400' />
          </div>

          <div>
            <label className='mb-2 block text-sm text-slate-300'>Password</label>
            <input type='password' value={password} onChange={e => setPassword(e.target.value)} required autoComplete='current-password' className='w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400' />
          </div>

          <button type='submit' disabled={isSubmitting} className='w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50'>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-slate-400'>
          Don't have an account?{' '}
          <Link to='/signup' className='font-medium text-cyan-400 hover:text-cyan-300'>Create one</Link>
        </p>
      </div>
    </section>
  )
}

export default Login
