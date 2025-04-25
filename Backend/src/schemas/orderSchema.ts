import Joi from "joi";
import { DeliveryStatus, OrderProductStatus } from "../common/types/orderType";

const orderStatusValues = Object.values(DeliveryStatus);
const productStatusValues = Object.values(OrderProductStatus);
export const orderSchema = Joi.object({
  userid: Joi.string().min(15).required(),
  productid: Joi.string().min(15).required(),
});

export const ordersSchema = Joi.object({
  userid: Joi.string().min(15).required(),
  products: Joi.array().items(Joi.string()).min(1).required(),
});

export const orderParamsSchema = Joi.object({
  userid: Joi.string().min(15).required(),
});

export const orderStatusSchema = Joi.object({
  orderid: Joi.string().min(15).required(),
  userid: Joi.string().min(15).required(),
  status: Joi.string()
    .valid(...orderStatusValues)
    .required(),
});

export const productStatusSchema = Joi.object({
  orderid: Joi.string().min(15).required(),
  productid: Joi.string().min(15).required(),
  status: Joi.string()
    .valid(...productStatusValues)
    .required(),
});

export const cancelWholeSchema = Joi.object({
  orderid: Joi.string().min(15).required(),
});

export const cancelSingleSchema = Joi.object({
  orderid: Joi.string().min(15).required(),
  productid: Joi.string().min(15).required(),
});

export const returnSchema = Joi.object({
  orderid: Joi.string().min(15).required(),
  userid: Joi.string().min(15).required(),
  productid: Joi.string().min(15).required(),
  type: Joi.string().min(15).required(),
});
