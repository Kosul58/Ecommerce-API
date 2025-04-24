import { Product, ProductOptions } from "../common/types/productType.js";
import { inject, injectable } from "tsyringe";
import ProductSchema from "../models/product.js";
import { getCurrentDateTimeStamp } from "../utils/utils.js";
import MongoDb from "../config/mongoConfig.js";

@injectable()
export default class ProductRepository {
  constructor(@inject(MongoDb) private mongoDb: MongoDb) {}

  public async getProducts() {
    try {
      return await this.mongoDb.find(ProductSchema, {});
    } catch (err) {
      console.log("Failed to get product data", err);
      throw err;
    }
  }

  public async getProductById(productid: string) {
    try {
      return await this.mongoDb.findById(ProductSchema, productid);
    } catch (err) {
      console.log("Failed to get product data based on productid", err);
      throw err;
    }
  }

  public async checkProduct(product: Product) {
    try {
      return await this.mongoDb.find(ProductSchema, {
        name: product.name,
        price: product.price,
      });
    } catch (err) {
      console.log("Failed to check product", err);
      throw err;
    }
  }

  public async checkProducts(products: Product[]) {
    try {
      const existingProducts = await this.mongoDb.find(ProductSchema, {
        $or: products.map((p) => ({
          name: p.name,
          price: p.price,
        })),
      });
      const existingSet = new Set(
        existingProducts.map((p: any) => `${p.name}-${p.price}`)
      );

      return products.filter((p) => !existingSet.has(`${p.name}-${p.price}`));
    } catch (err) {
      console.log("Failed to check multiple products", err);
      throw err;
    }
  }

  public async addProduct(product: Product) {
    try {
      const doc = new ProductSchema(product);
      return await this.mongoDb.save(doc);
    } catch (err) {
      console.log("Failed to add a product to database", err);
      throw err;
    }
  }

  public async addProducts(products: Product[]) {
    try {
      products.forEach((product) => {
        product.createdAt = getCurrentDateTimeStamp();
      });
      if (products.length > 0) {
        return await this.mongoDb.insertMany(ProductSchema, products);
      }
      return null;
    } catch (err) {
      console.error("Failed to add products to the database", err);
      throw err;
    }
  }

  public async updateProduct(productid: string, update: ProductOptions) {
    try {
      return await this.mongoDb.findByIdAndUpdate(
        ProductSchema,
        productid,
        { $set: update },
        { new: true }
      );
    } catch (err) {
      console.log("Failed to update a product", err);
      throw err;
    }
  }

  public async deleteProduct(productid: string) {
    try {
      return await this.mongoDb.findByIdAndDelete(ProductSchema, productid);
    } catch (err) {
      console.log("Failed to remove a product", err);
      throw err;
    }
  }

  public async manageInventory(
    id: string,
    quantity: number,
    operation: "increase" | "decrease"
  ) {
    try {
      const product: any = await this.mongoDb.findById(ProductSchema, id);
      if (!product) return undefined;

      let newInventory = product.inventory ?? 0;
      if (operation === "increase") {
        newInventory += quantity;
      } else {
        newInventory -= quantity;
      }

      product.inventory = newInventory;
      return await this.mongoDb.save(product);
    } catch (err) {
      console.log("Failed to update inventory", err);
      throw err;
    }
  }
}
