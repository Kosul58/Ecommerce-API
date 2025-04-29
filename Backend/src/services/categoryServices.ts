import {
  Category,
  CategoryOption,
  UpdateCategory,
} from "../common/types/categoryType.js";
import CategoryRepository from "../repository/categoryRepository.js";
import { inject, injectable } from "tsyringe";

@injectable()
export default class CategoryService {
  constructor(
    @inject(CategoryRepository) private categoryRepository: CategoryRepository
  ) {}
  private generateCategory(category: CategoryOption): Category {
    return {
      name: category.name,
      description: category.description || "",
      parentId: category.parentId || "",
      isActive: true,
    };
  }
  private async checkCategory(name: string) {
    try {
      const categories = await this.readCategories();
      if (!categories) return "nocategories";
      return !categories.find((c) => c.name === name);
    } catch (err) {
      throw err;
    }
  }
  public async createCategory(category: CategoryOption) {
    try {
      const isUnique = await this.checkCategory(category.name);
      if (!isUnique) {
        return "catexists";
      }
      const newCategory = this.generateCategory(category);
      const result = await this.categoryRepository.createCategory(newCategory);
      if (!result || Object.keys(result).length === 0) return null;
      return "success";
    } catch (err) {
      console.log("Failed to create a category", err);
      throw err;
    }
  }
  public async readCategories() {
    try {
      const categories = await this.categoryRepository.readCategories();
      if (!categories || categories.length === 0) return null;
      return categories.map((c) => ({
        name: c.name,
        description: c.description,
        parentId: c.parentId,
      }));
    } catch (err) {
      console.log("Failed to read categories", err);
      throw err;
    }
  }
  public async readCategory(categoryid: string) {
    try {
      const category = await this.categoryRepository.readCategory(categoryid);
      if (!category) return null;
      return {
        name: category.name,
        description: category.description,
        parentId: category.parentId,
      };
    } catch (err) {
      console.log("Failed to read a category", err);
      throw err;
    }
  }
  public async updateCategory(categoryid: string, update: UpdateCategory) {
    try {
      const updateFields = Object.fromEntries(
        Object.entries(update).filter(([_, value]) => value !== undefined)
      ) as Partial<UpdateCategory>;
      if (updateFields.name) {
        const isUnique = await this.checkCategory(updateFields.name);
        if (!isUnique) {
          return "catexists";
        }
      }
      if (update.parentId) {
        const check = await this.readCategory(update.parentId);
        if (!check) return "noparent";
      }
      const result = await this.categoryRepository.updateCategory(
        categoryid,
        updateFields
      );
      if (!result || Object.keys(result).length === 0) return null;
      return "success";
    } catch (err) {
      console.log("Failed to update category", err);
      throw err;
    }
  }
  public async deleteCategory(categoryid: string) {
    try {
      const result = await this.categoryRepository.deleteCategory(categoryid);
      if (!result) return null;
      return "success";
    } catch (err) {
      console.log("Failed to delete category", err);
      throw err;
    }
  }
}
