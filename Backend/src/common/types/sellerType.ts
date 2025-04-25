import { UserRole } from "./userType";

export interface Seller {
  shopname: string;
  username: string;
  email: string;
  password: string;
  phone: number;
  address: string;
  timestamp?: Date;
  role: UserRole;
}

export interface SellerUpadte {
  shopname?: string;
  username?: string;
  phone?: number;
  address?: string;
}

export interface AddSeller {
  shopname: string;
  username: string;
  email: string;
  password: string;
  phone: number;
  address: string;
}
