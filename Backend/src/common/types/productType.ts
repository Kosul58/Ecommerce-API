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
  discount?: number;
  timestamp?: Date;
  images?: string[];
}

export interface AddProduct {
  name: string;
  price: number;
  inventory: number;
  sellerid: string;
  description: string;
  category: string;
  discount?: number;
}

export interface UpdateProdcut {
  name?: string;
  price?: number;
  invetory?: number;
  description?: string;
  category?: string;
  discount?: number;
  images?: string[];
}

export interface ProductReturn {
  id: string;
  name: string;
  sellerid: string;
  price: number;
  description: string;
  category: string;
  inventory: number;
  timestamp: string;
  images?: string[];
  discount?: number;
  discounttype?: string;
}

export interface SellerProductReturn extends ProductReturn {
  active: boolean;
}
