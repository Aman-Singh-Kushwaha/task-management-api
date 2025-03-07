import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import Task from '../models/Task.model';

import { ApiError } from '../utils/server-utils';

interface JwtPayload {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user: {
        _id: string;
        role: 'user' | 'admin';
        email: string;
        name: string;
      };
    }
  }
}

export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new ApiError(401,'Not authorized to access this route');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(404,'User not found');
    }

    // Adding user to request object for further application
    req.user = {
      _id: user._id.toString(),
      role: user.role as 'user' | 'admin',
      email: user.email,
      name: user.name
    };
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        message: error.message
      });
    } else {
      res.status(400).json({
        message: 'server verification failed',
      });
    }
  }
};

type AuthorizationRole = 'admin' | 'self' | 'taskOwner' | 'taskAssignee';

export const authorize = (allowedRoles: AuthorizationRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Always allow admin
      if (req.user.role === 'admin') return next();

      for (const role of allowedRoles) {
        switch (role) {
          case 'self':
            // Check if user is acting on their own profile
            if (req.params.userId === req.user._id.toString()) {
              return next();
            }
            break;

          case 'taskOwner':
            // Check if user owns the task
            const task = await Task.findById(req.params.taskId);
            if (!task) {
              throw new ApiError(404, 'Task not found');
            }
            if (task.owner.toString() === req.user._id.toString()) {
              return next();
            }
            break;

          case 'taskAssignee':
            // Check if user is assigned to the task
            const assignedTask = await Task.findById(req.params.taskId);
            if (!assignedTask) {
              throw new ApiError(404, 'Task not found');
            }
            if (assignedTask.assignedTo && assignedTask.assignedTo.toString() === req.user._id.toString()) {
              return next();
            }
            break;
        }
      }

      throw new ApiError(403, 'You do not have permission to perform this action');
    } catch (error) {
      next(error);
    }
  };
};