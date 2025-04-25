import Joi from "joi";
export const signUpSchema = Joi.object({
  shopname: Joi.string().min(2).max(50).required(),
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.number().integer().min(1000000000).max(9999999999).required(),
  address: Joi.string().min(5).max(100).required(),
});

export const signInSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const updateSchema = Joi.object({
  shopname: Joi.string().min(2).max(50).optional(),
  username: Joi.string().min(3).max(30).optional(),
  phone: Joi.number().integer().min(1000000000).max(9999999999).optional(),
  address: Joi.string().min(5).max(100).optional(),
});
