import { Request, Response } from 'express';
import Notification from '../models/Notification.model';
import { ApiError, ApiResponse } from '../utils/server-utils';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(
      new ApiResponse(200, { notifications }, 'Notifications fetched successfully')
    );
  } catch (error) {
    throw new ApiError(500, 'Error fetching notifications');
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    res.status(200).json(
      new ApiResponse(200, { notification }, 'Notification marked as read')
    );
  } catch (error) {
    throw new ApiError(500, 'Error marking notification as read');
  }
};
