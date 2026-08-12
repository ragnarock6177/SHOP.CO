import { Request, Response, NextFunction } from 'express';

const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Casual', slug: 'casual', itemCount: 142 },
  { id: 'cat-2', name: 'Formal', slug: 'formal', itemCount: 98 },
  { id: 'cat-3', name: 'Party', slug: 'party', itemCount: 84 },
  { id: 'cat-4', name: 'Gym', slug: 'gym', itemCount: 115 }
];

export const getCategories = (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      success: true,
      data: MOCK_CATEGORIES
    });
  } catch (error) {
    next(error);
  }
};
