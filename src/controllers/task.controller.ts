import { Request, Response } from 'express';
import Task from '../models/Task.model';
import { ApiError } from '../utils/server-utils';
import { ApiResponse } from '../utils/server-utils';

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      dueDate,
      owner: req.user._id
    });

    res.status(201).json(
      new ApiResponse(201, {
        task: {
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          dueDate: task.dueDate
        }
      }, 'Task created successfully')
    );
  } catch (error) {
    if(error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Error creating task');
  }
};

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    let tasks;
    
    if (req.user.role === 'admin') {
      tasks = await Task.find().populate('owner', 'name email');
    } else {
      tasks = await Task.find({ owner: req.user._id });
    }

    res.status(200).json(
      new ApiResponse(200, {
        tasks,
        count: tasks.length
      }, 'Tasks fetched successfully')
    );
  } catch (error) {
    throw new ApiError(500, 'Error fetching tasks');
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('owner', 'name email');

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    res.status(200).json(
      new ApiResponse(200, { task }, 'Task fetched successfully')
    );
  } catch (error) {
    if(error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Error fetching task');
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { title, description, status, dueDate } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { title, description, status, dueDate },
      { new: true, runValidators: true }
    );

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    res.status(200).json(
      new ApiResponse(200, { task }, 'Task updated successfully')
    );
  } catch (error) {
    if(error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Error updating task');
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.taskId);

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    res.status(200).json(
      new ApiResponse(200, null, 'Task deleted successfully')
    );
  } catch (error) {
    if(error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Error deleting task');
  }
};