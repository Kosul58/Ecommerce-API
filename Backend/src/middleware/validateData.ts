import { Request, Response, NextFunction } from "express";

import Joi from "joi";
import { injectable } from "tsyringe";

@injectable()
export default class DataValidation {
  public validateBody(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      const { error } = schema.validate(req.body, { abortEarly: false });
      if (error) {
        res.status(400).json({
          message: "Validation error",
          details: error.details.map((err) => err.message),
        });
        return;
      }
      next();
    };
  }
  public validateTokenData(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      const { error } = schema.validate(req.user, { abortEarly: false });
      if (error) {
        res.status(400).json({
          message: "Validation error",
          details: error.details.map((err) => err.message),
        });
        return;
      }
      next();
    };
  }
  public validateParams(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      const { error } = schema.validate(req.params, { abortEarly: false });
      if (error) {
        res.status(400).json({
          message: "Validation error",
          details: error.details.map((err) => err.message),
        });
        return;
      }
      next();
    };
  }
}
