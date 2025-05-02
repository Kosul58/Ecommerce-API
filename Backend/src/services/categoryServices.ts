import {
  Category,
  CategoryOption,
  UpdateCategory,
} from "../common/types/categoryType.js";
import CategoryRepository from "../repository/categoryRepository.js";
import { inject, injectable } from "tsyringe";
import FactoryService from "./factoryService.js";

@injectable()
export default class CategoryService {
  private categoryRepository: CategoryRepository;
  constructor(@inject(FactoryService) private factoryService: FactoryService) {
    this.categoryRepository = this.factoryService.getRepository(
      "CATEGORY"
    ) as CategoryRepository;
  }
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
      const categories = await this.categoryRepository.checkCategory(name);
      if (categories) return null;
      return "cat";
    } catch (err) {
      throw err;
    }
  }
  public async createCategory(category: CategoryOption) {
    try {
      const isUnique = await this.checkCategory(category.name);
      if (!isUnique) {
        // const error = new Error("Category already exists");
        // (error as any).statusCode = 409;
        // throw error;
        return null;
      }
      const newCategory = this.generateCategory(category);
      const result = await this.categoryRepository.create(newCategory);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Failed to create a category");
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }
  public async readCategories() {
    try {
      const categories = await this.categoryRepository.findAll();
      if (!categories || categories.length === 0) {
        const error = new Error("No categories found");
        (error as any).statusCode = 404;
        throw error;
      }
      return categories.map((c: any) => ({
        name: c.name,
        description: c.description,
        parentId: c.parentId,
      }));
    } catch (err) {
      throw err;
    }
  }
  public async readCategory(categoryid: string) {
    try {
      const category = await this.categoryRepository.findOne(categoryid);
      if (!category) {
        const error = new Error("Failed to find category");
        (error as any).statusCode = 500;
        throw error;
      }
      return {
        name: category.name,
        description: category.description,
        parentId: category.parentId,
      };
    } catch (err) {
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
          const error = new Error("Category already exists");
          (error as any).statusCode = 409;
          throw error;
        }
      }
      if (update.parentId) {
        const check = await this.readCategory(update.parentId);
        if (!check) {
          const error = new Error("No such parentId exists");
          (error as any).statusCode = 400;
          throw error;
        }
      }
      const result = await this.categoryRepository.updateOne(
        categoryid,
        updateFields
      );
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Failed to update category");
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }
  public async deleteCategory(categoryid: string) {
    try {
      const result = await this.categoryRepository.deleteOne(categoryid);
      if (!result) {
        const error = new Error("Failed to delete a category");
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }
}
