import mongoose, { Document } from 'mongoose';

export interface ITask extends Document {
  title:       string;
  description: string;
  status:      'pending' | 'in-progress' | 'completed';
  dueDate:     Date;
  owner:       mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  createdAt:   Date;
  updatedAt:   Date;
}

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlenght: [100, 'Task title should not exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlenght: [500, 'Task description should not exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: [true, 'Task due date is required'],
    validate: {
      validator: function(dueDate: Date) {
        return dueDate > new Date();
      },
      message: 'Duedate cannot be in past'
    },
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  }
},{timestamps: true}
);

//Adding Indexes for quicker serarching and sorting
taskSchema.index({ owner: 1, status: 1 }); 
taskSchema.index({ dueDate: 1 });

export default mongoose.model<ITask>('Task', taskSchema);