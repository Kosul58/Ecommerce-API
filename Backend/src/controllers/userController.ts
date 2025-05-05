import { RequestHandler } from "express";
import { injectable, inject } from "tsyringe";
import { AddUser, UpdateUser } from "../common/types/userType.js";
import UserServices from "../services/userServices.js";
import ResponseHandler from "../utils/apiResponse.js";

@injectable()
export default class UserController {
  constructor(
    @inject(UserServices) private userServices: UserServices,
    @inject(ResponseHandler) private responseHandler: ResponseHandler
  ) {}

  public signUp: RequestHandler = async (req, res, next) => {
    const user: AddUser = req.body;
    try {
      const data = await this.userServices.signUp(user, "User");
      const { result, token } = data;
      return this.responseHandler.created(res, "User registered successfully", {
        result,
        token,
      });
    } catch (err) {
      return next(err);
    }
  };

  public signIn: RequestHandler = async (req, res, next) => {
    const { username, email, password } = req.body;
    try {
      const { result, token } = await this.userServices.signIn(
        username,
        email,
        password
      );
      return this.responseHandler.success(res, "Signin successful", {
        result,
        token,
      });
    } catch (err) {
      return next(err);
    }
  };

  public deleteUser: RequestHandler = async (req, res, next) => {
    const { userid } = req.params;
    const { id, role } = req.user;
    try {
      const result = await this.userServices.deleteUser(userid, id, role);
      return this.responseHandler.success(
        res,
        "User deleted successfully",
        result
      );
    } catch (err) {
      return next(err);
    }
  };

  public updateUserInfo: RequestHandler = async (req, res, next) => {
    const userid = req.user.id;
    const update: UpdateUser = req.body;
    try {
      const result = await this.userServices.updateUserInfo(userid, update);
      if (!result) {
        return this.responseHandler.notFound(res, "User not found");
      }
      return this.responseHandler.success(
        res,
        "User information updated",
        result
      );
    } catch (err) {
      return next(err);
    }
  };

  public getUser: RequestHandler = async (req, res, next) => {
    const userid = req.user.id;
    try {
      const result = await this.userServices.getUser(userid);
      if (!result) {
        return this.responseHandler.notFound(res, "User not found");
      }
      return this.responseHandler.success(
        res,
        "User search successful",
        result
      );
    } catch (err) {
      return next(err);
    }
  };

  public getUsers: RequestHandler = async (req, res, next) => {
    try {
      const result = await this.userServices.getUsers();
      if (!result || result.length === 0) {
        return this.responseHandler.notFound(res, "Users not found");
      }
      return this.responseHandler.success(
        res,
        "Users search successful",
        result
      );
    } catch (err) {
      return next(err);
    }
  };

  public sendMail: RequestHandler = async (req, res, next) => {
    try {
      const result = await this.userServices.sendMail();
      if (!result) {
        return this.responseHandler.error(res, "Failed to send mail");
      }
      return this.responseHandler.success(
        res,
        "Mail sent successfully",
        result
      );
    } catch (err) {
      return next(err);
    }
  };

  public pdf: RequestHandler = async (req, res, next) => {
    try {
      const result = await this.userServices.pdf();
      if (!result) {
        return this.responseHandler.error(res, "Failed to create pdf");
      }
      return this.responseHandler.success(
        res,
        "pdf created successfully",
        result
      );
    } catch (err) {
      return next(err);
    }
  };
}
