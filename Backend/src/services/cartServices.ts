import { CartProduct } from "../common/types/cartType";
import { inject, injectable } from "tsyringe";
import ProductServices from "./productServices";
import CartFactory from "../factories/cartRepositoryFactory";
import { CartRepositoryInterface } from "../common/types/classInterfaces";
import logger from "../utils/logger";
import SellerServices from "./sellerServices";

@injectable()
export default class CartService {
  private cartRepository: CartRepositoryInterface;
  constructor(
    @inject(CartFactory) private cartFactory: CartFactory,
    @inject(ProductServices) private productServices: ProductServices,
    @inject(SellerServices) private sellerServices: SellerServices
  ) {
    this.cartRepository =
      this.cartFactory.getRepository() as CartRepositoryInterface;
  }

  public async getProducts() {
    try {
      const carts = await this.cartRepository.findAll();
      if (!carts || carts.length === 0) {
        const error = new Error("No products found in cart");
        logger.error("No products found in cart");
        (error as any).statusCode = 404;
        throw error;
      }
      const products = [];
      for (let cart of carts) {
        products.push(cart.products);
      }
      return products;
    } catch (err) {
      logger.error(`Error in getProducts`);
      throw err;
    }
  }

  public async getProductById(productid: string, userid: string) {
    try {
      const cart = await this.cartRepository.getCart(userid);
      if (!cart || Object.keys(cart).length === 0) {
        const error = new Error("No product found in cart");
        logger.error(`No product found for user: ${userid}`);
        (error as any).statusCode = 404;
        throw error;
      }
      return cart.products.filter((p: any) => p.productid === productid);
    } catch (err) {
      logger.error(`Error in getProductById`);
      throw err;
    }
  }
  private async getValidatedCart(userid: string) {
    const cart = await this.cartRepository.getCart(userid);
    if (!cart || !cart.products) {
      const error = new Error("No cart found");
      logger.error(`No cart found for user: ${userid}`);
      (error as any).statusCode = 404;
      throw error;
    }
    if (cart.products.length === 0) {
      return "noproducts";
    }
    return cart;
  }

  private async getRelatedDataMaps(
    cart: any
  ): Promise<[Map<string, any>, Map<string, string>]> {
    const productids = cart.products.map((p: any) => p.productid);
    const sellerids = cart.products.map((p: any) => p.sellerid);

    const [products, sellers] = await Promise.all([
      this.productServices.getProductByIds(productids),
      this.sellerServices.getSellersByIds(sellerids),
    ]);

    if (!products || products.length === 0) {
      logger.warn(`No matching products found in product database`);
    }

    if (!sellers || sellers.length === 0) {
      logger.warn(`No matching sellers found in seller database`);
    }

    const productMap = new Map<string, any>();
    for (const p of products) {
      productMap.set(p.id, p);
    }

    const sellerMap = new Map<string, string>();
    for (const s of sellers) {
      sellerMap.set(s.id, s.shopname);
    }

    return [productMap, sellerMap];
  }

  private formatCartProducts(
    cart: any,
    productMap: Map<string, any>,
    sellerMap: Map<string, string>
  ) {
    return cart.products.map((item: any) => {
      const product = productMap.get(item.productid);
      const shopname = sellerMap.get(item.sellerid) || "Unknown";

      return {
        productid: item.productid,
        name: product?.name || item.name,
        price: product?.price || 0,
        discount: product?.discount || 0,
        quantity: item.quantity,
        sellerid: item.sellerid,
        shopname,
      };
    });
  }

