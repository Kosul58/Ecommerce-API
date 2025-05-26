import { CategoryOption, UpdateCategory } from "../common/types/categoryType";
import { RequestHandler } from "express";
import { inject, injectable } from "tsyringe";
import CategoryService from "../services/categoryServices";
import ResponseHandler from "../utils/apiResponse";
import logger from "../utils/logger";

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
      logger.info("Attempting to create category", { category });
      const result = await this.categoryServices.createCategory(category);
      if (!result) {
        logger.warn("Category already exists", { category });
        return this.responseHandler.conflict(res, "Category already exists");
      }
      logger.info("Category creation successful", { result });
      return this.responseHandler.created(
        res,
        "Category creation successful",
        result
      );
    } catch (err) {
      logger.error("Error creating category", err);
      return next(err);
    }
  };

  // Read All Categories
  public readCategories: RequestHandler = async (req, res, next) => {
    try {
      logger.info("Fetching all categories");
      const result = await this.categoryServices.readCategories();
      if (!result || result.length === 0) {
        logger.warn("No categories found");
        return this.responseHandler.notFound(res, "No categories found");
      }
      logger.info("Categories read successful");
      return this.responseHandler.success(
        res,
        "Categories read successful",
        result
      );
    } catch (err) {
      logger.error("Error reading categories", err);
      return next(err);
    }
  };

  // Read Single Category
  public readCategory: RequestHandler = async (req, res, next) => {
    const { categoryid } = req.params;
    try {
      logger.info("Fetching category", { categoryid });
      const result = await this.categoryServices.readCategory(categoryid);
      if (!result || Object.keys(result).length < 1) {
        logger.warn("No category found", { categoryid });
        return this.responseHandler.notFound(res, "No category found");
      }
      logger.info("Category read successful", { result });
      return this.responseHandler.success(
        res,
        "Category read successful",
        result
      );
    } catch (err) {
      logger.error("Error reading category", err);
      return next(err);
    }
  };

  // Update Category
  public updateCategory: RequestHandler = async (req, res, next) => {
    const { categoryid } = req.params;
    const update: UpdateCategory = req.body;
    try {
      logger.info("Attempting to update category ", { categoryid });
      const result = await this.categoryServices.updateCategory(
        categoryid,
        update
      );
      if (!result) {
        logger.warn("Category not found for update", { categoryid });
        return this.responseHandler.notFound(res, "Category not found");
      }
      logger.info("Category update successful", { result });
      return this.responseHandler.success(
        res,
        "Category update successful",
        result
      );
    } catch (err) {
      logger.error("Error updating category", err);
      return next(err);
    }
  };

  // Delete Category
  public deleteCategory: RequestHandler = async (req, res, next) => {
    const { categoryid } = req.params;
    try {
      logger.info("Attempting to delete category", { categoryid });
      const result = await this.categoryServices.deleteCategory(categoryid);
      if (!result) {
        logger.warn("Category not found for deletion", { categoryid });
        return this.responseHandler.notFound(res, "Category not found");
      }
      logger.info("Category delete successful", { result });
      return this.responseHandler.success(
        res,
        "Category delete successful",
        result
      );
    } catch (err) {
      logger.error("Error deleting category", err);
      return next(err);
    }
  };

  public updateStatus: RequestHandler = async (req, res, next) => {
    const { categoryid, status }: { categoryid: string; status: boolean } =
      req.body;
    try {
      logger.info("Attempting to update category status", {
        categoryid,
        status,
      });
      const result = await this.categoryServices.updateStatus(
        categoryid,
        status
      );
      if (!result) {
        logger.warn("Category not found for status update", { categoryid });
        return this.responseHandler.notFound(res, "Category not found");
      }
      logger.info("Category status update successful", { result });
      return this.responseHandler.success(
        res,
        "Category status update successful",
        result
      );
    } catch (err) {
      logger.error("Error updating category status", err);
      return next(err);
    }
  };

  public findSub: RequestHandler = async (req, res, next) => {
    const { categoryid } = req.params;
    try {
      logger.info("Fetching subcategories", { categoryid });
      const result = await this.categoryServices.findSub(categoryid);
      if (!result || result.length === 0) {
        logger.warn("No subcategories found", { categoryid });
        return this.responseHandler.notFound(res, "Category not found");
      }
      logger.info("Subcategories found", { result });
      return this.responseHandler.success(res, "Sub Categories found", result);
    } catch (err) {
      logger.error("Error finding subcategories", err);
      return next(err);
    }
  };

  public categoryList: RequestHandler = async (req, res, next) => {
    try {
      logger.info("Fetching categorylist");
      const result = await this.categoryServices.categorylist();
      if (!result || Object.keys(result).length === 0) {
        logger.warn("No actuve categories found");
        return this.responseHandler.notFound(res, "Category not found");
      }
      logger.info("Subcategories found");
      return this.responseHandler.success(res, "Sub Categories found", result);
    } catch (err) {
      logger.error("Error finding subcategories", err);
      return next(err);
    }
  };
}
