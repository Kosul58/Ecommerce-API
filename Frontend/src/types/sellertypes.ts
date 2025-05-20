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
  categoryData: CategoryTree | null;
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
