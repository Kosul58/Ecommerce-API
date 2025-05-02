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
  public createCategory: RequestHandler = async (req, res, next) => {
    const category: CategoryOption = req.body;
    try {
      const result = await this.categoryServices.createCategory(category);
      if (!result) {
        return this.responseHandler.conflict(res, "Category already exists");
      }
      return this.responseHandler.created(
        res,
        "Category creation successful",
        result
      );
    } catch (err) {
      return next(err);
    }
  };

  // Read All Categories
  public readCategories: RequestHandler = async (req, res, next) => {
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
      return next(err);
    }
  };

  // Read Single Category
  public readCategory: RequestHandler = async (req, res, next) => {
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
      return next(err);
    }
  };

  // Update Category
  public updateCategory: RequestHandler = async (req, res, next) => {
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
      return this.responseHandler.success(
        res,
        "Category update successful",
        result
      );
    } catch (err) {
      return next(err);
    }
  };

  // Delete Category
  public deleteCategory: RequestHandler = async (req, res, next) => {
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
      return next(err);
    }
  };

  public activateCategory: RequestHandler = async (req, res, next) => {
    const { categoryid } = req.params;
    try {
      const result = await this.categoryServices.activateCategory(categoryid);
      if (!result) {
        return this.responseHandler.notFound(res, "Category not found");
      }
      return this.responseHandler.success(
        res,
        "Category activate successful",
        result
      );
    } catch (err) {
      return next(err);
    }
  };
  public deactivateCategory: RequestHandler = async (req, res, next) => {
    const { categoryid } = req.params;
    try {
      const result = await this.categoryServices.deactivateCategory(categoryid);
      if (!result) {
        return this.responseHandler.notFound(res, "Category not found");
      }
      return this.responseHandler.success(
        res,
        "Category deactivate successful",
        result
      );
    } catch (err) {
      return next(err);
    }
  };

  public findSub: RequestHandler = async (req, res, next) => {
    const { categoryid } = req.params;
    try {
      const result = await this.categoryServices.findSub(categoryid);
      if (!result) {
        return this.responseHandler.notFound(res, "Category not found");
      }
      return this.responseHandler.success(res, "Sub Categories found", result);
    } catch (err) {
      return next(err);
    }
  };
}
