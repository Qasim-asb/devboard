import { useState } from 'react'
import { Plus } from 'lucide-react'

function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) return

    onAddTask(trimmedTitle)
    setTitle('')
  }

  return (
    <div className='rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6'>
      <h2 className='text-lg font-semibold'>Add a task</h2>
      <p className='mt-1 text-sm text-slate-400'>Create a small piece of work to track.</p>

      <form onSubmit={handleSubmit} className='mt-6 space-y-3'>
        <input type='text' value={title} onChange={e => setTitle(e.target.value)} placeholder='e.g. Build login form' className='w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400' />

        <button type='submit' className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300'>
          <Plus size={17} />
          Add task
        </button>
      </form>
    </div>
  )
}

export default TaskForm
