import Joi from "joi";

export const updateSchema = Joi.object({
  name: Joi.string().min(3).optional(),
  description: Joi.string().optional(),
  parentId: Joi.optional(),
});

export const StatusSchema = Joi.object({
  status: Joi.boolean().required(),
  categoryid: Joi.string().min(15).required(),
});
export const createSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().required(),
  parentId: Joi.optional(),
});

export const categoryParamsSchema = Joi.object({
  categoryid: Joi.string().min(15).required(),
});
