import { inject, injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository.js";
import FileSchema from "../models/file.js";
@injectable()
export default class FileRepository extends BaseRepository {
  constructor() {
    super(FileSchema);
  }
  public async insertMany(files: any) {
    try {
      return await FileSchema.insertMany(files);
    } catch (error) {
      console.error("Failed to insert files:", error);
      throw error;
    }
  }
  public async filterFile(url: string) {
    try {
      return await FileSchema.findOne({ secureUrl: url });
    } catch (err) {
      throw err;
    }
  }
}
