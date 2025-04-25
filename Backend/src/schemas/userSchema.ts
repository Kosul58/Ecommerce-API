// validations/userValidation.ts
import Joi from "joi";
import { UserRole } from "../common/types/userType.js";

export const signUpSchema = Joi.object({
  firstname: Joi.string().min(2).required(),
  lastname: Joi.string().min(2).required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(2).required(),
  phone: Joi.number().min(1000000000).max(9999999999).required(),
  address: Joi.string().min(5).required(),
});

export const signInSchema = Joi.object({
  username: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(2).required(),
});

export const updateSchema = Joi.object({
  firstname: Joi.string().min(2),
  lastname: Joi.string().min(2),
  username: Joi.string().alphanum().min(3).max(30),
  phone: Joi.number(),
  address: Joi.string().min(2),
});

export const idSchema = Joi.object({
  id: Joi.string().min(15).required(),
});
