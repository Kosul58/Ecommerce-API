import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { injectable } from "tsyringe";
import logger from "../utils/logger";

@injectable()
export default class DataValidation {
  private validate(schema: Joi.ObjectSchema, data: any) {
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
      const err = new Error("Validation failed");
      err.name = "ValidationError";
      (err as any).details = error.details.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      logger.warn("Validation failed", {
        errorDetails: (err as any).details,
      });

      return err;
    }
    return null;
  }

  public validateBody(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      const err = this.validate(schema, req.body);
      if (err) {
        logger.warn(
          `Validation error in body for request: ${req.method} ${req.originalUrl}`,
          {
            errorDetails: (err as any).details,
          }
        );
        return next(err);
      }

      logger.info(
        `Validation passed for body in request: ${req.method} ${req.originalUrl}`
      );
      next();
    };
  }

  public validateTokenData(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      const err = this.validate(schema, req.user);
      if (err) {
        logger.warn(
          `Validation error in token data for request: ${req.method} ${req.originalUrl}`,
          {
            errorDetails: (err as any).details,
          }
        );
        return next(err);
      }

      logger.info(
        `Validation passed for token data in request: ${req.method} ${req.originalUrl}`
      );
      next();
    };
  }

  public validateParams(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      const err = this.validate(schema, req.params);
      if (err) {
        logger.warn(
          `Validation error in params for request: ${req.method} ${req.originalUrl}`,
          {
            errorDetails: (err as any).details,
          }
        );
        return next(err);
      }

      logger.info(
        `Validation passed for params in request: ${req.method} ${req.originalUrl}`
      );
      next();
    };
  }
}
