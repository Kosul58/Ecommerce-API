import { Category, UpdateCategory } from "../common/types/categoryType.js";
import { getCurrentDateTimeStamp } from "../utils/utils.js";
import CategorySchema from "../models/Category.js";

class CategoryRepository {
  public async createCategory(category: Category) {
    try {
      category.createdAt = getCurrentDateTimeStamp();
      const newCategory = new CategorySchema(category);
      await newCategory.save();
      return newCategory;
    } catch (err) {
      console.log("Failed to create a category", err);
      throw err;
    }
  }

  public async readCategories() {
    try {
      return await CategorySchema.find();
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
      update.updatedAt = getCurrentDateTimeStamp();
      const updatedCategory = await CategorySchema.findByIdAndUpdate(
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
      const deleted = await CategorySchema.findByIdAndDelete(categoryid);
      if (!deleted) return null; // Not found
      return deleted;
    } catch (err) {
      console.log("Failed to delete category", err);
      throw err;
    }
  }
}

export default new CategoryRepository();
