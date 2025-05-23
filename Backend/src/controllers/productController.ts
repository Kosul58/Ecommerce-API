import { AddProduct, UpdateProdcut } from "../common/types/productType.js";
import { RequestHandler } from "express";
import { inject, injectable } from "tsyringe";
import ProductServices from "../services/productServices.js";
import ResponseHandler from "../utils/apiResponse";
import logger from "../utils/logger"; // Assuming logger is set up

@injectable()
export default class ProductController {
  constructor(
    @inject(ProductServices) private productService: ProductServices,
    @inject(ResponseHandler) private responseHandler: ResponseHandler
  ) {}

  public getProducts: RequestHandler = async (req, res, next) => {
    try {
      logger.info("Fetching all products");
      const response = await this.productService.getProducts();
      if (!response) {
        logger.warn("No products found");
        return this.responseHandler.notFound(res, "No products found");
      }
      logger.info("Products fetched successfully");
      return this.responseHandler.success(res, "Products found", response);
    } catch (err) {
      logger.error("Error fetching products", err);
      return next(err);
    }
  };

  public getSellerProducts: RequestHandler = async (req, res, next) => {
    const sellerid = req.user.id;
    try {
      logger.info(`Fetching products for seller with id: ${sellerid}`);
      const result = await this.productService.getSellerProducts(sellerid);
      if (!result) {
        logger.warn(`No products found for seller with id: ${sellerid}`);
        return this.responseHandler.notFound(res, "No products found");
      }
      logger.info(`Products found for seller with id: ${sellerid}`);
      return this.responseHandler.success(res, "Products found", result);
    } catch (err) {
      logger.error(
        `Error fetching products for seller with id: ${sellerid}`,
        err
      );
      return next(err);
    }
  };

  public getHiddenProducts: RequestHandler = async (req, res, next) => {
    const sellerid = req.user.id;
    try {
      logger.info(`Fetching hidden products for seller with id: ${sellerid}`);
      const result = await this.productService.getHiddenProducts(sellerid);
      if (!result) {
        logger.warn(`No hidden products found for seller with id: ${sellerid}`);
        return this.responseHandler.notFound(res, "No products found");
      }
      logger.info(`Hidden products found for seller with id: ${sellerid}`);
      return this.responseHandler.success(res, "Products found", result);
    } catch (err) {
      logger.error(
        `Error fetching hidden products for seller with id: ${sellerid}`,
        err
      );
      return next(err);
    }
  };

  public getProductById: RequestHandler = async (req, res, next) => {
    const { productid } = req.params;
    try {
      logger.info(`Fetching product with id: ${productid}`);
      const data = await this.productService.getProductById(productid);
      if (!data) {
        logger.warn(`Product not found with id: ${productid}`);
        return this.responseHandler.notFound(res, "Product not found");
      }
      logger.info(`Product found with id: ${productid}`);
      return this.responseHandler.success(res, "Product found", data);
    } catch (err) {
      logger.error(`Error fetching product with id: ${productid}`, err);
      return next(err);
    }
  };

  public addProduct: RequestHandler = async (req, res, next) => {
    const productData: AddProduct = req.body;
    const files = req.files as Express.Multer.File[];
    const sellerid: string = req.user.id;
    try {
      logger.info(
        `Attempting to add product: ${productData.name} for seller with id: ${sellerid}`
      );
      const result = await this.productService.addProduct(
        productData,
        sellerid,
        files
      );
      if (!result) {
        logger.error(
          `Failed to add product: ${productData.name} for seller with id: ${sellerid}`
        );
        return this.responseHandler.error(
          res,
          "Failed to add product. No category found"
        );
      }
      logger.info(
        `Product ${productData.name} added successfully for seller with id: ${sellerid}`
      );
      return this.responseHandler.created(
        res,
        `Product ${productData.name} added successfully`
        // result
      );
    } catch (err) {
      logger.error(
        `Error adding product: ${productData.name} for seller with id: ${sellerid}`,
        err
      );
      return next(err);
    }
  };

  public addImage: RequestHandler = async (req, res, next) => {
    const { productid } = req.params;
    const sellerid: string = req.user.id;
    const files = req.files as Express.Multer.File[];
    try {
      logger.info(
        `Attempting to add a new image to a product for seller with id: ${sellerid}`
      );
      const result = await this.productService.addImage(
        productid,
        sellerid,
        files
      );
      if (!result) {
        logger.error(
          `Failed to add a new image for a product of a seller with id: ${sellerid}`
        );
        return this.responseHandler.error(
          res,
          "Failed to add image. No category found"
        );
      }
      logger.info(
        `New Images added successfully to product: ${productid} for seller with id: ${sellerid}`
      );
      return this.responseHandler.success(
        res,
        `New Product image added successfully`,
        result
      );
    } catch (err) {
      logger.error(`Error adding new product image`, err);
      return next(err);
    }
  };

  public removeImage: RequestHandler = async (req, res, next) => {
    const { productid, imageUrl } = req.body;
    const sellerid: string = req.user.id;
    try {
      logger.info(
        `Attempting to remove a  image url for product with id: ${productid} from database`
      );
      const result = await this.productService.removeImage(
        imageUrl,
        productid,
        sellerid
      );
      if (!result) {
        logger.error(
          `Failed to remove a image url for a product with id: ${productid}`
        );
        return this.responseHandler.error(res, "Failed to remove imgae url");
      }
      logger.info(`Removed image URL from the database`);
      return this.responseHandler.success(
        res,
        `Product image url removed successfully`
        // result
      );
    } catch (err) {
      logger.error(`Error adding new product image`, err);
      return next(err);
    }
  };

