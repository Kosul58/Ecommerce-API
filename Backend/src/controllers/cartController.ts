import { RequestHandler } from "express";
import { inject, injectable } from "tsyringe";
import CartService from "../services/cartServices.js";
import ResponseHandler from "../utils/apiResponse.js";

@injectable()
export default class CartController {
  constructor(
    @inject(CartService) private cartService: CartService,
    @inject(ResponseHandler) private responseHandler: ResponseHandler
  ) {}

  // View all cart products
  public viewCartProducts: RequestHandler = async (req, res, next) => {
    try {
      const result = await this.cartService.getProducts();
      if (!result || result.length === 0) {
        return this.responseHandler.notFound(res, "Cannot find products");
      }
      return this.responseHandler.success(res, "Products found", result);
    } catch (err) {
      return next(err);
    }
  };

  // View a specific cart product
  public viewCartProduct: RequestHandler = async (req, res, next) => {
    const { productid, userid } = req.params;
    try {
      const result = await this.cartService.getProductById(productid, userid);
      if (!result || Object.keys(result).length === 0) {
        return this.responseHandler.notFound(res, "No product found");
      }
      return this.responseHandler.success(res, "Product found", result);
    } catch (err) {
      return next(err);
    }
  };

  // View cart for a user
  public viewCart: RequestHandler = async (req, res, next) => {
    const { userid } = req.params;
    try {
      const result = await this.cartService.getCart(userid);
      if (!result || Object.keys(result).length === 0) {
        return this.responseHandler.notFound(res, "Cannot find cart");
      }
      return this.responseHandler.success(res, "Cart found", result);
    } catch (err) {
      return next(err);
    }
  };

  // Add product to the cart
  public addProduct: RequestHandler = async (req, res, next) => {
    const { userid, productid, quantity } = req.body;
    try {
      const result = await this.cartService.addProduct(
        userid,
        productid,
        quantity
      );
      if (!result) {
        return this.responseHandler.error(
          res,
          "Product addition to cart failed"
        );
      }
      return this.responseHandler.created(res, "Product added to cart", result);
    } catch (err) {
      return next(err);
    }
  };

  // Remove product from cart
  public removeProduct: RequestHandler = async (req, res, next) => {
    const { userid, productid } = req.params;
    try {
      const result = await this.cartService.removeProduct(userid, productid);
      if (!result) {
        return this.responseHandler.notFound(res, "Product removal failed");
      }
      return this.responseHandler.success(
        res,
        "Product removal successful",
        result
      );
    } catch (err) {
      return next(err);
    }
  };

  // Remove multiple products from cart
  public removeProducts: RequestHandler = async (req, res, next) => {
    const { userid, products } = req.body;
    try {
      const result = await this.cartService.removeProducts(userid, products);
      if (!result) {
        return this.responseHandler.notFound(
          res,
          "Products removal unsuccessful"
        );
      }
      return this.responseHandler.success(
        res,
        "Products removal successful",
        result
      );
    } catch (err) {
      return next(err);
    }
  };

  // Update a product in the cart
  public updateProduct: RequestHandler = async (req, res, next) => {
    const { userid, productid, quantity } = req.body as {
      userid: string;
      productid: string;
      quantity: number;
    };
    try {
      const result = await this.cartService.updateProduct(
        userid,
        productid,
        quantity
      );
      if (!result) {
        return this.responseHandler.notFound(
          res,
          "Product update unsuccessful"
        );
      }
      return this.responseHandler.success(
        res,
        "Product update successful",
        result
      );
    } catch (err) {
      return next(err);
    }
  };

  // Calculate the total price of the cart
  public calcTotal: RequestHandler = async (req, res, next) => {
    const userid = req.user.id;
    try {
      const result = await this.cartService.cartTotal(userid);
      return this.responseHandler.success(
        res,
        "Total of all products in the cart",
        result
      );
    } catch (err) {
      return next(err);
    }
  };
}
