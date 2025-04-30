import Joi from "joi";

export const updateSchema = Joi.object({
  userid: Joi.string().min(15).required(),
  productid: Joi.string().min(15).required(),
  quantity: Joi.number().positive().required(),
});

export const viewCartParamsSchema = Joi.object({
  productid: Joi.string().min(15).required(),
  userid: Joi.string().min(15).required(),
});

export const viewUserCartParamsSchema = Joi.object({
  userid: Joi.string().min(15).required(),
});

export const addCartSchema = Joi.object({
  productid: Joi.string().min(15).required(),
  quantity: Joi.number().positive().required(),
});

export const removeProductSchema = Joi.object({
  userid: Joi.string().min(15).required(),
  productid: Joi.string().min(15).required(),
});

export const removeProductsSchema = Joi.object({
  userid: Joi.string().min(15).required(),
  products: Joi.array().items(Joi.string()).min(1).required(),
});
