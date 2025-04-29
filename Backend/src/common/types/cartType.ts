import { Document, Types } from "mongoose";

export interface Cart {
  _id?: string | Types.ObjectId;
  userid: string;
  products: CartProduct[];
}

export interface CartProduct {
  sellerid: string;
  productid: string;
  name: string;
  quantity: number;
  description?: string | null;
}

export type CartDocument = Cart & Document;
