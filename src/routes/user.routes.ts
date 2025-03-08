import express from 'express';
import { verifyJWT, authorize } from '../middlewares/auth.middleware';
import { 
  getAllUsers,
  updateUser,
  deleteUser 
} from '../controllers/user.controller';

const userRouter = express.Router();

// Admin only routes
userRouter.get('/', verifyJWT, authorize(['admin']), getAllUsers);
userRouter.delete('/:userId', verifyJWT, authorize(['admin']), deleteUser);

// Admin or self routes
userRouter.put('/:userId', verifyJWT, authorize(['admin', 'self']), updateUser);

export default userRouter;