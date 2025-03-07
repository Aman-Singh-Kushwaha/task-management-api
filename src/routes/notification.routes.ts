import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { 
  getNotifications,
  markAsRead 
} from '../controllers/notification.controller';

const notificationRouter = express.Router();

notificationRouter.get('/', verifyJWT, getNotifications);
notificationRouter.patch('/:notificationId/read', verifyJWT, markAsRead);

export default notificationRouter;