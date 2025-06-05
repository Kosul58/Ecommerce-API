// validations/userValidation.ts
import Joi from "joi";
import { UserRole } from "../common/types/userType.js";

export const signUpSchema = Joi.object({
  // firstname: Joi.string().min(2).required(),
  // lastname: Joi.string().min(2).required(),
  username: Joi.string().min(3).max(30).required().invalid(""),
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
  // phone: Joi.number().min(1000000000).max(9999999999).required(),
  // address: Joi.string().min(5).required(),
  // image: Joi.string().optional(),
});

export const signInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(2).required(),
});

export const updatePasswordSchema = Joi.object({
  oldpassword: Joi.string().min(6).required().messages({
    "string.base": "Old password must be a string",
    "string.empty": "Old password is required",
    "string.min": "Old password must be at least 6 characters",
    "any.required": "Old password is required",
  }),
  newpassword: Joi.string().min(6).required().messages({
    "string.base": "New password must be a string",
    "string.empty": "New password is required",
    "string.min": "New password must be at least 6 characters",
    "any.required": "New password is required",
  }),
});

export const updateSchema = Joi.object({
  firstname: Joi.string()
    .min(2)
    .max(30)
    .pattern(/^[A-Za-z\s]+$/)
    .message("First name can only contain letters and spaces"),

  lastname: Joi.string()
    .min(2)
    .max(30)
    .pattern(/^[A-Za-z\s]+$/)
    .message("Last name can only contain letters and spaces"),

  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .message("Username can only contain letters and numbers"),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .message("Phone number must be 10 digits"),

  address: Joi.string()
    .min(5)
    .max(100)
    .message("Address must be between 5 and 100 characters"),

  email: Joi.string().email().message("Invalid email format"),

  image: Joi.string(),

  image_removed: Joi.string(),
});

export const idSchema = Joi.object({
  id: Joi.string().min(15).required(),
  username: Joi.string().optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().optional(),
  iat: Joi.optional(),
  exp: Joi.optional(),
});

export const deleteProductSchema = Joi.object({
  productids: Joi.array()
    .items(Joi.string().min(15).required())
    .min(1)
    .required(),
});

export const hideSchema = Joi.object({
  productids: Joi.array()
    .items(Joi.string().length(24).hex().required())
    .min(1)
    .required(),
  status: Joi.boolean().required(),
});
