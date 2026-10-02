import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { registerSchema, loginSchema } from '../validators/authValidators';

const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '15m',
  });
};

const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret', {
    expiresIn: '7d',
  });
};

const setCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth/refresh',
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({ user: { id: user.id, email: user.email } });
  } catch (error: any) {
    res.status(400).json({ message: error.errors || error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    setCookies(res, accessToken, refreshToken);

    res.json({ user: { id: user.id, email: user.email } });
  } catch (error: any) {
    res.status(400).json({ message: error.errors || error.message });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  res.json({ message: 'Logged out successfully' });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ message: 'Refresh token not found' });
    return;
  }
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret') as { userId: string };
    
    // Rotate refresh token
    const newAccessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);
    
    setCookies(res, newAccessToken, newRefreshToken);
    
    res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

export const me = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true },
    });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
