import { Schema, model } from 'mongoose'

const taskSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, { timestamps: true })

const Task = model('Task', taskSchema)

export default Task
