import Joi from "joi";

export const deleteSchema = Joi.object({
  ids: Joi.array().items(Joi.string()).min(1).required(),
});

export const createSchema = Joi.object({
  name: Joi.string().min(4).required(),
});
