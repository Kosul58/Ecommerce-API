import { User, UpdateUser } from "./userType";
import { Cart, CartDocument } from "./cartType";
import { Category, UpdateCategory } from "./categoryType";
import { Order, OrderType, OrderDocumnet } from "./orderType";
import { Product, UpdateProdcut } from "./productType";
import { Seller, SellerUpadte } from "./sellerType";

export interface Repository {
  findAll(): Promise<any>;
  findOne(id: string): Promise<any>;
  deleteOne(id: string): Promise<any>;
  updateOne(id: string, update: any): Promise<any>;
  create(data: any): Promise<any>;
  save(data: any): Promise<any>;
  check(data: string): Promise<any>;
}

export interface CartRepositoryInterface extends Repository {
  getCart(userid: string): Promise<any>;
  createCart(userid: string): Promise<any>;
  saveCart(cart: CartDocument): Promise<any>;
}

export interface CategoryRepositoryInterface extends Repository {
  findActive(): Promise<any>;
  checkCategory(name: string): Promise<any>;
  findUserName(name: string, excludeId?: string): Promise<any>;
  findSubs(parentId: string): Promise<any>;
  updateManyParent(categoryIds: string[]): Promise<any>;
  updateManyStatus(categoryIds: string[], status: boolean): Promise<any>;
}
export interface OrderRepositoryInterface extends Repository {
  orderSave(order: OrderDocumnet): Promise<any>;
  getSellerOrders(): Promise<any>;
  getUserOrders(userid: string): Promise<any>;
  cancelDeliveryOrder(order: OrderDocumnet, productIndex: number): Promise<any>;
  returnOrder(
    orderid: string,
    userid: string,
    productid: string,
    type: OrderType.REFUND | OrderType.REPLACE
  ): Promise<any>;
  insertMany(orders: any): Promise<any>;
}
export interface SellerRepositoryInterface extends Repository {
  findUserName(username: string, excludeId?: string): Promise<boolean | null>;
  findEmail(email: string, excludeId?: string): Promise<boolean | null>;
  findPhone(phone: number, excludeId?: string): Promise<boolean | null>;
  signIn(email: string): Promise<any>;
  signup(seller: Seller): Promise<any>;
}
export interface UserRepositoryInterface extends Repository {
  findUserName(username: string, excludeId?: string): Promise<boolean | null>;
  findEmail(email: string, excludeId?: string): Promise<boolean | null>;
  findPhoneNumber(phone: number, excludeId?: string): Promise<boolean | null>;
  signIn(email: string): Promise<any>;
  signUp(user: User): Promise<any>;
  updatePassword(userid: string, password: string): Promise<any>;
  updateEmail(userid: string, email: string): Promise<any>;
}

export interface ProductRepositoryInteface extends Repository {
  addProducts(products: Product[]): Promise<any>;
  getSellerProducts(id: string): Promise<any>;
  checkProduct(product: Product): Promise<any>;
  checkProducts(products: Product[]): Promise<any>;
  deleteProducts(ids: string[]): Promise<{ deletedCount?: number }>;
  updateStatus(
    ids: string[],
    status: boolean
  ): Promise<{ modifiedCount?: number }>;
  manageInventory(id: string, quantity: number): Promise<any>;
}
