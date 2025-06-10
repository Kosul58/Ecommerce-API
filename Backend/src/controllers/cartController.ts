import { RequestHandler } from "express";
import { inject, injectable } from "tsyringe";
import CartService from "../services/cartServices";
import ResponseHandler from "../utils/apiResponse";
import logger from "../utils/logger";

@injectable()
export default class CartController {
  constructor(
    @inject(CartService) private cartService: CartService,
    @inject(ResponseHandler) private responseHandler: ResponseHandler
  ) {}

  public viewCartProducts: RequestHandler = async (req, res, next) => {
    try {
      logger.info("Fetching all cart products");
      const result = await this.cartService.getProducts();
      if (!result || result.length === 0) {
        return this.responseHandler.notFound(res, "Cannot find products");
      }
      logger.info("Cart products found", { result });
      return this.responseHandler.success(res, "Products found", result);
    } catch (err) {
      logger.error("Error fetching cart products", err);
      return next(err);
    }
  };

  public viewCartProduct: RequestHandler = async (req, res, next) => {
    const { productid } = req.params;
    const userid = req.user.id;
    try {
      logger.info("Fetching specific product from cart", { productid, userid });
      const result = await this.cartService.getProductById(productid, userid);
      if (!result || Object.keys(result).length === 0) {
        return this.responseHandler.notFound(res, "No product found");
      }
      logger.info("Product found in cart", { result });
      return this.responseHandler.success(res, "Product found", result);
    } catch (err) {
      logger.error("Error fetching product from cart", err);
      return next(err);
    }
  };

  public viewCart: RequestHandler = async (req, res, next) => {
    const userid = req.user.id;
    try {
      logger.info("Fetching cart for user", { userid });
      const result = await this.cartService.getCart(userid);

      if (result === "noproducts") {
        return this.responseHandler.success(res, "No Products in the cart", {
          products: [],
        });
      }
      if (!result || Object.keys(result).length === 0) {
        return this.responseHandler.notFound(res, "Cannot find cart");
      }
      logger.info("Cart found for user");
      return this.responseHandler.success(res, "Cart found", result);
    } catch (err) {
      logger.error("Error fetching cart for user", err);
      return next(err);
    }
  };

  // Add product to the cart
  public addProduct: RequestHandler = async (req, res, next) => {
    const { productid, quantity } = req.body;
    const userid = req.user.id;
    try {
      logger.info("Adding product to cart", { productid, quantity, userid });
      const result = await this.cartService.addProduct(
        userid,
        productid,
        quantity
      );
      if (!result) {
        logger.warn("Failed to add product to cart", {
          productid,
          quantity,
          userid,
        });
        return this.responseHandler.error(
          res,
          "Product addition to cart failed"
        );
      }
      logger.info("Product added to cart", { result });
      return this.responseHandler.success(res, "Product added to cart", result);
    } catch (err) {
      logger.error("Error adding product to cart", err);
      return next(err);
    }
  };

  // Remove product from cart
  public removeProduct: RequestHandler = async (req, res, next) => {
    const { productid } = req.params;
    const userid = req.user.id;
    try {
      logger.info("Removing product from cart", { productid, userid });
      const result = await this.cartService.removeProduct(userid, productid);
      if (!result) {
        logger.warn("Failed to remove product from cart", {
          productid,
          userid,
        });
        return this.responseHandler.notFound(res, "Product removal failed");
      }
      logger.info("Product removed from cart", { result });
      return this.responseHandler.success(
        res,
        "Product removal successful",
        result
      );
    } catch (err) {
      logger.error("Error removing product from cart", err);
      return next(err);
    }
  };

  // Remove multiple products from cart
  public removeProducts: RequestHandler = async (req, res, next) => {
    const userid = req.user.id;
    const { products } = req.body;
    try {
      logger.info("Removing multiple products from cart", { products, userid });
      const result = await this.cartService.removeProducts(userid, products);
      if (!result) {
        logger.warn("Failed to remove products from cart", {
          products,
          userid,
        });
        return this.responseHandler.notFound(
          res,
          "Products removal unsuccessful"
        );
      }
      logger.info("Products removed from cart", { result });
      return this.responseHandler.success(
        res,
        "Products removal successful",
        result
      );
    } catch (err) {
      logger.error("Error removing products from cart", err);
      return next(err);
    }
  };

  // Update a product in the cart
  public updateProduct: RequestHandler = async (req, res, next) => {
    const userid = req.user.id;
    const { productid, quantity } = req.body as {
      productid: string;
      quantity: number;
    };
    try {
      logger.info("Updating product in cart", { productid, quantity, userid });
      const result = await this.cartService.updateProduct(
        userid,
        productid,
        quantity
      );
      if (!result) {
        logger.warn("Failed to update product in cart", {
          productid,
          quantity,
          userid,
        });
        return this.responseHandler.error(res, "Product update unsuccessful");
      }
      logger.info("Product updated in cart", { result });
      return this.responseHandler.success(
        res,
        "Product update successful",
        result
      );
    } catch (err) {
      logger.error("Error updating product in cart", err);
      return next(err);
    }
  };

  // Calculate the total price of the cart
  public calcTotal: RequestHandler = async (req, res, next) => {
    const userid = req.user.id;
    const products = req.body.products;
    try {
      logger.info("Calculating total of products in cart", { userid });
      const result = await this.cartService.cartTotal(userid, products);
      logger.info("Total price calculated", { result });
      return this.responseHandler.success(
        res,
        "Total of all products in the cart",
        result
      );
    } catch (err) {
      logger.error("Error calculating total price", err);
      return next(err);
    }
  };
}
