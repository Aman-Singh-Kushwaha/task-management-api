import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { ApiResponse, ApiError } from '../utils/server-utils';

const signToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: '7d'
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ApiError(400, 'User already exists');
    }

    const user = await User.create({
      name,
      email,
      password
    });

    const token = signToken(user._id, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production', // SSL cert chahiye hoga
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(201).json(
      new ApiResponse(201, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }, 'User registered successfylly'
      )
    );
  } catch (error) {
    if(error instanceof ApiError) {
      return res.status(error.statusCode).json({ status: error.statusCode, message: error.message });
    } else {
      throw new ApiError(500,'Server Error',[],(error as Error)?.stack);
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, 'Invalid User Credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid Password Credentials');
    }

    const token = signToken(user._id, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json(
      new ApiResponse(200, {
        user:{
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }, "Login successfull")
    );
  } catch (error) {
    if(error instanceof ApiError) {
      return res.status(error.statusCode).json({ status: error.statusCode, message: error.message });
    } else {
      throw new ApiError(500, 'Server error', [], (error as Error)?.stack);
    }
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      'User logged out successfully'
    )
  );
};