import { inject, injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository.js";
import FileSchema from "../models/file.js";
@injectable()
export default class FileRepository extends BaseRepository {
  constructor() {
    super(FileSchema);
  }
}
