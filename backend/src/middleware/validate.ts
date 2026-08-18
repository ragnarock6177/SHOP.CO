import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validateRequest(schema: z.ZodTypeAny) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as any;

      // Replace req inputs with parsed/sanitized Zod outputs
      if (parsed?.body) req.body = parsed.body;
      if (parsed?.query) req.query = parsed.query;
      if (parsed?.params) req.params = parsed.params;

      next();
    } catch (error) {
      next(error);
    }
  };
}
