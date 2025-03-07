import { Request, Response } from 'express';
import Task from '../models/Task.model';
import { ApiError, ApiResponse } from '../utils/server-utils';
import { buildTaskQuery, buildSortOptions, getPaginationOptions } from '../utils/task.utils';
import { TaskQuery, TaskListResponse } from '../types/task.types';
import { createNotification } from '../services/notification.service';

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

export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate and sanitize query parameters
    const validatedQuery: TaskQuery = {
      page: req.query.page?.toString(),
      limit: req.query.limit?.toString(),
      sort: req.query.sort?.toString(),
      status: req.query.status as 'pending' | 'in-progress' | 'completed',
      search: req.query.search?.toString()
    };

    // Validate status if provided
    if (validatedQuery.status && 
        !['pending', 'in-progress', 'completed'].includes(validatedQuery.status)) {
      throw new ApiError(400, 'Invalid status value');
    }

    // Build query with validated parameters
    const query = buildTaskQuery(
      req.user._id,
      req.user.role === 'admin',
      validatedQuery
    );

    // Validate sort field
    const allowedSortFields = ['createdAt', 'dueDate', 'status', 'title'];
    const sortField = validatedQuery.sort?.split(':')[0];
    if (sortField && !allowedSortFields.includes(sortField)) {
      throw new ApiError(400, 'Invalid sort field');
    }

    const sort = buildSortOptions(validatedQuery.sort);
    const { page, limit, skip } = getPaginationOptions(validatedQuery);

    // Execute queries
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('owner', 'name email')
        .populate('assignedTo', 'name email')
        .lean(),
      Task.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    // Handle no results case
    if (tasks.length === 0 && page > 1 && total > 0) {
      validatedQuery.page = Math.ceil(total / limit).toString();
      return await getAllTasks(req, res);
    }

    const responseData: TaskListResponse = {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };

    res.status(200).json(
      new ApiResponse(200, responseData, 'Tasks fetched successfully')
    );
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message
      });
      return;
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
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
    const updateFields: { [key: string]: any } = {};
    
    if (req.body.title !== undefined) updateFields.title = req.body.title;
    if (req.body.description !== undefined) updateFields.description = req.body.description;
    if (req.body.status !== undefined) updateFields.status = req.body.status;
    if (req.body.dueDate !== undefined) updateFields.dueDate = req.body.dueDate;
    if (req.body.assignedTo !== undefined) updateFields.assignedTo = req.body.assignedTo;

    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    // Create notification after successful update
    if (updateFields.assignedTo) await createNotification(
      req.body.assignedTo,
      'TASK_ASSIGNED',
      task._id.toString()
    );

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