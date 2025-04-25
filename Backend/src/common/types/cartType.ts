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
}
