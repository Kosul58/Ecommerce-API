import { AddProduct, UpdateProdcut } from "../common/types/productType.js";
import { RequestHandler } from "express";
import { inject, injectable } from "tsyringe";
import ProductServices from "../services/productServices.js";
import ResponseHandler from "../utils/apiResponse";

@injectable()
export default class ProductController {
  constructor(
    @inject(ProductServices) private productService: ProductServices,
    @inject(ResponseHandler) private responseHandler: ResponseHandler
  ) {}

  public getProducts: RequestHandler = async (req, res) => {
    try {
      const response = await this.productService.getProducts();
      if (!response) {
        return this.responseHandler.notFound(res, "No products found");
      }
      return this.responseHandler.success(res, "Products found", response);
    } catch (err) {
      console.error("Failed to get products", err);
      return this.responseHandler.error(res, "Internal server error");
    }
  };

  public getSellerProducts: RequestHandler = async (req, res) => {
    const sellerid = req.user.id;
    try {
      const result = await this.productService.getSellerProducts(sellerid);
      if (!result) {
        return this.responseHandler.notFound(res, "No products found");
      }
      return this.responseHandler.success(res, "Products found", result);
    } catch (err) {
      console.error("Failed to get seller products", err);
      return this.responseHandler.error(res, "Internal server error");
    }
  };

  public getProductById: RequestHandler = async (req, res) => {
    const { productid } = req.params;
    try {
      const data = await this.productService.getProductById(productid);
      if (!data) {
        return this.responseHandler.notFound(res, "Product not found");
      }
      return this.responseHandler.success(res, "Product found", data);
    } catch (err) {
      console.error("Failed to get product by ID", err);
      return this.responseHandler.error(res, "Internal server error");
    }
  };

  public addProduct: RequestHandler = async (req, res) => {
    const productData: AddProduct = req.body;
    const sellerid: string = req.user.id;
    try {
      const result = await this.productService.addProduct(
        productData,
        sellerid
      );

      if (result === "productexists") {
        return this.responseHandler.conflict(res, "Product already exists");
      }
      if (!result) {
        return this.responseHandler.error(res, "Failed to add product");
      }
      return this.responseHandler.created(
        res,
        `Product ${productData.name} added successfully`,
        result
      );
    } catch (err) {
      console.error("Failed to add product", err);
      return this.responseHandler.error(res, "Internal server error");
    }
  };

  public addProducts: RequestHandler = async (req, res) => {
    const products: AddProduct[] = req.body;
    const sellerid: string = req.user.id;
    try {
      const data = await this.productService.addProducts(products, sellerid);
      if (!data || data.length === 0) {
        return this.responseHandler.error(res, "No products added");
      }
      return this.responseHandler.created(
        res,
        "Products added successfully",
        data
      );
    } catch (err) {
      console.error("Failed to add products", err);
      return this.responseHandler.error(res, "Internal server error");
    }
  };

  public updateProduct: RequestHandler = async (req, res) => {
    const { productid } = req.params;
    const sellerid = req.user.id;
    const update: UpdateProdcut = req.body;
    try {
      const result = await this.productService.updateProduct(
        productid,
        sellerid,
        update
      );
      if (!result) {
        return this.responseHandler.notFound(
          res,
          "Product not found or update failed"
        );
      }
      return this.responseHandler.success(
        res,
        `Product ${productid} updated successfully`,
        result
      );
    } catch (err) {
      console.error("Failed to update product", err);
      return this.responseHandler.error(res, "Internal server error");
    }
  };

  public deleteProduct: RequestHandler = async (req, res) => {
    const { productid } = req.params;
    const sellerid = req.user.id;
    const role = req.user.role;
    try {
      const result = await this.productService.deleteProduct(
        productid,
        sellerid,
        role
      );
      if (!result) {
        return this.responseHandler.notFound(
          res,
          "Product not found or delete failed"
        );
      }
      return this.responseHandler.success(
        res,
        "Product deleted successfully",
        result
      );
    } catch (err) {
      console.error("Failed to delete product", err);
      return this.responseHandler.error(res, "Internal server error");
    }
  };

  public deleteProducts: RequestHandler = async (req, res) => {
    const id = req.user.id || req.body.sellerid;
    try {
      const result = await this.productService.deleteProducts(id);
      if (!result) {
        return this.responseHandler.error(res, "No products found to delete");
      }
      return this.responseHandler.success(res, "Products deleted successfully");
    } catch (err) {
      console.error("Failed to delete products", err);
      return this.responseHandler.error(res, "Internal server error");
    }
  };

  public modifyInventory: RequestHandler = async (req, res) => {
    const { productid } = req.params;
    const { quantity, modification } = req.body;
    try {
      const result = await this.productService.modifyInventory(
        productid,
        quantity,
        modification
      );

      if (result === "insufficientinventory") {
        return this.responseHandler.error(res, "Insufficient inventory");
      }
      if (result === "noproduct") {
        return this.responseHandler.notFound(res, "Product not found");
      }
      if (!result) {
        return this.responseHandler.error(res, "Failed to modify inventory");
      }

      return this.responseHandler.success(
        res,
        "Inventory modified successfully",
        result
      );
    } catch (err) {
      console.error("Failed to modify inventory", err);
      return this.responseHandler.error(res, "Internal server error");
    }
  };
}
