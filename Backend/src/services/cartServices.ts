import apiCartRepository from "../repository/cartRepository.js";
import { CartProduct, UpdateCart } from "../common/types/cartType.js";
import productServices from "./productServices.js";

class CartService {
  public async getProducts() {
    try {
      return await apiCartRepository.getProducts();
    } catch (err) {
      console.log("Failed to get all the products in the cart", err);
      throw err;
    }
  }

  public async getProductById(productid: string, userid: string) {
    try {
      return await apiCartRepository.getProductById(productid, userid);
    } catch (err) {
      console.log("Failed to get a product in cart by product/user id", err);
      throw err;
    }
  }

  public async getProduct(userid: string) {
    try {
      return await apiCartRepository.getProduct(userid);
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
      return await apiCartRepository.createCart(userid);
    } catch (err) {
      throw err;
    }
  }

  public async addProduct(userid: string, productId: string, quantity: number) {
    try {
      const product =
        (await productServices.getProductById(productId)) ?? undefined;
      if (!product) return "noproduct";
      if (product.inventory < quantity) return "insufficientinventory";
      const newProduct = this.generateCartProduct(product, quantity);
      return await apiCartRepository.addProduct(
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
      return await apiCartRepository.removeProduct(userid, productid);
    } catch (err) {
      console.log("Failed to remove product from cart", err);
      throw err;
    }
  }

  public async removeProducts(userid: string, products: string[]) {
    try {
      return await apiCartRepository.removeProducts(userid, products);
    } catch (err) {
      console.log("Failed to remove multiple products from cart", err);
      throw err;
    }
  }

  public async updateProduct(uid: string, pid: string, update: UpdateCart) {
    try {
      const product = (await productServices.getProductById(pid)) ?? undefined;
      if (!product) return "noproduct";
      if (product.inventory < update.quantity) return "insufficientinventory";
      return await apiCartRepository.updateProduct(uid, pid, update);
    } catch (err) {
      console.log("Failed to update product in cart", err);
      throw err;
    }
  }

  public async cartTotal(userid: string) {
    try {
      const data = await apiCartRepository.totalCartPrice(userid);
      return data?.reduce(
        (total, product) => total + product.price * product.quantity,
        0
      );
    } catch (err) {
      console.log("Failed to calculate total cart price", err);
      throw err;
    }
  }

  public async deleteCart(userid: string) {
    try {
      return await apiCartRepository.deleteCart(userid);
    } catch (err) {
      throw err;
    }
  }
}

export default new CartService();
