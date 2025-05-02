import { RequestHandler } from "express";
import { injectable, inject } from "tsyringe";
import { AddUser, UpdateUser } from "../common/types/userType.js";
import UserServices from "../services/userServices.js";
import ResponseHandler from "../utils/apiResponse.js";

@injectable()
export default class AdminController {
  constructor(
    @inject(UserServices) private userServices: UserServices,
    @inject(ResponseHandler) private responseHandler: ResponseHandler
  ) {}
  public signUp: RequestHandler = async (req, res, next) => {
    const user: AddUser = req.body;
    try {
      const data = await this.userServices.signUp(user, "Admin");
      const { result, token } = data;
      return this.responseHandler.created(
        res,
        "Admin registered successfully",
        {
          result,
          token,
        }
      );
    } catch (err) {
      return next(err);
    }
  };
}
