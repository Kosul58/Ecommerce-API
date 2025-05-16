import Joi from "joi";
export const addSchema = Joi.object({
  name: Joi.string().min(1).max(200).required().invalid(""),
  price: Joi.number().positive().required().invalid(""),
  inventory: Joi.number().positive().required().invalid(""),
  description: Joi.string().max(1000).required().invalid(""),
  category: Joi.string().required().invalid(""),
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
export const removeImageSchema = Joi.object({
  imageUrl: Joi.string().min(15).required(),
  productid: Joi.string().min(15).required(),
});