  public addProducts: RequestHandler = async (req, res, next) => {
    const products: AddProduct[] = req.body;
    const sellerid: string = req.user.id;
    try {
      logger.info(
        `Attempting to add multiple products for seller with id: ${sellerid}`
      );
      const data = await this.productService.addProducts(products, sellerid);
      if (!data) {
        logger.error(`No products added for seller with id: ${sellerid}`);
        return this.responseHandler.error(res, "No products added");
      }
      logger.info(
        `Multiple products added successfully for seller with id: ${sellerid}`
      );
      return this.responseHandler.created(
        res,
        "Products added successfully",
        data
      );
    } catch (err) {
      logger.error(
        `Error adding multiple products for seller with id: ${sellerid}`,
        err
      );
      return next(err);
    }
  };

  public updateProduct: RequestHandler = async (req, res, next) => {
    const { productid } = req.params;
    const sellerid = req.user.id;
    const update: UpdateProdcut = req.body;
    try {
      logger.info(
        `Attempting to update product with id: ${productid} for seller with id: ${sellerid}`
      );
      const result = await this.productService.updateProduct(
        productid,
        sellerid,
        update
      );
      if (!result) {
        logger.warn(
          `Product not found or update failed for product id: ${productid}`
        );
        return this.responseHandler.notFound(
          res,
          "Product not found or update failed"
        );
      }
      logger.info(
        `Product with id: ${productid} updated successfully for seller with id: ${sellerid}`
      );
      return this.responseHandler.success(
        res,
        `Product updated successfully`,
        result
      );
    } catch (err) {
      logger.error(
        `Error updating product with id: ${productid} for seller with id: ${sellerid}`,
        err
      );
      return next(err);
    }
  };

  public deleteProduct: RequestHandler = async (req, res, next) => {
    const { productid } = req.params;
    const sellerid = req.user.id;
    try {
      logger.info(
        `Attempting to delete product with id: ${productid} for seller with id: ${sellerid}`
      );
      const result = await this.productService.deleteProduct(
        productid,
        sellerid
      );
      if (!result) {
        logger.warn(
          `Product not found or delete failed for product id: ${productid}`
        );
        return this.responseHandler.notFound(
          res,
          "Product not found or delete failed"
        );
      }
      logger.info(
        `Product with id: ${productid} deleted successfully for seller with id: ${sellerid}`
      );
      return this.responseHandler.success(
        res,
        "Product deleted successfully",
        result
      );
    } catch (err) {
      logger.error(
        `Error deleting product with id: ${productid} for seller with id: ${sellerid}`,
        err
      );
      return next(err);
    }
  };

  public deleteProducts: RequestHandler = async (req, res, next) => {
    const id = req.user.id || req.body.sellerid;
    try {
      logger.info(`Attempting to delete products for seller with id: ${id}`);
      const result = await this.productService.deleteProducts(id);
      if (!result) {
        logger.warn(`No products found to delete for seller with id: ${id}`);
        return this.responseHandler.error(res, "No products found to delete");
      }
      logger.info(`Products deleted successfully for seller with id: ${id}`);
      return this.responseHandler.success(res, "Products deleted successfully");
    } catch (err) {
      logger.error(`Error deleting products for seller with id: ${id}`, err);
      return next(err);
    }
  };

  public updateStatus: RequestHandler = async (req, res, next) => {
    const products = req.body.products;
    const status: boolean = req.body.status;
    try {
      logger.info(
        `Attempting to update status for products: ${products.length}`
      );
      const result = await this.productService.updateStatus(products, status);
      if (!result) {
        logger.error("Failed to hide products");
        return this.responseHandler.error(res, "Failed to hide products");
      }
      logger.info("Products hidden successfully");
      return this.responseHandler.success(
        res,
        "Products hidden successfully",
        result
      );
    } catch (err) {
      logger.error("Error updating product status", err);
      return next(err);
    }
  };

  public hideSellerProducts: RequestHandler = async (req, res, next) => {
    try {
      const sellerid = req.user.id;
      logger.info(
        `Attempting to hide products for seller with id: ${sellerid}`
      );
      const result = await this.productService.hideSellerProducts(sellerid);
      if (!result) {
        logger.error(`Failed to hide products for seller with id: ${sellerid}`);
        return this.responseHandler.error(res, "Failed to hide products");
      }
      logger.info(
        `Seller products hidden successfully for seller with id: ${sellerid}`
      );
      return this.responseHandler.success(
        res,
        "Seller Products hidden successfully",
        result
      );
    } catch (err) {
      logger.error(
        `Error hiding seller products for seller with id: ${req.user.id}`,
        err
      );
      return next(err);
    }
  };

  public modifyInventory: RequestHandler = async (req, res, next) => {
    const { productid } = req.params;
    const { quantity, modification } = req.body;
    try {
      logger.info(
        `Attempting to modify inventory for product with id: ${productid}`
      );
      const result = await this.productService.modifyInventory(
        productid,
        quantity,
        modification
      );
      if (!result) {
        logger.error(
          `Failed to modify inventory for product with id: ${productid}`
        );
        return this.responseHandler.error(res, "Failed to modify inventory");
      }

      logger.info(
        `Inventory modified successfully for product with id: ${productid}`
      );
      return this.responseHandler.success(
        res,
        "Inventory modified successfully",
        result
      );
    } catch (err) {
      logger.error(
        `Error modifying inventory for product with id: ${productid}`,
        err
      );
      return next(err);
    }
  };
}
