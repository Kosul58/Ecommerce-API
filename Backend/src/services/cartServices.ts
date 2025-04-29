import { CartProduct } from "../common/types/cartType.js";
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
      const carts = await this.cartRepository.getProducts();
      if (!carts || carts.length === 0) return null;
      const products = [];
      for (let cart of carts) {
        products.push(cart.products);
      }
      return products;
    } catch (err) {
      console.log("Failed to get all the products in the cart", err);
      throw err;
    }
  }
  public async getProductById(productid: string, userid: string) {
    try {
      const cart = await this.cartRepository.getCart(userid);
      if (!cart || Object.keys(cart).length === 0) return null;
      return cart.products.filter((p) => p.productid === productid);
    } catch (err) {
      console.log("Failed to get a product in cart by product/user id", err);
      throw err;
    }
  }

  public async getCart(userid: string) {
    try {
      const cart = await this.cartRepository.getCart(userid);
      if (!cart || Object.keys(cart).length === 0) return null;
      return cart;
    } catch (err) {
      console.log("Failed to get user's cart products", err);
      throw err;
    }
  }

  private generateCartProduct(product: any, quantity: number): CartProduct {
    return {
      productid: product.id,
      sellerid: product.sellerid ?? "",
      name: product.name,
      quantity,
      description: product.description ?? "",
    };
  }

  public async createCart(userid: string) {
    try {
      const cart = await this.cartRepository.getCart(userid);
      if (cart) {
        console.log("Cart already exists");
        return "cartexists";
      }
      const result = await this.cartRepository.createCart(userid);
      if (!result || Object.keys(result).length === 0) return null;
      return "success";
    } catch (err) {
      throw err;
    }
  }

  public async addProduct(userid: string, productid: string, quantity: number) {
    try {
      const product = await this.productServices.getProductById(productid);
      if (!product) return "noproduct";
      if (product.inventory < quantity) return "insufficientinventory";
      const cart = await this.getCart(userid);
      if (!cart) return "nocart";
      const productIndex = cart.products.findIndex(
        (p) => p.productid === productid
      );
      if (productIndex >= 0) {
        cart.products[productIndex].quantity += quantity;
      } else {
        const newProduct = this.generateCartProduct(product, quantity);
        cart.products.push(newProduct);
      }
      const result = await this.cartRepository.saveCart(cart);
      if (!result || Object.keys(result).length === 0) return null;
      return "success";
    } catch (err) {
      console.error("Failed to add product to cart", err);
      throw err;
    }
  }

  public async removeProduct(userid: string, productid: string) {
    try {
      const cart = await this.getCart(userid);
      if (!cart) return "nocart";
      const productIndex = cart.products.findIndex(
        (p) => p.productid === productid
      );
      if (productIndex < 0) return "noproduct";
      cart.products.splice(productIndex, 1);
      const result = await this.cartRepository.saveCart(cart);
      if (!result || Object.keys(result).length === 0) return null;
      return "success";
    } catch (err) {
      console.log("Failed to remove product from cart", err);
      throw err;
    }
  }

  public async removeProducts(userid: string, products: string[]) {
    try {
      const cart = await this.getCart(userid);
      if (!cart) return "nocart";
      const length1 = cart.products.length;
      for (let i = cart.products.length - 1; i >= 0; i--) {
        if (products.includes(cart.products[i].productid)) {
          cart.products.splice(i, 1);
        }
      }
      const length2 = cart.products.length;
      if (length1 === length2) return "noproduct";
      const result = await this.cartRepository.saveCart(cart);
      if (!result || Object.keys(result).length === 0) return null;
      return "success";
    } catch (err) {
      console.log("Failed to remove multiple products from cart", err);
      throw err;
    }
  }

  public async updateProduct(uid: string, pid: string, quantity: number) {
    try {
      const product = await this.productServices.getProductById(pid);
      if (!product) return "noproduct";
      if (product.inventory < quantity) return "insufficientinventory";
      const cart = await this.getCart(uid);
      if (!cart) return "nocart";
      const productIndex = cart.products.findIndex((p) => p.productid === pid);
      if (productIndex < 0) return "noproduct";
      cart.products[productIndex].quantity = quantity;
      const result = await this.cartRepository.saveCart(cart);
      if (!result || Object.keys(result).length === 0) return null;
      return "success";
    } catch (err) {
      console.log("Failed to update product in cart", err);
      throw err;
    }
  }

  public async cartTotal(userid: string) {
    try {
      const data = await this.cartRepository.getCart(userid);
      if (!data || Object.keys(data).length === 0) return "nocart";
      const myCart = data.products.map((p) => ({
        productid: p.productid,
        quantity: p.quantity,
      }));
      const products = await this.productServices.getProducts();
      if (!products) return "noproduct";
      const productMap = new Map(products.map((p) => [p.id, p.price]));
      return myCart.reduce((sum, item) => {
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
      const result = await this.cartRepository.deleteCart(userid);
      if (!result || Object.keys(result).length === 0) return null;
      return "success";
    } catch (err) {
      throw err;
    }
  }
}
