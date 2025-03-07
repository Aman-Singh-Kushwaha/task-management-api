import { TaskQuery } from '../types/task.types';
import { FilterQuery } from 'mongoose';
import { ITask } from '../models/Task.model';

type SortOrder = -1 | 1;

export const buildTaskQuery = (userId: string, isAdmin: boolean, query: TaskQuery) => {
  // Base query - admin sees all, users see their own
  const baseQuery: FilterQuery<ITask> = isAdmin ? {} : { owner: userId };

  // Add status filter if provided
  if (query.status) {
    baseQuery.status = query.status;
  }

  // Add search if provided
  if (query.search) {
    baseQuery.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } }
    ];
  }

  return baseQuery;
};

export const buildSortOptions = (sortQuery?: string) => {
  if (!sortQuery) return { createdAt: -1 }; // default sort

  const [field, order] = sortQuery.split(':');
  return { [field]: order === 'desc' ? -1 : 1 } as { [key: string]: SortOrder };
};

export const getPaginationOptions = (query: TaskQuery) => {
  const page = Math.max(1, parseInt(query.page || '1'));
  const limit = Math.max(1, Math.min(100, parseInt(query.limit || '10')));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};