import { CartProduct, UpdateCart } from "../common/types/cartType.js";
import { inject, injectable } from "tsyringe";
import CartRepository from "../repository/cartRepository.js";
import ProductServices from "./productServices.js";

@injectable()
export default class CartService {
  constructor(
    @inject(CartRepository) private cartRepository: CartRepository,
    @inject(ProductServices) private productServices: ProductServices
  ) {}
  public async getProducts() {
    try {
      return await this.cartRepository.getProducts();
    } catch (err) {
      console.log("Failed to get all the products in the cart", err);
      throw err;
    }
  }

  public async getProductById(productid: string, userid: string) {
    try {
      return await this.cartRepository.getProductById(productid, userid);
    } catch (err) {
      console.log("Failed to get a product in cart by product/user id", err);
      throw err;
    }
  }

  public async getProduct(userid: string) {
    try {
      return await this.cartRepository.getProduct(userid);
    } catch (err) {
      console.log("Failed to get user's cart products", err);
      throw err;
    }
  }

  private generateCartProduct(product: any, quantity: number): CartProduct {
    return {
      productid: product._id,
      sellerid: product.sellerid ?? "",
      name: product.name,
      quantity,
      description: product.description ?? "",
    };
  }

  public async createCart(userid: string) {
    try {
      const cart = await this.getProduct(userid);
      if (cart) throw new Error("Cart already exists");
      return await this.cartRepository.createCart(userid);
    } catch (err) {
      throw err;
    }
  }

  public async addProduct(userid: string, productId: string, quantity: number) {
    try {
      const product =
        (await this.productServices.getProductById(productId)) ?? undefined;
      if (!product) return "noproduct";
      if (product.inventory < quantity) return "insufficientinventory";
      const newProduct = this.generateCartProduct(product, quantity);
      return await this.cartRepository.addProduct(
        userid,
        newProduct,
        quantity,
        product.inventory
      );
    } catch (err) {
      console.error("Failed to add product to cart", err);
      throw err;
    }
  }

  public async removeProduct(userid: string, productid: string) {
    try {
      return await this.cartRepository.removeProduct(userid, productid);
    } catch (err) {
      console.log("Failed to remove product from cart", err);
      throw err;
    }
  }

  public async removeProducts(userid: string, products: string[]) {
    try {
      return await this.cartRepository.removeProducts(userid, products);
    } catch (err) {
      console.log("Failed to remove multiple products from cart", err);
      throw err;
    }
  }

  public async updateProduct(uid: string, pid: string, update: UpdateCart) {
    try {
      const product =
        (await this.productServices.getProductById(pid)) ?? undefined;
      if (!product) return "noproduct";
      if (product.inventory < update.quantity) return "insufficientinventory";
      return await this.cartRepository.updateProduct(uid, pid, update);
    } catch (err) {
      console.log("Failed to update product in cart", err);
      throw err;
    }
  }

  public async cartTotal(userid: string) {
    try {
      const data = await this.cartRepository.totalCartPrice(userid);
      const products = await this.productServices.getProducts();
      const productMap = new Map(
        products.map((p) => [p._id.toString(), p.price])
      );
      return data?.reduce((sum, item) => {
        const price = productMap.get(item.productid) || 0;
        return sum + price * item.quantity;
      }, 0);
    } catch (err) {
      console.log("Failed to calculate total cart price", err);
      throw err;
    }
  }

  public async deleteCart(userid: string) {
    try {
      return await this.cartRepository.deleteCart(userid);
    } catch (err) {
      throw err;
    }
  }
}
