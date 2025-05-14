import { inject, injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository.js";
import AuditSchema from "../models/audit.js";
@injectable()
export default class AuditRepository extends BaseRepository {
  constructor() {
    super(AuditSchema);
  }
}
