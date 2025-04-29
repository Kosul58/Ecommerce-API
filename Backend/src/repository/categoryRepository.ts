import { Category, UpdateCategory } from "../common/types/categoryType.js";
import CategorySchema from "../models/category.js";
import { injectable } from "tsyringe";

@injectable()
export default class CategoryRepository {
  public async createCategory(category: Category) {
    try {
      const newCategory = new CategorySchema(category);
      return await newCategory.save();
    } catch (err) {
      console.log("Failed to create a category", err);
      throw err;
    }
  }

  public async readCategories() {
    try {
      return await CategorySchema.find({ isActive: true });
    } catch (err) {
      console.log("Failed to read the categories", err);
      throw err;
    }
  }

  public async readCategory(categoryid: string) {
    try {
      return await CategorySchema.findById(categoryid);
    } catch (err) {
      console.log("Failed to read a category", err);
      throw err;
    }
  }

  public async updateCategory(categoryid: string, update: UpdateCategory) {
    try {
      return await CategorySchema.findByIdAndUpdate(
        categoryid,
        { $set: update },
        { new: true }
      );
    } catch (err) {
      console.log("Failed to update a category", err);
      throw err;
    }
  }

  public async deleteCategory(categoryid: string) {
    try {
      return CategorySchema.findByIdAndDelete(categoryid);
    } catch (err) {
      console.log("Failed to delete category", err);
      throw err;
    }
  }
}
