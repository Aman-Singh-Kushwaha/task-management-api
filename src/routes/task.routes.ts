import express from 'express';
import { verifyJWT, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { taskSchema, taskUpdateSchema } from '../validations/schemas';
import { 
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask 
} from '../controllers/task.controller';

const taskRouter = express.Router();

// Create task - Any logged in user
taskRouter.post('/', verifyJWT, validate(taskSchema), createTask);

// Get tasks - Admin gets all, Users get their own
taskRouter.get('/', verifyJWT, getAllTasks);

// Get specific task - Task owner or admin
taskRouter.get('/:taskId', verifyJWT, authorize(['taskOwner']), getTaskById);

// Update task - Task owner or admin
taskRouter.put('/:taskId', verifyJWT, authorize(['taskOwner']), validate(taskUpdateSchema), updateTask);

// Delete task - Task owner or admin
taskRouter.delete('/:taskId', verifyJWT, authorize(['taskOwner']), deleteTask);

export default taskRouter;