import { Product, UpdateProdcut } from "../common/types/productType.js";
import { injectable } from "tsyringe";
import ProductSchema from "../models/product.js";
import mongoose, { Document } from "mongoose";
import { ProductRepositoryInteface } from "../common/types/classInterfaces.js";
import { BaseRepository } from "./baseRepository.js";

@injectable()
export default class ProductRepository
  extends BaseRepository
  implements ProductRepositoryInteface
{
  constructor() {
    super(ProductSchema);
  }

  public async getSellerProducts(id: string) {
    return await this.model.find({ sellerid: id });
  }

  public async checkProduct(product: Product) {
    return await this.model.findOne({
      name: product.name,
      price: product.price,
      sellerid: product.sellerid,
    });
  }

  public async checkProducts(products: Product[]) {
    return await this.model.find({
      $or: products.map((p) => ({
        name: p.name,
        price: p.price,
        sellerid: p.sellerid,
      })),
    });
  }

  public async addProduct(product: Product) {
    return await this.create(product);
  }

  public async addProducts(products: Product[]) {
    return await this.model.insertMany(products);
  }

  public async deleteProducts(ids: string[]) {
    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    return await this.model.deleteMany({ _id: { $in: objectIds } });
  }

  public async hideProducts(ids: string[]) {
    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    return await this.model.updateMany(
      { _id: { $in: objectIds } },
      { $set: { active: false } }
    );
  }

  public async showProducts(ids: string[]) {
    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    return await this.model.updateMany(
      { _id: { $in: objectIds } },
      { $set: { active: true } }
    );
  }

  public async manageInventory(id: string, quantity: number) {
    const product = await this.model.findById(id);
    if (!product) return undefined;
    product.inventory = quantity;
    return await product.save();
  }
}
