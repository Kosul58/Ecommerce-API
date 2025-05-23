export interface Seller {
  id: string;
  username: string;
  email: string;
  phone: number;
  address: string;
  image: string;
}

export interface SellerResponse {
  result: Seller;
  token: string;
}
export interface CategoryTree {
  [key: string]: string | CategoryTree;
}

export interface CategoryListResponse {
  success: boolean;
  message: string;
  data: CategoryTree;
}

export interface Product {
  id: string;
  name: string;
  sellerid: string;
  price: number;
  description: string;
  category: string;
  inventory: string;
  active: boolean;
  images: string[];
}

export interface SellerData {
  seller: Seller;
  // categoryData: CategoryTree | null;
}

export type SignInValues = {
  email: string;
  password: string;
};

type BaseUser = {
  username: string;
  email: string;
  password: string;
  confirmpassword: string;
  phone: string;
  address: string;
};

export type UserValues = BaseUser & {
  firstname: string;
  lastname: string;
};

export type SellerValues = BaseUser & {
  shopname: string;
};

export type SignUpValues = UserValues | SellerValues;

export interface AddProduct {
  name: string;
  price: number;
  inventory: number;
  category: string;
  description: string;
  images: File[];
}

export interface ProductListResponse {
  success: boolean;
  message: string;
  data: Datum[];
}

export interface Datum {
  id: string;
  name: string;
  sellerid: string;
  price: number;
  description: string;
  category: string;
  inventory: number;
  active: boolean;
  images: string[];
}

export interface EditProduct {
  id: string;
  name: string;
  sellerid: string;
  price: number;
  description: string;
  category: string;
  inventory: number;
}

export interface SignInResponse {
  success: boolean;
  message: string;
  data: Data;
}

export interface Data {
  result: Result;
  token: string;
}

export interface Result {
  id: string;
  username: string;
  email: string;
  phone: number;
  address: string;
  image: string;
}
