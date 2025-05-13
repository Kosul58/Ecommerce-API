export interface Options {
  [key: string]: string | number | boolean;
}
export interface DeleteMail {
  username: string;
  email: string;
}
export interface SignUpMail extends DeleteMail {}
export interface ProductMail {
  name: string;
  price: number;
  category: string;
}

export interface OrderMailData {
  username: string;
  email: string;
  cost: number;
  paymentMethod: string;
  products: {
    name: string;
    price: number;
    quantity: number;
  }[];
}
