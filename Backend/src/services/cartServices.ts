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
      if (!carts || carts.length === 0) {
        const error = new Error("No products found in cart");
        (error as any).statusCode = 404;
        throw error;
      }
      const products = [];
      for (let cart of carts) {
        products.push(cart.products);
      }
      return products;
    } catch (err) {
      throw err;
    }
  }
  public async getProductById(productid: string, userid: string) {
    try {
      const cart = await this.cartRepository.getCart(userid);
      if (!cart || Object.keys(cart).length === 0) {
        const error = new Error("No product found in cart");
        (error as any).statusCode = 404;
        throw error;
      }
      return cart.products.filter((p) => p.productid === productid);
    } catch (err) {
      throw err;
    }
  }

  public async getCart(userid: string) {
    try {
      const cart = await this.cartRepository.getCart(userid);
      if (!cart || Object.keys(cart).length === 0) {
        const error = new Error("No cart found");
        (error as any).statusCode = 404;
        throw error;
      }
      return cart;
    } catch (err) {
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
        const error = new Error("Cart already exists");
        (error as any).statusCode = 409;
        throw error;
      }
      const result = await this.cartRepository.createCart(userid);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Failed to create a cart");
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }

  public async addProduct(userid: string, productid: string, quantity: number) {
    try {
      const product = await this.productServices.getProductById(productid);
      if (!product) {
        const error = new Error("No product found");
        (error as any).statusCode = 404;
        throw error;
      }
      if (product.inventory < quantity) {
        const error = new Error("Insufficient product inventory");
        (error as any).statusCode = 400;
        throw error;
      }
      const cart = await this.getCart(userid);
      if (!cart) {
        const error = new Error("No cart found");
        (error as any).statusCode = 404;
        throw error;
      }
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
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Failed to add a product to the cart");
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }

  public async removeProduct(userid: string, productid: string) {
    try {
      const cart = await this.getCart(userid);
      if (!cart) {
        const error = new Error("No cart found");
        (error as any).statusCode = 404;
        throw error;
      }
      const productIndex = cart.products.findIndex(
        (p) => p.productid === productid
      );
      if (productIndex < 0) {
        const error = new Error("No product found in the cart");
        (error as any).statusCode = 404;
        throw error;
      }
      cart.products.splice(productIndex, 1);
      const result = await this.cartRepository.saveCart(cart);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Failed to remove a product from the cart");
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }

  public async removeProducts(userid: string, products: string[]) {
    try {
      const cart = await this.getCart(userid);
      if (!cart) {
        const error = new Error("No cart found");
        (error as any).statusCode = 404;
        throw error;
      }
      const length1 = cart.products.length;
      for (let i = cart.products.length - 1; i >= 0; i--) {
        if (products.includes(cart.products[i].productid)) {
          cart.products.splice(i, 1);
        }
      }
      const length2 = cart.products.length;
      if (length1 === length2) {
        const error = new Error("No product found in the cart");
        (error as any).statusCode = 404;
        throw error;
      }
      const result = await this.cartRepository.saveCart(cart);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Failed to remove products from the cart");
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }

  public async updateProduct(uid: string, pid: string, quantity: number) {
    try {
      const product = await this.productServices.getProductById(pid);
      if (!product) {
        const error = new Error("No product found in product database");
        (error as any).statusCode = 404;
        throw error;
      }
      if (product.inventory < quantity) {
        const error = new Error("Insufficient inventory");
        (error as any).statusCode = 400;
        throw error;
      }
      const cart = await this.getCart(uid);
      if (!cart) {
        const error = new Error("No cart found");
        (error as any).statusCode = 404;
        throw error;
      }
      const productIndex = cart.products.findIndex((p) => p.productid === pid);
      if (productIndex < 0) {
        const error = new Error("No product found in cart");
        (error as any).statusCode = 404;
        throw error;
      }
      cart.products[productIndex].quantity = quantity;
      const result = await this.cartRepository.saveCart(cart);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Failed to update a product in the cart");
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }

  public async cartTotal(userid: string) {
    try {
      const data = await this.cartRepository.getCart(userid);
      if (!data || Object.keys(data).length === 0) {
        const error = new Error("No cart found");
        (error as any).statusCode = 404;
        throw error;
      }
      const myCart = data.products.map((p) => ({
        productid: p.productid,
        quantity: p.quantity,
      }));
      const products = await this.productServices.getProducts();
      if (!products) {
        const error = new Error("No product found in product database");
        (error as any).statusCode = 404;
        throw error;
      }
      const productMap = new Map(products.map((p) => [p.id, p.price]));
      return myCart.reduce((sum, item) => {
        const price = productMap.get(item.productid) || 0;
        return sum + price * item.quantity;
      }, 0);
    } catch (err) {
      throw err;
    }
  }

  public async deleteCart(userid: string) {
    try {
      const result = await this.cartRepository.deleteCart(userid);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Failed to delete a cart");
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }
}
