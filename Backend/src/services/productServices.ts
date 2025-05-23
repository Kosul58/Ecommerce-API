import { injectable, inject } from "tsyringe";
import {
  AddProduct,
  Product,
  ProductReturn,
  SellerProductReturn,
  UpdateProdcut,
} from "../common/types/productType.js";
import CategoryService from "./categoryServices.js";
import ProductFactory from "../factories/productRepositoryFactory.js";
import { ProductRepositoryInteface } from "../common/types/classInterfaces.js";
import logger from "../utils/logger.js";
import CloudService from "./cloudService.js";
import Utils from "../utils/utils.js";
import EmailService from "./emailService.js";
import { boolean } from "joi";

@injectable()
export default class ProductServices {
  private productRepository: ProductRepositoryInteface;
  constructor(
    @inject(ProductFactory) private productFacotry: ProductFactory,
    @inject(CategoryService) private categoryService: CategoryService,
    @inject(CloudService) private cloudService: CloudService,
    @inject(EmailService) private emailService: EmailService
  ) {
    this.productRepository =
      this.productFacotry.getRepository() as ProductRepositoryInteface;
  }

  private async checkCategory(name: string) {
    return await this.categoryService.checkCategory(name);
  }

  private async createProduct(
    productData: AddProduct,
    sellerid: string
  ): Promise<Product> {
    const { name, price, inventory, description, category } = productData;
    logger.info(`Creating product with name: ${name}`);
    return {
      name,
      sellerid,
      price: Number(price),
      inventory: Number(inventory),
      description,
      category,
      images: [],
    };
  }

  public async getProducts() {
    try {
      logger.info("Fetching all products");
      let products = await this.productRepository.findAll();
      if (!products || products.length === 0) {
        const error = new Error("No Products found");
        (error as any).statusCode = 404;
        throw error;
      }
      products = products.filter((p: any) => p.active === true);
      return products.map((p: any) => this.returnProductData(p));
    } catch (err) {
      logger.error("Error fetching products");
      throw err;
    }
  }

  public async getSellerProducts(id: string) {
    try {
      logger.info(`Fetching products for seller: ${id}`);
      const products = await this.productRepository.getSellerProducts(id);
      if (!products || products.length === 0) {
        logger.warn(`No products found for seller: ${id}`);
        return null;
      }
      return products.map((p: any) => this.returnSellerProductData(p));
    } catch (err) {
      logger.error(`Error fetching seller products for seller: ${id}`);
      throw err;
    }
  }

  public async getHiddenProducts(id: string) {
    try {
      logger.info(`Fetching hidden products for seller: ${id}`);
      const products = await this.productRepository.getSellerProducts(id);
      if (!products || products.length === 0) {
        return null;
      }
      return products
        .filter((p: any) => p.active === false)
        .map((p: any) => this.returnProductData(p));
    } catch (err) {
      logger.error(`Error fetching hidden products for seller: ${id}`);
      throw err;
    }
  }

  public async getProductById(productid: string) {
    try {
      logger.info(`Fetching product by ID: ${productid}`);
      const product = await this.productRepository.findOne(productid);
      if (!product) {
        const error = new Error("No Products found");
        (error as any).statusCode = 404;
        throw error;
      }
      return this.returnProductData(product);
    } catch (err) {
      logger.error(`Error fetching product by ID: ${productid}`);
      throw err;
    }
  }