  public async getCart(userid: string) {
    try {
      const cart = await this.getValidatedCart(userid);
      if (cart === "noproducts") {
        return "noproducts";
      }
      const [productMap, sellerMap] = await this.getRelatedDataMaps(cart);
      const formattedCart = this.formatCartProducts(
        cart,
        productMap,
        sellerMap
      );
      return { products: formattedCart };
    } catch (err) {
      logger.error(`Error in getCart: ${err}`);
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
        logger.error(`Cart already exists for user: ${userid}`);
        (error as any).statusCode = 409;
        throw error;
      }
      const result = await this.cartRepository.createCart(userid);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Failed to create a cart");
        logger.error(`Failed to create a cart for user: ${userid}`);
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      logger.error(`Error in createCart`);
      throw err;
    }
  }

  public async addProduct(userid: string, productid: string, quantity: number) {
    try {
      const product = await this.productServices.getProductById(productid);
      if (!product) {
        const error = new Error("No product found");
        logger.error(`Product not found: ${productid}`);
        (error as any).statusCode = 404;
        throw error;
      }
      if (product.inventory < quantity) {
        const error = new Error("Insufficient product inventory");
        logger.error(`Insufficient inventory for product: ${productid}`);
        (error as any).statusCode = 400;
        throw error;
      }
      const cart = await this.cartRepository.getCart(userid);
      if (!cart) {
        const error = new Error("No cart found");
        logger.error(`No cart found for user: ${userid}`);
        (error as any).statusCode = 404;
        throw error;
      }
      const productIndex = cart.products.findIndex(
        (p: any) => p.productid === productid
      );
      if (productIndex >= 0) {
        cart.products[productIndex].quantity += quantity;
        if (cart.products[productIndex].quantity > product.inventory) {
          const error = new Error("Insufficient inventory");
          logger.error(`Insufficient inventory: ${userid}`);
          (error as any).statusCode = 404;
          throw error;
        }
      } else {
        const newProduct = this.generateCartProduct(product, quantity);
        cart.products.push(newProduct);
      }
      const result = await this.cartRepository.saveCart(cart);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Failed to add a product to the cart");
        logger.error(`Failed to add product: ${productid} to cart`);
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      logger.error(`Error in addProduct`);
      throw err;
    }
  }

  public async removeProduct(userid: string, productid: string) {
    try {
      const cart = await this.cartRepository.getCart(userid);
      if (!cart) {
        const error = new Error("No cart found");
        logger.error(`No cart found for user: ${userid}`);
        (error as any).statusCode = 404;
        throw error;
      }
      const productIndex = cart.products.findIndex(
        (p: any) => p.productid === productid
      );
      if (productIndex < 0) {
        const error = new Error("No product found in the cart");
        logger.error(`Product not found in cart for user: ${userid}`);
        (error as any).statusCode = 404;
        throw error;
      }
      cart.products.splice(productIndex, 1);
      const result = await this.cartRepository.saveCart(cart);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Failed to remove a product from the cart");
        logger.error(`Failed to remove product: ${productid} from cart`);
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      logger.error(`Error in removeProduct`);
      throw err;
    }
  }

  public async removeProducts(userid: string, products: string[]) {
    try {
      const cart = await this.cartRepository.getCart(userid);
      if (!cart) {
        const error = new Error("No cart found");
        logger.error(`No cart found for user: ${userid}`);
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
        logger.error(`No products found in cart for user: ${userid}`);
        (error as any).statusCode = 404;
        throw error;
      }
      const result = await this.cartRepository.saveCart(cart);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Failed to remove products from the cart");
        logger.error(`Failed to remove products for user: ${userid}`);
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      logger.error(`Error in removeProducts`);
      throw err;
    }
  }

  public async updateProduct(uid: string, pid: string, quantity: number) {
    try {
      const product = await this.productServices.getProductById(pid);
      if (!product) {
        const error = new Error("No product found in product database");
        logger.error(`Product not found in product database: ${pid}`);
        (error as any).statusCode = 404;
        throw error;
      }
      if (product.inventory < quantity) {
        const error = new Error("Insufficient inventory");
        logger.error(`Insufficient inventory for product: ${pid}`);
        (error as any).statusCode = 400;
        throw error;
      }
      const cart = await this.cartRepository.getCart(uid);
      if (!cart) {
        const error = new Error("No cart found");
        logger.error(`No cart found for user: ${uid}`);
        (error as any).statusCode = 404;
        throw error;
      }
      const productIndex = cart.products.findIndex(
        (p: any) => p.productid === pid
      );
      if (productIndex < 0) {
        const error = new Error("No product found in cart");
        logger.error(`No product found in cart for user: ${uid}`);
        (error as any).statusCode = 404;
        throw error;
      }
      cart.products[productIndex].quantity = quantity;
      const result = await this.cartRepository.saveCart(cart);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Failed to update a product in the cart");
        logger.error(
          `Failed to update product: ${pid} in cart for user: ${uid}`
        );
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      logger.error(`Error in updateProduct`);
      throw err;
    }
  }

  public async cartTotal(userid: string, selectedProducts: string[]) {
    try {
      const data = await this.cartRepository.getCart(userid);
      if (!data || Object.keys(data).length === 0) {
        const error = new Error("No cart found");
        logger.error(`No cart found for user: ${userid}`);
        (error as any).statusCode = 404;
        throw error;
      }
      const myCart = data.products
        .map((p: any) => ({
          productid: p.productid,
          quantity: p.quantity,
        }))
        .filter((p: { productid: string; quantity: number }) =>
          selectedProducts.includes(p.productid)
        );

      const products = await this.productServices.getProducts();
      if (!products) {
        const error = new Error("No product found in product database");
        logger.error(`No products found in product database`);
        (error as any).statusCode = 404;
        throw error;
      }

      const productMap: Map<string, number> = new Map(
        products.map((p: any) => [p.id, p.price])
      );

      const subtotal = myCart.reduce((sum: number, item: CartProduct) => {
        const price = productMap.get(item.productid) || 0;
        return sum + price * item.quantity;
      }, 0);

      return {
        subtotal: subtotal,
        tax: subtotal * 0.13,
        shippingfee: 130 * selectedProducts.length,
      };
    } catch (err) {
      logger.error(`Error in cartTotal`);
      throw err;
    }
  }

  public async deleteCart(userid: string) {
    try {
      const result = await this.cartRepository.deleteOne(userid);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Failed to delete a cart");
        logger.error(`Failed to delete cart for user: ${userid}`);
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      logger.error(`Error in deleteCart`);
      throw err;
    }
  }
}
