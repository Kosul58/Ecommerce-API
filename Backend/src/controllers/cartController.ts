import { RequestHandler } from "express";
import { inject, injectable } from "tsyringe";
import CartService from "../services/cartServices.js";
import ResponseHandler from "../utils/apiResponse.js";
import logger from "../utils/logger.js";

@injectable()
export default class CartController {
  constructor(
    @inject(CartService) private cartService: CartService,
    @inject(ResponseHandler) private responseHandler: ResponseHandler
  ) {}

  private logError(context: string, err: unknown, extra?: object) {
    if (err instanceof Error) {
      logger.error(context, { error: err.message, ...extra });
    } else {
      logger.error(`${context} - Unknown error`, { error: err, ...extra });
    }
  }

  // View all cart products
  public viewCartProducts: RequestHandler = async (req, res, next) => {
    try {
      logger.info("Fetching all cart products");
      const result = await this.cartService.getProducts();
      if (!result || result.length === 0) {
        logger.warn("No products found in cart");
        return this.responseHandler.notFound(res, "Cannot find products");
      }
      logger.info("Cart products found", { result });
      return this.responseHandler.success(res, "Products found", result);
    } catch (err) {
      this.logError("Error fetching cart products", err);
      return next(err);
    }
  };

  // View a specific cart product
  public viewCartProduct: RequestHandler = async (req, res, next) => {
    const { productid } = req.params;
    const userid = req.user?.id;
    if (!userid) {
      logger.warn("User not authenticated");
      return this.responseHandler.error(res, "User not authenticated");
    }

    try {
      logger.info("Fetching specific product from cart", { productid, userid });
      const result = await this.cartService.getProductById(productid, userid);
      if (!result || Object.keys(result).length === 0) {
        logger.warn("Product not found in cart", { productid, userid });
        return this.responseHandler.notFound(res, "No product found");
      }
      logger.info("Product found in cart", { result });
      return this.responseHandler.success(res, "Product found", result);
    } catch (err) {
      this.logError("Error fetching product from cart", err, {
        productid,
        userid,
      });
      return next(err);
    }
  };

  // View cart for a user
  public viewCart: RequestHandler = async (req, res, next) => {
    const userid = req.user?.id;
    if (!userid) {
      logger.warn("User not authenticated");
      return this.responseHandler.error(res, "User not authenticated");
    }

    try {
      logger.info("Fetching cart for user", { userid });
      const result = await this.cartService.getCart(userid);
      if (!result || Object.keys(result).length === 0) {
        logger.warn("No cart found for user", { userid });
        return this.responseHandler.notFound(res, "Cannot find cart");
      }
      logger.info("Cart found for user", { result });
      return this.responseHandler.success(res, "Cart found", result);
    } catch (err) {
      this.logError("Error fetching cart for user", err, { userid });
      return next(err);
    }
  };

  // Add product to the cart
  public addProduct: RequestHandler = async (req, res, next) => {
    const { productid, quantity } = req.body;
    const userid = req.user?.id;
    if (!userid) {
      logger.warn("User not authenticated");
      return this.responseHandler.error(res, "User not authenticated");
    }

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
      return this.responseHandler.created(res, "Product added to cart", result);
    } catch (err) {
      this.logError("Error adding product to cart", err, {
        productid,
        quantity,
        userid,
      });
      return next(err);
    }
  };

  // Remove product from cart
  public removeProduct: RequestHandler = async (req, res, next) => {
    const { productid } = req.params;
    const userid = req.user?.id;
    if (!userid) {
      logger.warn("User not authenticated");
      return this.responseHandler.error(res, "User not authenticated");
    }

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
      this.logError("Error removing product from cart", err, {
        productid,
        userid,
      });
      return next(err);
    }
  };

  // Remove multiple products from cart
  public removeProducts: RequestHandler = async (req, res, next) => {
    const userid = req.user?.id;
    if (!userid) {
      logger.warn("User not authenticated");
      return this.responseHandler.error(res, "User not authenticated");
    }

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
      this.logError("Error removing products from cart", err, {
        products,
        userid,
      });
      return next(err);
    }
  };

  // Update a product in the cart
  public updateProduct: RequestHandler = async (req, res, next) => {
    const userid = req.user?.id;
    if (!userid) {
      logger.warn("User not authenticated");
      return this.responseHandler.error(res, "User not authenticated");
    }

    const { productid, quantity } = req.body;
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
        return this.responseHandler.notFound(
          res,
          "Product update unsuccessful"
        );
      }
      logger.info("Product updated in cart", { result });
      return this.responseHandler.success(
        res,
        "Product update successful",
        result
      );
    } catch (err) {
      this.logError("Error updating product in cart", err, {
        productid,
        quantity,
        userid,
      });
      return next(err);
    }
  };

  // Calculate the total price of the cart
  public calcTotal: RequestHandler = async (req, res, next) => {
    const userid = req.user?.id;
    if (!userid) {
      logger.warn("User not authenticated");
      return this.responseHandler.error(res, "User not authenticated");
    }

    try {
      logger.info("Calculating total of products in cart", { userid });
      const result = await this.cartService.cartTotal(userid);
      logger.info("Total price calculated", { result });
      return this.responseHandler.success(
        res,
        "Total of all products in the cart",
        result
      );
    } catch (err) {
      this.logError("Error calculating total price", err, { userid });
      return next(err);
    }
  };
}