  private async uploadImages(
    files: Express.Multer.File[],
    productid: string
  ): Promise<string[]> {
    try {
      const filePath = Utils.generatePath();
      const results = await Promise.allSettled(
        files.map((file, index) =>
          this.cloudService.uploadFile(
            file.buffer,
            {
              resource_type: "image",
              folder: `products/${filePath}`,
              public_id: `${productid}_${new Date().toISOString()}`,
              use_filename: true,
              unique_filename: false,
            },
            {
              id: file.originalname,
              type: "upload",
              mimetype: file.mimetype,
              size: file.size,
            }
          )
        )
      );
      const successfulUploads: string[] = [];
      const failedUploads: { index: number; reason: any }[] = [];
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          if (result.value) successfulUploads.push(result.value);
        } else {
          failedUploads.push({ index, reason: result.reason });
          logger.warn(`Upload failed for file ${index}`, {
            reason: result.reason,
          });
        }
      });
      return successfulUploads;
    } catch (err) {
      logger.error("Error uploading images", { error: err });
      throw err;
    }
  }

  public async addProduct(
    product: AddProduct,
    sellerid: string,
    files: Express.Multer.File[]
  ) {
    try {
      logger.info(`Adding product for seller: ${sellerid}`);
      const categoryCheck = await this.checkCategory(product.category);
      if (categoryCheck === "cat") {
        logger.warn(`Category ${product.category} not found`);
        return null;
      }
      const check = await this.productRepository.checkProduct({
        ...product,
        sellerid,
      });
      if (check && Object.keys(check).length > 0) {
        const error = new Error("Product already exists");
        (error as any).statusCode = 409;
        throw error;
      }
      const newProduct: Product = await this.createProduct(product, sellerid);
      const result = await this.productRepository.create(newProduct);
      if (!result) {
        const error = new Error("Product addition failed");
        (error as any).statusCode = 500;
        throw error;
      }
      const productId = result._id.toString();
      const uploadResult = await this.uploadImages(files, productId);
      if (!uploadResult || uploadResult.length === 0) {
        logger.warn("Failed to upload images to the cloud");
        await this.deleteProduct(productId, sellerid);
      }
      result.images = uploadResult;
      const savedProduct = await this.productRepository.save(result);
      // const savedProduct = await this.productRepository.updateOne(productId, {
      //   images: uploadResult,
      // });
      if (!savedProduct) {
        logger.warn("Failed to add image info to the product");
        await this.deleteProduct(productId, sellerid);
      }
      logger.info(`Product added successfully for seller: ${sellerid}`);
      return "success";
    } catch (err) {
      logger.error("Error adding product");
      throw err;
    }
  }

  public async addProducts(products: AddProduct[], sellerid: string) {
    try {
      logger.info(`Adding multiple products for seller: ${sellerid}`);
      const productInputs: Product[] = products.map((p) => ({
        ...p,
        sellerid,
      }));
      const existingProducts = await this.productRepository.checkProducts(
        productInputs
      );
      const existingSet = new Set(
        existingProducts.map((p: any) => `${p.name}-${p.price}-${p.sellerid}`)
      );

      const filteredProducts = productInputs.filter(
        (p) => !existingSet.has(`${p.name}-${p.price}-${p.sellerid}`)
      );
      let productList: Product[] = [];
      if (filteredProducts.length === 0) {
        const error = new Error("Products already exist");
        (error as any).statusCode = 409;
        throw error;
      }
      for (const product of filteredProducts) {
        const categoryCheck = await this.checkCategory(product.category);
        if (!categoryCheck) {
          productList.push(await this.createProduct(product, sellerid));
        }
      }
      if (productList.length === 0) {
        const error = new Error("No matching category found for any product");
        (error as any).statusCode = 404;
        throw error;
      }
      const result = await this.productRepository.addProducts(productList);
      if (!result || result.length === 0) {
        const error = new Error("Product addition failed");
        (error as any).statusCode = 500;
        throw error;
      }
      logger.info(
        `Multiple products added successfully for seller: ${sellerid}`
      );
      return "success";
    } catch (err) {
      logger.error("Error adding multiple products");
      throw err;
    }
  }
  public async addImage(
    productid: string,
    sellerid: string,
    files: Express.Multer.File[]
  ) {
    try {
      const product = await this.productRepository.findOne(productid);
      if (!product || product.sellerid !== sellerid) {
        logger.warn("No product found");
        const error = new Error("No product found");
        (error as any).statusCode = 404;
        throw error;
      }
      const uploadResult = await this.uploadImages(files, productid);
      if (!uploadResult || uploadResult.length === 0) {
        logger.warn("Failed to upload image to cloud");
        return;
      }
      product.images.push(...uploadResult);
      const saveResult = await this.productRepository.save(product);
      if (!saveResult)
        logger.warn(
          "Image uploaded to cloud but not saved in product imgaes array"
        );
      return uploadResult;
    } catch (err) {
      throw err;
    }
  }

  public async removeImage(
    imageurl: string[],
    productid: string,
    sellerid: string
  ) {
    try {
      const product = await this.productRepository.findOne(productid);
      if (!product || product.sellerid !== sellerid) {
        const error = new Error("Failed to find product");
        (error as any).statusCode = 404;
        throw error;
      }
      const public_ids = await this.cloudService.filterData(imageurl);
      if (!public_ids || public_ids.length === 0) {
        const error = new Error("Failed to find image data");
        (error as any).statusCode = 404;
        throw error;
      }
      product.images = product.images.filter(
        (url: string) => !imageurl.includes(url)
      );
      const saveResult = await this.productRepository.save(product);
      if (!saveResult) {
        logger.warn("Failed to remove image url from the database");
        const error = new Error("Failed to remove image url from the database");
        (error as any).statusCode = 500;
        throw error;
      }
      const deleteResult = await this.cloudService.deleteCloudFiles(
        public_ids,
        "upload",
        "image"
      );
      if (!deleteResult) {
        logger.warn("Failed to delete image from the cloud");
        const error = new Error("Failed to delete image from the cloud");
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }
  public async updateProduct(
    productid: string,
    sellerid: string,
    update: UpdateProdcut
  ) {
    try {
      logger.info(`Updating product with ID: ${productid}`);
      console.log(update);
      const updateFields = Object.fromEntries(
        Object.entries(update).filter(([_, value]) => value !== undefined)
      ) as Partial<UpdateProdcut>;
      const product = await this.getProductById(productid);
      if (!product || product.sellerid !== sellerid) {
        const error = new Error("No product found");
        (error as any).statusCode = 404;
        throw error;
      }
      if (update.category) {
        const category = await this.checkCategory(update.category);
        if (category === "cat") {
          const error = new Error("No category found");
          (error as any).statusCode = 404;
          throw error;
        }
      }
      const result = await this.productRepository.updateOne(
        productid,
        updateFields
      );
      if (!result) {
        const error = new Error("Product update failed");
        (error as any).statusCode = 500;
        throw error;
      }
      logger.info(`Product updated successfully with ID: ${productid}`);
      return "success";
    } catch (err) {
      logger.error("Error updating product");
      throw err;
    }
  }
  public async deleteProduct(productid: string, sellerid: string) {
    try {
      logger.info(`Deleting product with ID: ${productid}`);
      const product = await this.getProductById(productid);
      if (!product || product.sellerid !== sellerid) {
        return null;
      }
      const result = await this.productRepository.deleteOne(productid);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Product delete failed");
        (error as any).statusCode = 500;
        throw error;
      }
      const deletedImages = result.images.map((image: string) => {
        const match = image.match(/products\/.+/);
        return match ? match[0] : "";
      });

      const cloudResult = await this.cloudService.deleteCloudFiles(
        deletedImages,
        "upload",
        "image"
      );

      if (cloudResult.length === 0) {
        logger.warn(
          "Product deleted from database but product data could not be deleted from the cloud"
        );
      }
      logger.info(`Product with ID: ${productid} deleted successfully`);
      return "success";
    } catch (err) {
      logger.error("Error deleting product");
      throw err;
    }
  }
  public async deleteProducts(id: string) {
    try {
      logger.info(`Deleting products for seller: ${id}`);
      const products = await this.getSellerProducts(id);
      if (!products || products.length === 0) {
        return null;
      }
      const cloudImages = [];
      for (const product of products) {
        const deletedImages = product.images.map((image: string) => {
          const match = image.match(/products\/.+/);
          return match ? match[0] : "";
        });

        cloudImages.push(...deletedImages);
      }
      const deleteIds = products.map((p: any) => p.id);
      const result = await this.productRepository.deleteProducts(deleteIds);
      if (!result || result.deletedCount === 0) {
        const error = new Error("Products deletion failed");
        (error as any).statusCode = 500;
        throw error;
      }

      const cloudResult = await this.cloudService.deleteCloudFiles(
        cloudImages,
        "upload",
        "image"
      );
      if (cloudResult.length === 0) {
        logger.warn(
          "Products deleted from database but products data could not be deleted from the cloud"
        );
      }
      logger.info(`Products deleted successfully for seller: ${id}`);
      return "success";
    } catch (err) {
      logger.error("Error deleting products");
      throw err;
    }
  }
  public async updateStatus(productids: string[], status: boolean) {
    try {
      logger.info(`Updating status for products: ${productids.join(", ")}`);
      const result = await this.productRepository.updateStatus(
        productids,
        status
      );
      if (!result) {
        const error = new Error("Product status update failed");
        (error as any).statusCode = 500;
        throw error;
      }
      logger.info(
        `Status updated successfully for products: ${productids.join(", ")}`
      );
      return "success";
    } catch (err) {
      logger.error("Error updating product status");
      throw err;
    }
  }
  public async hideSellerProducts(sellerid: string) {
    try {
      logger.info(`Hiding products for seller: ${sellerid}`);
      const products = await this.productRepository.getSellerProducts(sellerid);
      if (!products || products.length === 0) {
        return null;
      }
      const visibleProducts = products.filter((p: any) => p.status === false);
      if (visibleProducts.length === 0) {
        logger.info("Products are already hidden");
        return "success";
      }
      const deleteIds = products.map((p: any) => p.id);
      const result = await this.productRepository.updateStatus(
        deleteIds,
        false
      );
      if (!result || result.modifiedCount === 0) {
        const error = new Error("Product hide failed");
        (error as any).statusCode = 500;
        throw error;
      }
      logger.info(`Products hidden successfully for seller: ${sellerid}`);
      return "success";
    } catch (err) {
      logger.error("Error hiding seller products");
      throw err;
    }
  }

  public async modifyInventory(
    id: string,
    quantity: number,
    modification: "increase" | "decrease"
  ) {
    try {
      logger.info(`Modifying inventory for product ID: ${id}`);
      const product = await this.productRepository.findOne(id);
      if (!product) {
        const error = new Error("No product found");
        (error as any).statusCode = 404;
        throw error;
      }
      if (modification === "decrease" && product.inventory < quantity) {
        const error = new Error("Insufficient inventory");
        (error as any).statusCode = 404;
        throw error;
      }
      let newInventory = product.inventory ?? 0;
      if (modification === "increase") {
        newInventory += quantity;
      } else {
        newInventory -= quantity;
      }
      const result = await this.productRepository.manageInventory(
        id,
        newInventory
      );
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Product inventory modification failed");
        (error as any).statusCode = 500;
        throw error;
      }
      logger.info(`Inventory modified successfully for product ID: ${id}`);
      return "success";
    } catch (err) {
      logger.error("Error modifying product inventory");
      throw err;
    }
  }

  private returnProductData<
    T extends {
      _id: any;
      name: string;
      sellerid: string;
      price: number;
      description: string;
      category: string;
      inventory: number;
      images: string[];
    }
  >(product: T): ProductReturn {
    return {
      id: product._id.toString(),
      name: product.name,
      sellerid: product.sellerid,
      price: product.price,
      description: product.description,
      category: product.category,
      inventory: product.inventory,
      images: product.images,
    };
  }

  private returnSellerProductData<
    T extends {
      _id: any;
      name: string;
      sellerid: string;
      price: number;
      description: string;
      category: string;
      inventory: number;
      active: boolean;
      images: string[];
    }
  >(product: T): SellerProductReturn {
    return {
      id: product._id.toString(),
      name: product.name,
      sellerid: product.sellerid,
      price: product.price,
      description: product.description,
      category: product.category,
      inventory: product.inventory,
      active: product.active,
      images: product.images,
    };
  }
}
