import { RequestHandler } from "express";
import { inject, injectable } from "tsyringe";
import CartService from "../services/cartServices.js";
@injectable()
export default class CartController {
  constructor(@inject(CartService) private cartService: CartService) {}
  // View all cart products
  public viewCartProducts: RequestHandler = async (req, res) => {
    try {
      const result = await this.cartService.getProducts();
      if (!result || result.length === 0) {
        res
          .status(404)
          .json({ message: "Cart search unsuccessful", response: [] });
        return;
      }
      res
        .status(200)
        .json({ message: "Cart search successful", response: result });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to get products data from cart" });
    }
  };

  // View a specific cart product
  public viewCartProduct: RequestHandler = async (req, res) => {
    const { productid, userid } = req.params;
    try {
      const result = await this.cartService.getProductById(productid, userid);
      if (!result || Object.keys(result).length === 0) {
        res
          .status(404)
          .json({ message: "Product search unsuccessful", response: [] });
        return;
      }
      res
        .status(200)
        .json({ message: "Product search successful", response: result });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to search product in cart of user" });
    }
  };

  // View cart for a user
  public viewCart: RequestHandler = async (req, res) => {
    const { userid } = req.params;
    try {
      const result = await this.cartService.getProduct(userid);
      console.log(result);
      if (!result || Object.keys(result).length === 0) {
        res
          .status(404)
          .json({ message: "Cart search unsuccessful", response: result });
        return;
      }
      res
        .status(200)
        .json({ message: "Cart search successful", response: result });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to search products in cart of user" });
    }
  };

  // Add product to the cart
  public addProduct: RequestHandler = async (req, res) => {
    const { userid, productid, quantity } = req.body;
    try {
      // if (!userid || !productid || !quantity) {
      //   res.status(400).json({ message: "Provide all fields", response: [] });
      //   return;
      // }
      const result = await this.cartService.addProduct(
        userid,
        productid,
        quantity
      );
      if (result === "noproduct") {
        res
          .status(404)
          .json({ message: "Product not in the Product database" });
        return;
      }
      if (result === "insufficientinventory") {
        res.status(400).json({ message: "Insufficient inventory" });
      }

      if (result === "nocart") {
        res.status(404).json({ message: "No cart found for the user" });
        return;
      }

      if (!result || Object.keys(result).length === 0) {
        res.status(400).json({
          message: "Product addition to cart unsuccessful",
          response: [],
        });
        return;
      }
      res
        .status(201)
        .json({ message: "Product added to cart", response: result });
    } catch (err) {
      res.status(500).json({ message: "Failed to add product to cart" });
    }
  };

  // Remove product from cart
  public removeProduct: RequestHandler = async (req, res) => {
    const { userid, productid } = req.params;
    try {
      // if (!userid || !productid) {
      //   res
      //     .status(400)
      //     .json({ message: "User ID and Product ID required", response: [] });
      //   return;
      // }
      const result = await this.cartService.removeProduct(userid, productid);
      if (result === "nocart") {
        res
          .status(404)
          .json({ message: "No cart found containing the product" });
        return;
      }
      if (!result || Object.keys(result).length < 1) {
        res
          .status(404)
          .json({ message: "Product removal unsuccessful", response: [] });
        return;
      }
      res
        .status(200)
        .json({ message: "Product removal successful", response: result });
    } catch (err) {
      res.status(500).json({ message: "Failed to remove a product" });
    }
  };

  // Remove multiple products from cart
  public removeProducts: RequestHandler = async (req, res) => {
    const { userid, products } = req.body;
    try {
      // if (!userid || !products || products.length === 0) {
      //   res
      //     .status(400)
      //     .json({ message: "User ID and product list required", response: [] });
      //   return;
      // }
      const result = await this.cartService.removeProducts(userid, products);
      if (result === "nocart") {
        res.status(404).json({ message: "No cart found" });
        return;
      }
      if (!result || Object.keys(result).length < 1) {
        res
          .status(404)
          .json({ message: "Products removal unsuccessful", response: [] });
        return;
      }
      res
        .status(200)
        .json({ message: "Products removal successful", response: result });
    } catch (err) {
      res.status(500).json({ message: "Failed to remove products" });
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
      // if (!userid || !productid || !quantity) {
      //   res.status(400).json({ message: "Enter all fields", response: [] });
      //   return;
      // }
      const result = await this.cartService.updateProduct(
        userid,
        productid,
        quantity
      );
      if (result === "nocart") {
        res.status(400).json({ message: "No cart found" });
        return;
      }
      if (result === "noproduct") {
        res.status(404).json({ message: "Product not found in cart" });
        return;
      }
      if (result === "insufficientinventory") {
        res.status(400).json({ message: "Insufficient Inventory" });
        return;
      }
      if (!result || Object.keys(result).length < 1) {
        res
          .status(404)
          .json({ message: "Product update unsuccessful", response: [] });
        return;
      }
      res
        .status(200)
        .json({ message: "Product update successful", response: result });
    } catch (err) {
      res.status(500).json({ message: "Failed to update product" });
    }
  };

  // Calculate the total price of the cart
  public calcTotal: RequestHandler = async (req, res) => {
    const userid = req.user.id;
    try {
      // if (!userid) {
      //   res.status(400).json({ message: "Cannot find user ID", response: [] });
      //   return;
      // }
      const result = await this.cartService.cartTotal(userid);
      if (!result) {
        res
          .status(500)
          .json({ message: "Error in total price calculation", response: [] });
        return;
      }
      res.status(200).json({
        message: "Total of all products in the cart",
        response: result,
      });
    } catch (err) {
      res.status(500).json({
        message: "Failed to calculate total price of products in cart",
      });
    }
  };
}
