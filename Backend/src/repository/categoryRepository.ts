import { Category, UpdateCategory } from "../common/types/categoryType.js";
import { getCurrentDateTimeStamp } from "../utils/utils.js";
import CategorySchema from "../models/category.js";
import { inject, injectable } from "tsyringe";
import MongoDb from "../config/mongoConfig.js";

@injectable()
export default class CategoryRepository {
  constructor(@inject(MongoDb) private mongoDb: MongoDb) {}
  public async createCategory(category: Category) {
    try {
      category.createdAt = getCurrentDateTimeStamp();
      const newCategory = new CategorySchema(category);
      return await this.mongoDb.save(newCategory);
    } catch (err) {
      console.log("Failed to create a category", err);
      throw err;
    }
  }

  public async readCategories() {
    try {
      return await this.mongoDb.find(CategorySchema, {});
    } catch (err) {
      console.log("Failed to read the categories", err);
      throw err;
    }
  }

  public async readCategory(categoryid: string) {
    try {
      return await this.mongoDb.findById(CategorySchema, categoryid);
    } catch (err) {
      console.log("Failed to read a category", err);
      throw err;
    }
  }

  public async updateCategory(categoryid: string, update: UpdateCategory) {
    try {
      update.updatedAt = getCurrentDateTimeStamp();
      const updatedCategory = await this.mongoDb.findByIdAndUpdate(
        CategorySchema,
        categoryid,
        { $set: update },
        { new: true }
      );
      if (!updatedCategory) return undefined;
      return updatedCategory;
    } catch (err) {
      console.log("Failed to update a category", err);
      throw err;
    }
  }

  public async deleteCategory(categoryid: string) {
    try {
      const deleted = await this.mongoDb.findByIdAndDelete(
        CategorySchema,
        categoryid
      );
      if (!deleted) return null; // Not found
      return deleted;
    } catch (err) {
      console.log("Failed to delete category", err);
      throw err;
    }
  }
}
