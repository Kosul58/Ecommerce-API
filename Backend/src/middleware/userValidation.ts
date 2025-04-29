import { injectable, inject } from "tsyringe";
import {
  signUpSchema,
  signInSchema,
  updateSchema,
  idSchema,
} from "../validation/userSchema.js";
import DataValidation from "./validateData";
@injectable()
export default class UserValidation {
  constructor(@inject(DataValidation) private dataValidation: DataValidation) {}
  public signUpValidation() {
    return this.dataValidation.validateBody(signUpSchema);
  }
  public signInValidation() {
    return this.dataValidation.validateBody(signInSchema);
  }
  public updateUserValidation() {
    return this.dataValidation.validateBody(updateSchema);
  }
  public userValidation() {
    return this.dataValidation.validateTokenData(idSchema);
  }
}
