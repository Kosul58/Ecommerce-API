import Joi from "joi";

export const addSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  price: Joi.number().positive().required(),
  inventory: Joi.number().positive().required(),
  sellerid: Joi.string().min(15).required(),
  description: Joi.string().max(500).required(),
  category: Joi.string().required(),
  image: Joi.string().optional(),
});

export const updateSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  price: Joi.number().positive().optional(),
  inventory: Joi.number().positive().optional(),
  description: Joi.string().max(500).optional(),
  category: Joi.string().optional(),
  sellerid: Joi.string().min(15).optional(),
});

export const productParamsSchema = Joi.object({
  productid: Joi.string().min(15).required(),
});

export const modifySchema = Joi.object({
  quantity: Joi.number().positive().required(),
  modification: Joi.string().min(7).required(),
});
