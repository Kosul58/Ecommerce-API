import { inject, injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import AuditSchema from "../models/audit";
@injectable()
export default class AuditRepository extends BaseRepository {
  constructor() {
    super(AuditSchema);
  }
}
