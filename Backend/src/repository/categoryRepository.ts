import { Category, UpdateCategory } from "../common/types/categoryType.js";
import { CategoryRepositoryInterface } from "../common/types/classInterfaces.js";
import mongoose from "mongoose";
import CategorySchema from "../models/category.js";
import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository.js";

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

  public async findAll() {
    try {
      return await this.model.find({ isActive: true });
    } catch (err) {
      throw err;
    }
  }

  public async updateMany(categoryIds: string[]) {
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
}
