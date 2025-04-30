import { CartProduct } from "./cartType.js";
import { Document, Types } from "mongoose";

export interface Order {
  _id?: string | Types.ObjectId;
  orderid?: string;
  userid: string;
  timestamp?: Date;
  type?: string;
  status: DeliveryStatus | ReturnStatus;
  items: OrderProduct[];
  total: number;
}

export enum OrderType {
  DELIVERY = "Delivery",
  REFUND = "Refund",
  REPLACE = "Replace",
}

export enum OrderProductStatus {
  REQUESTED = "Requested",
  REJECTED = "Rejected",
  ACCEPTED = "Accepted",
  READY = "Ready",
}

export enum DeliveryStatus {
  PENDING = "Pending",
  CONFIRMED = "Confirmed",
  PROCESSING = "Processing",
  SHIPPED = "Shipped",
  OUTFORDELIVERY = "Out for Delivery",
  DELIVERED = "Delivered",
  CANCELED = "Canceled",
}

export enum ReturnStatus {
  REQUESTED = "Requested",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  REPLACED = "Replaced",
  REFUNDED = "Refunded",
}

export type OrderStatus = DeliveryStatus | ReturnStatus;

export interface OrderProduct {
  productid: string;
  sellerid: string;
  name: string;
  price: number;
  quantity: number;
  active: boolean;
  status: OrderProductStatus;
}

export interface BaseOrder {
  userid: string;
  items: OrderProduct[];
  total: number;
  timestamp?: Date;
}

export interface DeliveryOrder extends BaseOrder {
  type: OrderType.DELIVERY;
  status: DeliveryStatus;
  deliveryTime: string;
}

export interface ReturnOrder extends BaseOrder {
  type: OrderType.REFUND | OrderType.REPLACE;
  status: ReturnStatus;
  returnTime: string;
}

export type OrderSchema = DeliveryOrder | ReturnOrder;

export type OrderDocumnet = Order & Document;
