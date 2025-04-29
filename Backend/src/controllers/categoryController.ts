import {
  CategoryOption,
  UpdateCategory,
} from "../common/types/categoryType.js";
import { RequestHandler } from "express";
import { inject, injectable } from "tsyringe";
import CategoryService from "../services/categoryServices.js";
import ResponseHandler from "../utils/apiResponse.js";

@injectable()
export default class CategoryController {
  constructor(
    @inject(CategoryService) private categoryServices: CategoryService,
    @inject(ResponseHandler) private responseHandler: ResponseHandler
  ) {}

  // Create Category
  public createCategory: RequestHandler = async (req, res) => {
    const category: CategoryOption = req.body;
    try {
      const result = await this.categoryServices.createCategory(category);
      if (result === "catexists") {
        return this.responseHandler.error(res, "Category already exists");
      }
      if (!result) {
        return this.responseHandler.notFound(
          res,
          "Category creation unsuccessful"
        );
      }
      return this.responseHandler.created(
        res,
        "Category creation successful",
        result
      );
    } catch (err) {
      return this.responseHandler.error(res, "Failed to create category");
    }
  };

  // Read All Categories
  public readCategories: RequestHandler = async (req, res) => {
    try {
      const result = await this.categoryServices.readCategories();
      if (!result || result.length === 0) {
        return this.responseHandler.notFound(res, "No categories found");
      }
      return this.responseHandler.success(
        res,
        "Categories read successful",
        result
      );
    } catch (err) {
      return this.responseHandler.error(res, "Failed to read categories");
    }
  };

  // Read Single Category
  public readCategory: RequestHandler = async (req, res) => {
    const { categoryid } = req.params;
    try {
      const result = await this.categoryServices.readCategory(categoryid);
      if (!result || Object.keys(result).length < 1) {
        return this.responseHandler.notFound(res, "No category found");
      }
      return this.responseHandler.success(
        res,
        "Category read successful",
        result
      );
    } catch (err) {
      return this.responseHandler.error(res, "Failed to read category");
    }
  };

  // Update Category
  public updateCategory: RequestHandler = async (req, res) => {
    const { categoryid } = req.params;
    const update: UpdateCategory = req.body;
    try {
      const result = await this.categoryServices.updateCategory(
        categoryid,
        update
      );
      if (!result) {
        return this.responseHandler.notFound(res, "Category not found");
      }
      if (result === "catexists") {
        return this.responseHandler.error(
          res,
          "Category with the same name already exists"
        );
      }
      if (result === "noparent") {
        return this.responseHandler.error(
          res,
          "Cannot find any category with the given parentId"
        );
      }
      return this.responseHandler.success(
        res,
        "Category update successful",
        result
      );
    } catch (err) {
      return this.responseHandler.error(res, "Failed to update category");
    }
  };

  // Delete Category
  public deleteCategory: RequestHandler = async (req, res) => {
    const { categoryid } = req.params;
    try {
      const result = await this.categoryServices.deleteCategory(categoryid);
      if (!result) {
        return this.responseHandler.notFound(res, "Category not found");
      }
      return this.responseHandler.success(
        res,
        "Category delete successful",
        result
      );
    } catch (err) {
      return this.responseHandler.error(res, "Failed to delete category");
    }
  };
}
