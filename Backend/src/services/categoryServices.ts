import {
  Category,
  CategoryOption,
  UpdateCategory,
} from "../common/types/categoryType.js";
import CategoryRepository from "../repository/categoryRepository.js";
import { inject, injectable, container } from "tsyringe";
@injectable()
class Factory {
  private storageType: string;
  constructor() {
    this.storageType = process.env.STORAGE_TYPE || "MONGO";
  }
  getRepository() {
    return container.resolve(CategoryRepository);
  }
}
@injectable()
export default class CategoryService {
  private categoryRepository: CategoryRepository;
  constructor(@inject(Factory) private factoryService: Factory) {
    this.categoryRepository =
      this.factoryService.getRepository() as CategoryRepository;
  }
  private generateCategory(category: CategoryOption): Category {
    return {
      name: category.name,
      description: category.description || "",
      parentId: category.parentId || "",
      isActive: true,
    };
  }
  public async checkCategory(name: string) {
    try {
      const category = await this.categoryRepository.checkCategory(name);
      if (category) return null;
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
      const categories = await this.categoryRepository.findActive();
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
        const nameTaken = await this.categoryRepository.findUserName(
          updateFields.name,
          categoryid
        );
        if (nameTaken) {
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
      const category = await this.readCategory(categoryid);
      if (!category) {
        const error = new Error("No category found");
        (error as any).statusCode = 500;
        throw error;
      }
      const result = await this.categoryRepository.deleteOne(categoryid);
      if (!result) {
        const error = new Error("Failed to delete a category");
        (error as any).statusCode = 500;
        throw error;
      }
      const categories = await this.findSub(categoryid);
      const categoryList = categories?.map((p: any) => p.id);
      if (categoryList)
        await this.categoryRepository.updateManyParent(categoryList);
      return "success";
    } catch (err) {
      throw err;
    }
  }

  public async updateStatus(categoryid: string, status: boolean) {
    try {
      const catagory = await this.categoryRepository.findOne(categoryid);
      if (!catagory) {
        const error = new Error("No category found");
        (error as any).statusCode = 500;
        throw error;
      }
      const update = {
        isActive: status,
      };
      const result = await this.categoryRepository.updateOne(
        categoryid,
        update
      );
      if (!result) {
        const error = new Error("Failed to activate a category");
        (error as any).statusCode = 500;
        throw error;
      }
      const relatives = await this.findRelated(categoryid);
      const list = Object.values(relatives).flat();
      const relativeUpdate = await this.categoryRepository.updateManyStatus(
        list,
        status
      );

      return "success";
    } catch (err) {
      throw err;
    }
  }
  private async findRelated(id: string): Promise<Record<string, string[]>> {
    try {
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
      throw err;
    }
  }

  public async findSub(parentid: string) {
    try {
      const categories = await this.categoryRepository.findSubs(parentid);
      if (!categories || categories.length === 0) {
        const error = new Error("No categories found");
        (error as any).statusCode = 404;
        throw error;
      }
      return categories.map((c: any) => ({
        id: c._id.toString(),
        name: c.name,
        description: c.description,
        parentId: c.parentId,
      }));
    } catch (err) {
      throw err;
    }
  }
}
