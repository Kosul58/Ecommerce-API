import { Product, UpdateProdcut } from "../common/types/productType.js";
import { injectable } from "tsyringe";
import ProductSchema from "../models/product.js";
import mongoose from "mongoose";

@injectable()
export default class ProductRepository {
  public async getProducts() {
    try {
      return await ProductSchema.find();
    } catch (err) {
      throw err;
    }
  }
  public async getSellerProducts(id: string) {
    try {
      return await ProductSchema.find({ sellerid: id });
    } catch (err) {}
  }

  public async getProductById(productid: string) {
    try {
      return await ProductSchema.findById(productid);
    } catch (err) {
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
      throw err;
    }
  }

  public async addProduct(product: Product) {
    try {
      const doc = new ProductSchema(product);
      return await doc.save();
    } catch (err) {
      throw err;
    }
  }

  public async addProducts(products: Product[]) {
    try {
      return await ProductSchema.insertMany(products);
    } catch (err) {
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
      throw err;
    }
  }

  public async deleteProduct(productid: string) {
    try {
      return await ProductSchema.findByIdAndDelete(productid);
    } catch (err) {
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

  public async manageInventory(id: string, quantity: number) {
    try {
      const product = await ProductSchema.findById(id);
      if (!product) return undefined;
      product.inventory = quantity;
      return await product.save();
    } catch (err) {
      throw err;
    }
  }
}
