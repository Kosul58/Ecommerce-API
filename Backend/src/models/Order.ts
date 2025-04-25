// models/Order.ts
import mongoose, { Schema, Document, model } from "mongoose";
import {
  OrderType,
  DeliveryStatus,
  ReturnStatus,
  OrderProduct,
  BaseOrder,
  DeliveryOrder,
  ReturnOrder,
  OrderProductStatus,
} from "../common/types/orderType";

interface OrderDocument extends Document {
  userid: string;
  items: OrderProduct[];
  total: number;
  timestamp?: Date;
  type: OrderType;
  status: DeliveryStatus | ReturnStatus;
  deliveryTime?: string;
  returnTime?: string;
}

const OrderProductSchema = new Schema<OrderProduct>(
  {
    productid: { type: String, required: true },
    sellerid: {
      type: String,
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    active: { type: Boolean, required: true },
    status: {
      type: String,
      enum: Object.values(OrderProductStatus),
      required: true,
    },
  }
  // ,
  // {
  //   _id: false,
  // }
);

const OrderSchema = new Schema<OrderDocument>({
  userid: { type: String, required: true },
  items: { type: [OrderProductSchema], required: true },
  total: { type: Number, required: true },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  type: {
    type: String,
    enum: Object.values(OrderType),
    required: true,
  },
  status: {
    type: String,
    enum: [...Object.values(DeliveryStatus), ...Object.values(ReturnStatus)],
    required: true,
  },
  deliveryTime: { type: String },
  returnTime: { type: String },
});

// Create and export the model
const OrderModel = model<OrderDocument>("Order", OrderSchema);

export default OrderModel;
