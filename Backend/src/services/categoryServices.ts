import {
  Category,
  CategoryOption,
  UpdateCategory,
} from "../common/types/categoryType";
import { CategoryRepositoryInterface } from "../common/types/classInterfaces";
import CategoryFactory from "../factories/categoryRepositoryFactory";
import { inject, injectable, container } from "tsyringe";
import logger from "../utils/logger";
type CategoryTree = {
  [key: string]: string | CategoryTree;
};
@injectable()
export default class CategoryService {
  private categoryRepository: CategoryRepositoryInterface;

  constructor(
    @inject(CategoryFactory) private categoryFactory: CategoryFactory
  ) {
    this.categoryRepository =
      this.categoryFactory.getRepository() as CategoryRepositoryInterface;
  }

  private generateCategory(category: CategoryOption): Category {
    logger.info(`Generating category with name: ${category.name}`);
    return {
      name: category.name,
      description: category.description || "",
      parentId: category.parentId || "",
      isActive: true,
    };
  }

  public async checkCategory(name: string) {
    try {
      logger.info(`Checking if category with name ${name} exists`);
      const category = await this.categoryRepository.checkCategory(name);
      if (category) {
        logger.info(`Category with name ${name} exists`);
        return null;
      }
      return "cat";
    } catch (err) {
      logger.error(`Error checking category with name ${name}`);
      throw err;
    }
  }

