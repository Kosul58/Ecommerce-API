// models/Order.ts
import mongoose, { Schema, Document, model } from "mongoose";
import {
  OrderType,
  DeliveryStatus,
  ReturnStatus,
  OrderProduct,
  OrderTrack,
  OrderProductStatus,
  PaymentMethod,
} from "../common/types/orderType";

import { boolean } from "joi";

interface OrderDocument extends Document {
  userid: string;
  items: OrderProduct[];
  total: number;
  timestamp?: Date;
  type: OrderType;
  status: DeliveryStatus | ReturnStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: boolean;
  deliveryTime?: string;
  address: string;
  returnTime?: string;
  orderTrack: OrderTrack[];
}
const OrderTrackSchema = new Schema(
  {
    status: { type: String, required: true },
    time: { type: String, required: true },
  },
  { _id: false }
);

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
    productTrack: { type: [OrderTrackSchema] },
  },
  {
    _id: false,
  }
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
  address: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  },
  paymentStatus: {
    type: Boolean,
    required: true,
  },
  deliveryTime: { type: String },
  returnTime: { type: String },
  orderTrack: { type: [OrderTrackSchema] },
});

const OrderModel = model<OrderDocument>("Order", OrderSchema);

export default OrderModel;
