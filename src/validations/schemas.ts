import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters'),
    email: z.string()
      .email('Invalid email format'),
    password: z.string()
      .min(6, 'Password must be at least 6 characters')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email format'),
    password: z.string()
      .min(6, 'Password must be at least 6 characters')
  })
});

export const taskSchema = z.object({
  body: z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(100, 'Title must not exceed 100 characters'),
    description: z.string()
      .min(1, 'Description is required')
      .max(500, 'Description must not exceed 500 characters'),
    dueDate: z.string()
      .refine((date) => new Date(date) >= new Date(), {
        message: 'Due date cannot be in the past'
      }),
    assignedTo: z.string().optional()
  })
});

export const taskUpdateSchema = z.object({
  body: z.object({
    title: z.string()
      .max(100, 'Title must not exceed 100 characters')
      .optional(),
    description: z.string()
      .max(500, 'Description must not exceed 500 characters')
      .optional(),
    status: z.enum(['pending', 'in-progress', 'completed'])
      .optional(),
    dueDate: z.string()
      .refine((date) => !date || new Date(date) >= new Date(), {
        message: 'Due date cannot be in the past'
      })
      .optional(),
    assignedTo: z.string().optional()
  })
});

export const userUpdateSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters')
      .optional(),
    email: z.string()
      .email('Invalid email format')
      .optional()
  })
});