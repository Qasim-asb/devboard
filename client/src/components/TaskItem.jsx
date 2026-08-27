import { memo } from 'react'
import { CheckCircle2, Circle, Trash2 } from 'lucide-react'

const TaskItem = memo(function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className='flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4'>
      <button type='button' onClick={() => onToggle(task.id)} className='shrink-0 text-slate-500 transition hover:text-cyan-400'>
        {task.completed ? <CheckCircle2 size={20} className='text-cyan-400' /> : <Circle size={20} />}
      </button>

      <p className={`min-w-0 flex-1 text-sm ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
        {task.title}
      </p>

      <button type='button' onClick={() => onDelete(task.id)} className='shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400'>
        <Trash2 size={17} />
      </button>
    </div>
  )
})

export default TaskItem
