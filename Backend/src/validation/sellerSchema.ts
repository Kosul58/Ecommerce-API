import Joi from "joi";
export const signUpSchema = Joi.object({
  // shopname: Joi.string().min(2).max(50).required(),
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
  password: Joi.string().min(2).required(),
  confirmpassword: Joi.string().min(2).required(),
  // phone: Joi.number().integer().min(1000000000).max(9999999999).required(),
  // address: Joi.string().min(5).max(100).required(),
});

export const signInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(2).required(),
});

export const updateSchema = Joi.object({
  shopname: Joi.string().min(2).max(50).optional(),
  username: Joi.string().min(3).max(30).optional(),
  phone: Joi.number().integer().min(1000000000).max(9999999999).optional(),
  address: Joi.string().min(2).max(100).optional(),
});
