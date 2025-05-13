import Joi from "joi";
import { DeliveryStatus, OrderProductStatus } from "../common/types/orderType";
enum AdminStatus {
  SHIPPED = "Shipped",
  OUTFORDELIVERY = "Out for Delivery",
  DELIVERED = "Delivered",
}
const orderStatusValues = Object.values(AdminStatus);
const productStatusValues = Object.values(OrderProductStatus);
export const orderSchema = Joi.object({
  productid: Joi.string().min(15).required(),
  paymentMethod: Joi.string().min(3).required(),
});

export const ordersSchema = Joi.object({
  products: Joi.array().items(Joi.string()).min(1).required(),
  paymentMethod: Joi.string().min(3).required(),
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
