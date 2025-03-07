import Notification from '../models/Notification.model';
import { sendEmail } from './email.service';
import Task from '../models/Task.model';
import User from '../models/User.model';
import { ApiError } from '../utils/server-utils';

// Notification message templates
const notificationTemplates = {
  TASK_ASSIGNED: (taskTitle: string) => ({
    message: `You have been assigned a new task: ${taskTitle}`,
    subject: 'New Task Assigned'
  }),
  TASK_DUE_REMINDER: (taskTitle: string) => ({
    message: `Task "${taskTitle}" is due tomorrow`,
    subject: 'Task Due Reminder'
  })
};

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

    const template = notificationTemplates[type](task.title);

    const notification = await Notification.create({
      recipient: recipientId,
      type,
      message: template.message,
      taskId
    });

    // Attempt to send email, but don't fail if email fails
    try {
      await sendEmail({
        to: recipient.email,
        subject: template.subject,
        text: template.message
      });
    } catch (error) {
      console.error('Email sending failed:', error);
    }

    return notification;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to create notification');
  }
};

export const checkDueTasks = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueTasks = await Task.find({
      dueDate: {
        $gte: today,
        $lt: tomorrow
      },
      assignedTo: { $exists: true }
    }).populate('assignedTo');

    const notifications = await Promise.allSettled(
      dueTasks.map(async (task) => {
        // Check if reminder already sent today
        const reminderExists = await Notification.findOne({
          taskId: task._id,
          type: 'TASK_DUE_REMINDER',
          createdAt: { $gte: today }
        });

        if (!reminderExists && task.assignedTo) {
          return createNotification(
            task.assignedTo.toString(),
            'TASK_DUE_REMINDER',
            task._id.toString()
          );
        }
      })
    );

    // Logging any failed notifications
    notifications.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `Failed to send notification for task ${dueTasks[index]._id}:`,
          result.reason
        );
      }
    });
  } catch (error) {
    console.error('Task reminder check failed:', error);
    throw new ApiError(500, 'Failed to check due tasks');
  }
};