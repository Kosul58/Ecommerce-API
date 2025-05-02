import { Category, UpdateCategory } from "../common/types/categoryType.js";
import { CategoryRepositoryInterface } from "../common/types/classInterfaces.js";
import CategorySchema from "../models/category.js";
import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository.js";

@injectable()
export default class CategoryRepository
  extends BaseRepository
  implements CategoryRepositoryInterface
{
  constructor() {
    super(CategorySchema);
  }

  public async checkCategory(name: string) {
    try {
      return await this.model.findOne({ name });
    } catch (err) {
      throw err;
    }
  }

  public async findAll() {
    try {
      return await this.model.find({ isActive: true });
    } catch (err) {
      throw err;
    }
  }
}
