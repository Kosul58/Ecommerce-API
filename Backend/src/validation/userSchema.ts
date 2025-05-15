// validations/userValidation.ts
import Joi from "joi";
import { UserRole } from "../common/types/userType.js";

export const signUpSchema = Joi.object({
  firstname: Joi.string().min(2).required(),
  lastname: Joi.string().min(2).required(),
  username: Joi.string().alphanum().min(3).max(30).required().invalid(""),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .invalid("")
    .messages({
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
      "any.invalid": "Email cannot be empty",
    }),
  password: Joi.string().min(6).required(),
  confirmpassword: Joi.string().min(6).required(),
  phone: Joi.number().min(1000000000).max(9999999999).required(),
  address: Joi.string().min(5).required(),
  image: Joi.string().optional(),
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
  username: Joi.string().optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().optional(),
  iat: Joi.optional(),
  exp: Joi.optional(),
});

export const hideSchema = Joi.object({
  products: Joi.array()
    .items(Joi.string().length(24).hex().required())
    .min(1)
    .required(),
  status: Joi.boolean().required(),
});
