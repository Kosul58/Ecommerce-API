import { Product, UpdateProdcut } from "../common/types/productType.js";
import { injectable } from "tsyringe";
import ProductSchema from "../models/Product.js";
import mongoose from "mongoose";

@injectable()
export default class ProductRepository {
  public async getProducts() {
    try {
      return await ProductSchema.find();
    } catch (err) {
      console.log("Failed to get product data", err);
      throw err;
    }
  }
  public async getProduct(id: string) {
    try {
      return await ProductSchema.find({ sellerid: id });
    } catch (err) {}
  }

  public async getProductById(productid: string) {
    try {
      return await ProductSchema.findById(productid);
    } catch (err) {
      console.log("Failed to get product data based on productid", err);
      throw err;
    }
  }

  public async checkProduct(product: Product) {
    try {
      return await ProductSchema.findOne({
        name: product.name,
        price: product.price,
        sellerid: product.sellerid,
      });
    } catch (err) {
      console.log("Failed to check product", err);
      throw err;
    }
  }

  public async checkProducts(products: Product[]) {
    try {
      return await ProductSchema.find({
        $and: products.map((p) => ({
          name: p.name,
          price: p.price,
          sellerid: p.sellerid,
        })),
      });
    } catch (err) {
      console.log("Failed to check multiple products", err);
      throw err;
    }
  }

  public async addProduct(product: Product) {
    try {
      const doc = new ProductSchema(product);
      return await doc.save();
    } catch (err) {
      console.log("Failed to add a product to database", err);
      throw err;
    }
  }

  public async addProducts(products: Product[]) {
    try {
      return await ProductSchema.insertMany(products);
    } catch (err) {
      console.error("Failed to add products to the database", err);
      throw err;
    }
  }

  public async updateProduct(productid: string, update: UpdateProdcut) {
    try {
      return await ProductSchema.findByIdAndUpdate(
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
      return await ProductSchema.findByIdAndDelete(productid);
    } catch (err) {
      console.log("Failed to remove a product", err);
      throw err;
    }
  }

  public async deleteProducts(ids: string[]) {
    try {
      const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
      return await ProductSchema.deleteMany({
        _id: { $in: objectIds },
      });
    } catch (err) {
      throw err;
    }
  }

  public async manageInventory(
    id: string,
    quantity: number,
    operation: "increase" | "decrease"
  ) {
    try {
      const product = await ProductSchema.findById(id);
      if (!product) return undefined;

      let newInventory = product.inventory ?? 0;
      if (operation === "increase") {
        newInventory += quantity;
      } else {
        newInventory -= quantity;
      }

      product.inventory = newInventory;
      return await product.save();
    } catch (err) {
      console.log("Failed to update inventory", err);
      throw err;
    }
  }
}
