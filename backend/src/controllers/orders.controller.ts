import { Request, Response, NextFunction } from 'express';

const MOCK_ORDERS: any[] = [];

export const createOrder = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, shippingAddress, paymentMethod, total } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
      return;
    }

    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNum = `TRK${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: 'Processing',
      total,
      trackingNum,
      items,
      shippingAddress,
      paymentMethod
    };

    MOCK_ORDERS.unshift(newOrder);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: newOrder
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      success: true,
      count: MOCK_ORDERS.length,
      data: MOCK_ORDERS
    });
  } catch (error) {
    next(error);
  }
};
