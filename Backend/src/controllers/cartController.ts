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
  public viewCartProducts: RequestHandler = async (req, res) => {
    try {
      const result = await this.cartService.getProducts();
      if (!result || result.length === 0) {
        return this.responseHandler.notFound(res, "Cannot find products");
      }
      return this.responseHandler.success(res, "Products found", result);
    } catch (err) {
      return this.responseHandler.error(
        res,
        "Failed to get products data from cart"
      );
    }
  };

  // View a specific cart product
  public viewCartProduct: RequestHandler = async (req, res) => {
    const { productid, userid } = req.params;
    try {
      const result = await this.cartService.getProductById(productid, userid);
      if (!result || Object.keys(result).length === 0) {
        return this.responseHandler.notFound(res, "No product found");
      }
      return this.responseHandler.success(res, "Product found", result);
    } catch (err) {
      return this.responseHandler.error(
        res,
        "Failed to search product in cart of user"
      );
    }
  };

  // View cart for a user
  public viewCart: RequestHandler = async (req, res) => {
    const { userid } = req.params;
    try {
      const result = await this.cartService.getCart(userid);
      if (!result || Object.keys(result).length === 0) {
        return this.responseHandler.notFound(res, "Cannot find cart");
      }
      return this.responseHandler.success(res, "Cart found", result);
    } catch (err) {
      return this.responseHandler.error(
        res,
        "Failed to search products in cart of user"
      );
    }
  };

  // Add product to the cart
  public addProduct: RequestHandler = async (req, res) => {
    const { userid, productid, quantity } = req.body;
    try {
      const result = await this.cartService.addProduct(
        userid,
        productid,
        quantity
      );
      if (result === "noproduct") {
        return this.responseHandler.notFound(
          res,
          "Product not in the Product database"
        );
      }
      if (result === "insufficientinventory") {
        return this.responseHandler.error(res, "Insufficient inventory");
      }
      if (result === "nocart") {
        return this.responseHandler.notFound(res, "No cart found for the user");
      }
      if (!result) {
        return this.responseHandler.error(
          res,
          "Product addition to cart failed"
        );
      }
      return this.responseHandler.created(res, "Product added to cart", result);
    } catch (err) {
      return this.responseHandler.error(res, "Failed to add product to cart");
    }
  };

  // Remove product from cart
  public removeProduct: RequestHandler = async (req, res) => {
    const { userid, productid } = req.params;
    try {
      const result = await this.cartService.removeProduct(userid, productid);
      if (result === "nocart") {
        return this.responseHandler.notFound(
          res,
          "No cart found for the given user"
        );
      }
      if (result === "noproduct") {
        return this.responseHandler.notFound(
          res,
          "No product found in the cart"
        );
      }
      if (!result) {
        return this.responseHandler.notFound(res, "Product removal failed");
      }
      return this.responseHandler.success(
        res,
        "Product removal successful",
        result
      );
    } catch (err) {
      return this.responseHandler.error(res, "Failed to remove a product");
    }
  };

  // Remove multiple products from cart
  public removeProducts: RequestHandler = async (req, res) => {
    const { userid, products } = req.body;
    try {
      const result = await this.cartService.removeProducts(userid, products);
      if (result === "nocart") {
        return this.responseHandler.notFound(res, "No cart found");
      }
      if (result === "noproduct") {
        return this.responseHandler.notFound(
          res,
          "No product found in the cart"
        );
      }
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
      return this.responseHandler.error(res, "Failed to remove products");
    }
  };

  // Update a product in the cart
  public updateProduct: RequestHandler = async (req, res) => {
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
      if (result === "nocart") {
        return this.responseHandler.error(res, "No cart found");
      }
      if (result === "noproduct") {
        return this.responseHandler.notFound(res, "Product not found in cart");
      }
      if (result === "insufficientinventory") {
        return this.responseHandler.error(res, "Insufficient Inventory");
      }
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
      return this.responseHandler.error(res, "Failed to update product");
    }
  };

  // Calculate the total price of the cart
  public calcTotal: RequestHandler = async (req, res) => {
    const userid = req.user.id;
    try {
      const result = await this.cartService.cartTotal(userid);
      if (result === "nocart") {
        return this.responseHandler.error(res, "No cart found");
      }
      if (result === "noproduct") {
        return this.responseHandler.notFound(res, "Product not found in cart");
      }
      return this.responseHandler.success(
        res,
        "Total of all products in the cart",
        result
      );
    } catch (err) {
      return this.responseHandler.error(
        res,
        "Failed to calculate total price of products in cart"
      );
    }
  };
}
