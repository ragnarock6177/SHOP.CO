import { Request, Response, NextFunction } from 'express';

export const loginUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: 'mock-jwt-token-shop-co-2026',
      user: {
        id: 'usr-1',
        name: 'Alex Morgan',
        email,
        role: 'customer'
      }
    });
  } catch (error) {
    next(error);
  }
};

export const registerUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: 'mock-jwt-token-shop-co-2026',
      user: {
        id: `usr-${Date.now()}`,
        name,
        email,
        role: 'customer'
      }
    });
  } catch (error) {
    next(error);
  }
};
