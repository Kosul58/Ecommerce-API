import { Request, Response, NextFunction } from "express";
import {
  signUpSchema,
  signInSchema,
  updateUserSchema,
  idSchema,
} from "../schemas/userSchema.js";
import Joi from "joi";
import { injectable } from "tsyringe";
@injectable()
export default class DataValidation {
  private validateBody(schema: Joi.ObjectSchema) {
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
  private validateUser(schema: Joi.ObjectSchema) {
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

  private validateParams(schema: Joi.ObjectSchema) {
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
  public signUpValidation() {
    return this.validateBody(signUpSchema);
  }
  public signInValidation() {
    return this.validateBody(signInSchema);
  }
  public updateUserValidation() {
    return this.validateBody(updateUserSchema);
  }
  public userValidation() {
    return this.validateUser(idSchema);
  }
}
