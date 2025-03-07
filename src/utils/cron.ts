import cron from 'node-cron';
import { checkDueTasks } from '../services/notification.service';

// Run every day at midnight
export const initCronJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      await checkDueTasks();
    } catch (error) {
      console.error('Task reminder cron job failed:', error);
    }
  });
};