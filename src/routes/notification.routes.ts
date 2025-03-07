import express from 'express';
import { verifyJWT, authorize } from '../middlewares/auth.middleware';
import { 
  getNotifications,
  markAsRead 
} from '../controllers/notification.controller';

const notificationRouter = express.Router();

notificationRouter.get('/', verifyJWT, getNotifications);
notificationRouter.patch('/:notificationId/read', verifyJWT, authorize(['self']),markAsRead);

export default notificationRouter;