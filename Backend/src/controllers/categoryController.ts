import {
  CategoryOption,
  UpdateCategory,
} from "../common/types/categoryType.js";
import { RequestHandler } from "express";
import { inject, injectable } from "tsyringe";
import CategoryService from "../services/categoryServices.js";
@injectable()
export default class CategoryController {
  constructor(
    @inject(CategoryService) private categoryServices: CategoryService
  ) {}
  // Create Category
  public createCategory: RequestHandler = async (req, res) => {
    const category: CategoryOption = req.body;
    try {
      // if (!category.name || !category.description) {
      //   res
      //     .status(400)
      //     .json({ message: "Name and description field required" });
      //   return;
      // }
      const result = await this.categoryServices.createCategory(category);
      if (result === "catexists") {
        res.status(400).json({
          message: "Category already exists",
        });
      }
      if (
        (Array.isArray(result) && result.length === 0) ||
        (!Array.isArray(result) && Object.keys(result).length === 0)
      ) {
        res.status(404).json({
          message: "Category creation unsuccessful",
          response: [],
        });
        return;
      }
      res.status(201).json({
        message: "Category creation successful",
        response: result,
      });
      return;
    } catch (err) {
      res.status(500).json({ message: "Failed to create category" });
      return;
    }
  };

  // Read All Categories
  public readCategories: RequestHandler = async (req, res) => {
    try {
      const result = await this.categoryServices.readCategories();
      if (!result || result.length === 0) {
        res.status(404).json({
          message: "Categories read unsuccessful",
          response: [],
        });
        return;
      }
      res.status(200).json({
        message: "Categories read successful",
        response: result,
      });
      return;
    } catch (err) {
      res.status(500).json({ message: "Failed to read categories" });
      return;
    }
  };

  // Read Single Category
  public readCategory: RequestHandler = async (req, res) => {
    const { categoryid } = req.params;
    try {
      // if (!categoryid) {
      //   res.status(400).json({ message: "Category categoryid required" });
      //   return;
      // }

      const result = await this.categoryServices.readCategory(categoryid);
      if (!result || Object.keys(result).length < 1) {
        res.status(404).json({
          message: "Category read unsuccessful",
          response: [],
        });
        return;
      }
      res.status(200).json({
        message: "Category read successful",
        response: result,
      });
      return;
    } catch (err) {
      res.status(500).json({ message: "Failed to read category" });
      return;
    }
  };

  // Update Category
  public updateCategory: RequestHandler = async (req, res) => {
    const { categoryid } = req.params;
    const update: UpdateCategory = req.body;
    try {
      // if (!categoryid || Object.keys(update).length < 1) {
      //   res.status(400).json({ message: "Enter all required fields" });
      //   return;
      // }
      const result = await this.categoryServices.updateCategory(
        categoryid,
        update
      );
      if (result === undefined) {
        res.status(404).json({
          message: "Category not found",
        });
        return;
      }
      if (result === "catexists") {
        res.status(400).json({
          message: "Category with same name already exists",
        });
        return;
      }
      if (result === "noparent") {
        res.status(400).json({
          message: "Cannot find any category with a given parentId",
        });
        return;
      }
      if (Array.isArray(result) && result.length === 0) {
        res.status(404).json({
          message: "Category update unsuccessful",
          response: [],
        });
        return;
      }

      res.status(200).json({
        message: "Category update successful",
        response: result,
      });
      return;
    } catch (err) {
      res.status(500).json({ message: "Failed to update category" });
      return;
    }
  };

  // Delete Category
  public deleteCategory: RequestHandler = async (req, res) => {
    const { categoryid } = req.params;
    try {
      // if (!categoryid) {
      //   res.status(400).json({ message: "Enter all required fields" });
      //   return;
      // }
      const result = await this.categoryServices.deleteCategory(categoryid);
      if (!result) {
        res.status(404).json({
          message: "Category not found",
        });
        return;
      }
      if (Array.isArray(result) && result.length === 0) {
        res.status(404).json({
          message: "Category delete unsuccessful",
          response: [],
        });
        return;
      }
      res.status(200).json({
        message: "Category delete successful",
        response: result,
      });
      return;
    } catch (err) {
      res.status(500).json({ message: "Failed to delete category" });
      return;
    }
  };
}
