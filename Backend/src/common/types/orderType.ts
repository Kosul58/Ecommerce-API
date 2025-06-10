import { CartProduct } from "./cartType";
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

export enum PaymentMethod {
  CASH = "Cash On Delivery",
  ESEWA = "Esewa",
  REPLACE = "Replace",
  REFUND = "Refund",
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
  CANCELED = "Canceled",
}

export enum DeliveryStatus {
  PLACED = "Placed",
  CONFIRMED = "Confirmed",
  PROCESSING = "Processing",
  SHIPPED = "Shipped",
  DELIVERYREADY = "Ready for delivery",
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
  productTrack: OrderTrack[];
}

export interface OrderTrack {
  status: string;
  time: string;
}
export interface BaseOrder {
  userid: string;
  items: OrderProduct[];
  total: number;
  timestamp?: Date;
  paymentMethod: PaymentMethod;
  paymentStatus: boolean;
  address: string;
  orderTrack: OrderTrack[];
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
