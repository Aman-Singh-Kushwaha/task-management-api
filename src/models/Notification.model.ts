import mongoose, { Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: 'TASK_ASSIGNED' | 'TASK_DUE_REMINDER';
  message: string;
  taskId: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['TASK_ASSIGNED', 'TASK_DUE_REMINDER'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  taskId: {
    type: mongoose.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', notificationSchema);