  public async createCategory(category: CategoryOption) {
    try {
      const isUnique = await this.checkCategory(category.name);
      if (!isUnique) {
        logger.warn(`Category with name ${category.name} already exists`);
        return null;
      }
      if (category.parentId) {
        const parent = await this.categoryRepository.findOne(category.parentId);
        if (!parent) {
          logger.warn("No parent found for the provided parentId");
          const errror = new Error("No parent found");
          (errror as any).statusCode = 404;
          throw errror;
        }
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
      logger.error(`Error creating category with name ${category.name}`);
      throw err;
    }
  }

  public async readCategories() {
    try {
      const categories = await this.categoryRepository.findAll();
      if (!categories || categories.length === 0) {
        const error = new Error("No categories found");
        (error as any).statusCode = 404;
        logger.warn("No categories found");
        throw error;
      }
      return categories.map((c: any) => ({
        id: c._id.toString(),
        name: c.name,
        description: c.description,
        parentId: c.parentId,
      }));
    } catch (err) {
      logger.error("Error fetching active categories");
      throw err;
    }
  }

  public async readCategory(categoryid: string) {
    try {
      const category = await this.categoryRepository.findOne(categoryid);
      if (!category) {
        logger.warn(`Category with ID: ${categoryid} not found`);
        return null;
      }
      return {
        id: category._id.toString(),
        name: category.name,
        description: category.description,
        parentId: category.parentId,
      };
    } catch (err) {
      logger.error(`Error fetching category with ID: ${categoryid}`);
      throw err;
    }
  }

  public async updateCategory(categoryid: string, update: UpdateCategory) {
    try {
      const updateFields = Object.fromEntries(
        Object.entries(update).filter(([_, value]) => value !== undefined)
      ) as Partial<UpdateCategory>;

      if (updateFields.name) {
        const nameTaken = await this.categoryRepository.findUserName(
          updateFields.name,
          categoryid
        );
        if (nameTaken) {
          const error = new Error("Category already exists");
          (error as any).statusCode = 409;
          logger.warn(`Category name ${updateFields.name} already taken`);
          throw error;
        }
      }

      if (update.parentId) {
        const check = await this.readCategory(update.parentId);
        if (!check) {
          const error = new Error("No such parentId exists");
          (error as any).statusCode = 400;
          logger.warn(`No parentId found for ${update.parentId}`);
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
        logger.error(`Failed to update category with ID: ${categoryid}`);
        throw error;
      }
      return "success";
    } catch (err) {
      logger.error(`Error updating category with ID: ${categoryid}`);
      throw err;
    }
  }

  public async deleteCategory(categoryid: string) {
    try {
      logger.info(`Attempting to delete category with ID: ${categoryid}`);
      const category = await this.readCategory(categoryid);
      if (!category) {
        const error = new Error("No category found");
        (error as any).statusCode = 500;
        logger.warn(`Category with ID: ${categoryid} not found`);
        throw error;
      }
      const result = await this.categoryRepository.deleteOne(categoryid);
      if (!result) {
        const error = new Error("Failed to delete a category");
        (error as any).statusCode = 500;
        logger.error(`Failed to delete category with ID: ${categoryid}`);
        throw error;
      }

      const categories = await this.findSub(categoryid);
      if (categories) {
        const categoryList = categories.map((p: any) => p.id);
        if (categoryList)
          await this.categoryRepository.updateManyParent(categoryList);
        await this.categoryRepository.updateManyStatus(categoryList, false);
      }

      return "success";
    } catch (err) {
      logger.error(`Error deleting category with ID: ${categoryid}`);
      throw err;
    }
  }

  public async updateStatus(categoryid: string, status: boolean) {
    try {
      const category = await this.categoryRepository.findOne(categoryid);
      if (!category) {
        logger.warn(`Category with ID: ${categoryid} not found`);
        const error = new Error("No category found");
        (error as any).statusCode = 500;
        throw error;
      }
      if (category.parentId) {
        const parent = await this.categoryRepository.findOne(category.parentId);
        if (parent.isActive === false && status === true) {
          logger.warn(`Parent of ID: ${categoryid} is not active`);
          const error = new Error("Parent is not active");
          (error as any).statusCode = 403;
          throw error;
        }
      }
      const update = { isActive: status };
      const result = await this.categoryRepository.updateOne(
        categoryid,
        update
      );
      if (!result) {
        const error = new Error("Failed to activate category");
        (error as any).statusCode = 500;
        logger.error(
          `Failed to update status for category with ID: ${categoryid}`
        );
        throw error;
      }

      const relatives = await this.findRelated(categoryid);
      const list = Object.values(relatives).flat();
      await this.categoryRepository.updateManyStatus(list, status);
      return "success";
    } catch (err) {
      logger.error(`Error updating status for category with ID: ${categoryid}`);
      throw err;
    }
  }

  private async findRelated(id: string): Promise<Record<string, string[]>> {
    try {
      logger.info(`Finding related categories for category ID: ${id}`);
      const categories = await this.categoryRepository.findAll();
      const result: Record<string, string[]> = {};

      const recurse = (currentId: string) => {
        const children = categories.filter(
          (cat: any) => cat.parentId === currentId
        );
        const childIds = children.map((child: any) => child._id.toString());

        if (childIds.length > 0) {
          result[currentId] = childIds;
        }

        for (const childId of childIds) {
          recurse(childId);
        }
      };
      recurse(id);
      return result;
    } catch (err) {
      logger.error(`Error finding related categories for category ID: ${id}`);
      throw err;
    }
  }

  public async findSub(parentid: string) {
    try {
      const categories = await this.categoryRepository.findSubs(parentid);
      if (!categories || categories.length === 0) {
        logger.warn(`No subcategories found for parent ID: ${parentid}`);
        return;
      }
      return categories.map((c: any) => ({
        id: c._id.toString(),
        name: c.name,
        description: c.description,
        parentId: c.parentId,
      }));
    } catch (err) {
      logger.error(`Error fetching subcategories for parent ID: ${parentid}`);
      throw err;
    }
  }
  public async categorylist(): Promise<CategoryTree> {
    try {
      const categories = await this.categoryRepository.findActive();
      if (!categories || categories.length === 0) {
        logger.warn(`No active categories found`);
        return {};
      }

      const idMap: Record<string, any> = {};
      categories.forEach((cat: any) => {
        idMap[cat._id.toString()] = {
          name: cat.name,
          parentId: cat.parentId?.toString() || null,
          children: {},
        };
      });

      categories.forEach((cat: any) => {
        const id = cat._id.toString();
        const node = idMap[id];
        const parentId = node.parentId;

        if (parentId && idMap[parentId]) {
          idMap[parentId].children[node.name] = node;
        }
      });

      const tree: any = {};
      for (const id in idMap) {
        const node = idMap[id];
        if (!node.parentId) {
          tree[node.name] = node;
        }
      }

      function simplifyNode(node: any): any {
        const keys = Object.keys(node.children);
        if (keys.length === 0) {
          return node.name;
        }
        const simplifiedChildren: any = {};
        for (const key of keys) {
          simplifiedChildren[key] = simplifyNode(node.children[key]);
        }
        return simplifiedChildren;
      }

      const simplifiedTree: any = {};
      for (const rootName in tree) {
        simplifiedTree[rootName] = simplifyNode(tree[rootName]);
      }

      return simplifiedTree;
    } catch (err) {
      logger.error(`Error generating categoryList`, err);
      throw err;
    }
  }
}
