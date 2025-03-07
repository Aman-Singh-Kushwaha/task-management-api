import Notification from '../models/Notification.model';
import { sendEmail } from './email.service';
import Task from '../models/Task.model';
import User from '../models/User.model';
import { ApiError } from '../utils/server-utils';

export const createNotification = async (
  recipientId: string,
  type: 'TASK_ASSIGNED' | 'TASK_DUE_REMINDER',
  taskId: string
) => {
  try {
    const [task, recipient] = await Promise.all([
      Task.findById(taskId).populate('owner', 'name'),
      User.findById(recipientId)
    ]);

    if (!task || !recipient) {
      throw new ApiError(404, 'Task or User not found');
    }

    let message: string;
    switch (type) {
      case 'TASK_ASSIGNED':
        message = `You have been assigned a new task: ${task.title}`;
        break;
      case 'TASK_DUE_REMINDER':
        message = `Task "${task.title}" is due soon`;
        break;
      default:
        throw new ApiError(400, 'Invalid notification type');
    }

    const notification = await Notification.create({
      recipient: recipientId,
      type,
      message,
      taskId
    });

    await sendEmail({
      to: recipient.email,
      subject: type === 'TASK_ASSIGNED' ? 'New Task Assigned' : 'Task Due Reminder',
      text: message
    });

    return notification;
  } catch (error) {
    throw new ApiError(500, 'Failed to create notification');
  }
};

export const checkDueTasks = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dueTasks = await Task.find({
    dueDate: {
      $gte: new Date(),
      $lte: tomorrow
    },
    reminderSent: { $ne: true }
  });

  for (const task of dueTasks) {
    if (!task.assignedTo) {
      continue;
    }
    await createNotification(
      task.assignedTo.toString(),
      'TASK_DUE_REMINDER',
      task._id.toString()
    );
    
    await Task.findByIdAndUpdate(task._id, { reminderSent: true });
  }
};