import { Request, Response } from 'express';
import User from '../models/User.model';
import Task from '../models/Task.model';
import { ApiError, ApiResponse } from '../utils/server-utils';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json(
      new ApiResponse(200, { users }, 'Users fetched successfully')
    );
  } catch (error) {
    throw new ApiError(500, 'Error fetching users');
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const updateFields: { [key: string]: any } = {};

    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json(
      new ApiResponse(200, { user }, 'User updated successfully')
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Error updating user');
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      throw new ApiError(403, 'Admin users cannot be deleted');
    }

    await User.findByIdAndDelete(req.params.userId);

    res.status(200).json(
      new ApiResponse(200, null, 'User deleted successfully')
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Error deleting user');
  }
};

export const getTaskStats = async (req: Request, res: Response) => {
  try {
    const matchQuery = req.user.role === 'admin' ? {} : { owner: req.user._id };

    const [stats] = await Task.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          }
        }
      }
    ]);

    const taskStats = {
      totalTasks: stats?.totalTasks || 0,
      completedTasks: stats?.completedTasks || 0,
      pendingTasks: stats?.pendingTasks || 0,
      inProgressTasks: stats?.inProgressTasks || 0,
      completionRate: stats 
        ? Number(((stats.completedTasks / stats.totalTasks) * 100).toFixed(1))
        : 0
    };

    res.status(200).json(
      new ApiResponse(200, { stats: taskStats }, 'Task statistics fetched successfully')
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Error fetching task statistics');
  }
};