import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service.js";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await ProductService.listProducts(req.query as any);
    res.status(200).json({
      success: true,
      count: result.data.length,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await ProductService.getProductDetailsBySlug(id);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

