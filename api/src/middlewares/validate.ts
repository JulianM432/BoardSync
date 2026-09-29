import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res
        .status(400)
        .json({
          message: "Datos invalidos",
          errors: result.error.issues.map((issue) => issue.message),
        });
      return;
    }
    req.body = result.data;
    next();
  };
};
