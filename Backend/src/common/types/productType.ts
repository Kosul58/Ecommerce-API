export interface ProductOptions {
  productid?: string;
  userid?: string;
  orderid?: string;
  name?: string;
  quantity?: number;
  price?: number;
  inventory?: number;
  total?: number;
  description?: string;
  [key: string]: any; // For additional properties
}

//add and fetch products
export interface Product {
  productid?: string;
  name: string;
  price: number;
  inventory: number;
  sellerid: string;
  description?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  timestamp?: Date;
}

export interface AddProduct {
  name: string;
  price: number;
  inventory: number;
  sellerid: string;
  description?: string;
  category?: string;
}

//update product
export interface UpdateProdcut {
  name?: string;
  price?: number;
  invetory?: number;
  description?: string;
  category?: string;
  sellerid?: string;
}
