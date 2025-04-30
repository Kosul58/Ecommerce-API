export interface Product {
  productid?: string;
  name: string;
  price: number;
  inventory: number;
  sellerid: string;
  description: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
  timestamp?: Date;
}

export interface AddProduct {
  name: string;
  price: number;
  inventory: number;
  sellerid: string;
  description: string;
  category: string;
}

export interface UpdateProdcut {
  name?: string;
  price?: number;
  invetory?: number;
  description?: string;
  category?: string;
}

export interface ProductReturn {
  id: string;
  name: string;
  sellerid: string;
  price: number;
  description: string;
  category: string;
  inventory: number;
}
