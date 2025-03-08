import express from 'express';
import { verifyJWT, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { userUpdateSchema } from '../validations/schemas';
import { 
  getAllUsers,
  updateUser,
  deleteUser,
  getTaskStats,
} from '../controllers/user.controller';

const userRouter = express.Router();

// Admin only routes
userRouter.get('/', verifyJWT, authorize(['admin']), getAllUsers);
userRouter.delete('/:userId', verifyJWT, authorize(['admin']), deleteUser);
userRouter.get('/stats', verifyJWT, getTaskStats);

// Admin or self routes
userRouter.put('/:userId', verifyJWT, authorize(['admin', 'self']), validate(userUpdateSchema), updateUser);

export default userRouter;