import { CheckCircle2, Clock3, ListTodo } from 'lucide-react'

const stats = [
  { label: 'Total tasks', value: 12, icon: ListTodo },
  { label: 'In progress', value: 4, icon: Clock3 },
  { label: 'Completed', value: 8, icon: CheckCircle2 }
]

function Dashboard() {
  return (
    <section className='mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14'>
      <div className='max-w-2xl'>
        <p className='text-sm font-medium text-cyan-400'>Developer workspace</p>
        <h1 className='mt-2 text-3xl font-bold tracking-tight sm:text-4xl'>Stay on top of your work.</h1>
        <p className='mt-4 leading-7 text-slate-400'>
          A focused task board for managing small pieces of development work without unnecessary complexity.
        </p>
      </div>

      <div className='mt-10 grid gap-4 sm:grid-cols-3'>
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className='rounded-2xl border border-slate-800 bg-slate-900 p-5'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-slate-400'>{label}</span>
              <Icon size={18} className='text-cyan-400' />
            </div>
            <p className='mt-3 text-3xl font-bold'>{value}</p>
          </div>
        ))}
      </div>

      <div className='mt-10 rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-8 text-center'>
        <h2 className='text-lg font-semibold'>No task selected yet</h2>
        <p className='mt-2 text-sm text-slate-400'>Our next milestone will turn this shell into a real task dashboard.</p>
      </div>
    </section>
  )
}

export default Dashboard
