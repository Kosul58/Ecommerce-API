import { Category, UpdateCategory } from "../common/types/categoryType";
import { CategoryRepositoryInterface } from "../common/types/classInterfaces";
import mongoose from "mongoose";
import CategorySchema from "../models/category";
import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";

@injectable()
export default class CategoryRepository
  extends BaseRepository
  implements CategoryRepositoryInterface
{
  constructor() {
    super(CategorySchema);
  }

  public async findSubs(parentId: string) {
    try {
      return await this.model.find({ parentId: parentId });
    } catch (err) {
      throw err;
    }
  }

  public async checkCategory(name: string) {
    try {
      return await this.model.findOne({ name: name, isActive: true });
    } catch (err) {
      throw err;
    }
  }

  public async findUserName(name: string, excludeId?: string) {
    const category = await this.model.findOne({ name });
    return category && category._id.toString() !== excludeId;
  }

  public async findActive() {
    try {
      return await this.model.find({ isActive: true });
    } catch (err) {
      throw err;
    }
  }
  public async findAll() {
    try {
      return await this.model.find();
    } catch (err) {
      throw err;
    }
  }

  public async updateManyParent(categoryIds: string[]) {
    try {
      const objectIds = categoryIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
      return await this.model.updateMany(
        { _id: { $in: objectIds } },
        { $set: { parentId: "" } }
      );
    } catch (err) {
      throw err;
    }
  }

  public async updateManyStatus(categoryIds: string[], status: boolean) {
    try {
      const objectIds = categoryIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
      return await this.model.updateMany(
        { _id: { $in: objectIds } },
        { $set: { isActive: status } }
      );
    } catch (err) {
      throw err;
    }
  }
}
