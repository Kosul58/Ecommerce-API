import { AddProduct, UpdateProdcut } from "../common/types/productType.js";
import { RequestHandler } from "express";
import { inject, injectable } from "tsyringe";
import ProductServices from "../services/productServices.js";
@injectable()
export default class ProductController {
  constructor(
    @inject(ProductServices) private prodcutService: ProductServices
  ) {}
  public getProducts: RequestHandler = async (req, res) => {
    try {
      const response = await this.prodcutService.getProducts();
      if (!response || response.length === 0) {
        res.status(404).json({ message: "No Products found", response: [] });
        return;
      }
      res.status(200).json({
        message: "Product search successful",
        response,
      });
    } catch (err) {
      console.error("Failed to get products", err);
      res.status(500).json({
        message: "Product search Unsuccessful",
        response: [],
      });
    }
  };

  public getProductById: RequestHandler = async (req, res) => {
    const { id } = req.params;
    try {
      if (!id) {
        res.status(400).json({ message: "Provide ProductID", response: [] });
        return;
      }
      const data = await this.prodcutService.getProductById(id);
      if (!data || Object.keys(data).length === 0) {
        res.status(404).json({
          message: "No matching product found",
          response: [],
        });
        return;
      }
      res.status(200).json({
        message: "Product search successful",
        response: data,
      });
    } catch (err) {
      console.error("Failed to get product by id", err);
      res.status(500).json({
        message: "Failed to get product by id",
        response: [],
      });
    }
  };

  public addProduct: RequestHandler = async (req, res) => {
    const productData: AddProduct = req.body;
    try {
      if (
        !productData.name ||
        !productData.price ||
        !productData.inventory ||
        !productData.sellerid
      ) {
        res.status(400).json({ message: "Enter all fields", response: [] });
        return;
      }
      const result = await this.prodcutService.addProduct(productData);
      if (result === null) {
        res.status(409).json({
          message: "Product Already Exists",
          response: [],
        });
        return;
      }
      if (!result) {
        res.status(400).json({
          message: "Failed to add Product",
          response: [],
        });
        return;
      }
      res.status(201).json({
        message: `Product with name ${productData.name} and price $${productData.price} added successfully.`,
        response: result,
      });
    } catch (err) {
      console.error("Failed to add product", err);
      res.status(500).json({
        message: "Failed to add product",
        response: [],
      });
    }
  };

  public addProducts: RequestHandler = async (req, res) => {
    const products: AddProduct[] = req.body;
    try {
      if (products.length === 0) {
        res.status(400).json({ message: "Empty products array", response: [] });
        return;
      }
      const data = await this.prodcutService.addProducts(products);
      if (!data || data.length > 0) {
        res.status(201).json({
          message: "Batch addition of products successful",
          response: data,
        });
        return;
      }
      res.status(400).json({
        message: "Batch addition of products unsuccessful",
        response: [],
      });
    } catch (err) {
      console.error("Failed to add multiple products", err);
      res.status(500).json({
        message: "Failed to add products",
        response: [],
      });
    }
  };

  public updateProduct: RequestHandler = async (req, res) => {
    const { id } = req.params;
    const update: UpdateProdcut = req.body;
    try {
      if (!id || !update) {
        res.status(400).json({ message: "Enter all fields", response: [] });
        return;
      }
      const result = await this.prodcutService.updateProduct(id, update);
      if (
        (result && Object.keys(result).length > 0) ||
        (Array.isArray(result) && result.length > 0)
      ) {
        res.status(200).json({
          message: `Product with id ${id} updated successfully`,
          response: result,
        });
        return;
      }
      res.status(404).json({
        message: "No products to update",
        response: [],
      });
    } catch (err) {
      console.error("Failed to update a product", err);
      res.status(500).json({
        message: "Failed to update product",
        response: [],
      });
    }
  };

  public deleteProduct: RequestHandler = async (req, res) => {
    const { id } = req.params;
    try {
      if (!id) {
        res.status(400).json({ message: "Product ID required", response: [] });
        return;
      }
      const result = await this.prodcutService.deleteProduct(id);
      if (!result) {
        res.status(404).json({
          message: "Product deletion unsuccessful",
          response: [],
        });
        return;
      }
      res.status(200).json({
        message: "Product deleted successfully",
        response: result,
      });
    } catch (err) {
      console.error("Failed to delete a product", err);
      res.status(500).json({
        message: "Failed to delete product",
        response: [],
      });
    }
  };

  public modifyInventory: RequestHandler = async (req, res) => {
    const { id } = req.params;
    const { quantity, modification } = req.body;
    try {
      if (!id || !quantity || !modification) {
        res
          .status(400)
          .json({ message: "Provide all required fields", response: [] });
        return;
      }
      const result = await this.prodcutService.modifyInventory(
        id,
        quantity,
        modification
      );
      if (result === undefined) {
        res.status(404).json({
          message: "No product found",
          response: [],
        });
        return;
      }
      res.status(200).json({
        message: "Inventory modification successful",
        response: result,
      });
    } catch (err) {
      console.error("Failed to modify product inventory", err);
      res.status(500).json({
        message: "Failed to modify inventory",
        response: [],
      });
    }
  };
}
