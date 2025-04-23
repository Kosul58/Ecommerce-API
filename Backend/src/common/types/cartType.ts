export interface Cart {
  userid: string;
  products: CartProduct[];
}

export interface CartProduct {
  sellerid: string;
  productid: string;
  name: string;
  quantity: number;
  description?: string;
  category?: string;
  price?: number;
}

export interface UpdateCart {
  // name?: string;
  price?: number;
  quantity: number;
  description?: string;
  category?: string;
}
