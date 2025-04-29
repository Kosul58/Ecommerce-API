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

  public signUp: RequestHandler = async (req, res) => {
    const user: AddUser = req.body;
    try {
      const data = await this.userServices.signUp(user, "User");
      if (!data) {
        return this.responseHandler.conflict(
          res,
          "Sign up failed. User Already Exists"
        );
      }
      const { result, token } = data;
      if (!result) {
        return this.responseHandler.error(res, "User signup unsuccessful");
      }
      return this.responseHandler.created(res, "User registered successfully", {
        result,
        token,
      });
    } catch (err) {
      console.error("Sign up error:", err);
      return this.responseHandler.error(res, "Unexpected error during sign up");
    }
  };

  public signIn: RequestHandler = async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const { result, token } = await this.userServices.signIn(
        username,
        email,
        password
      );
      if (!result) {
        return this.responseHandler.error(res, "Signin failed. User not found");
      }
      if (result === "incorrectpwd") {
        return this.responseHandler.error(
          res,
          "Signin failed. Password does not match"
        );
      }
      return this.responseHandler.success(res, "Signin successful", {
        result,
        token,
      });
    } catch (err) {
      console.error("Sign in error:", err);
      return this.responseHandler.error(res, "Unexpected error during sign in");
    }
  };

  public deleteUser: RequestHandler = async (req, res) => {
    const userid = req.user.id || req.body.userid;
    try {
      const result = await this.userServices.deleteUser(userid);
      if (!result) {
        return this.responseHandler.notFound(res, "User not found");
      }
      return this.responseHandler.success(
        res,
        "User deleted successfully",
        result
      );
    } catch (err) {
      console.error("Delete user error:", err);
      return this.responseHandler.error(
        res,
        "Unexpected error during user deletion"
      );
    }
  };

  public updateUserInfo: RequestHandler = async (req, res) => {
    const userid = req.user.id;
    const update: UpdateUser = req.body;
    try {
      const result = await this.userServices.updateUserInfo(userid, update);
      if (!result) {
        return this.responseHandler.notFound(res, "User not found");
      }
      if (result === "unametaken") {
        return this.responseHandler.conflict(
          res,
          "Another user with the same username exists"
        );
      }
      if (result === "phonetaken") {
        return this.responseHandler.conflict(
          res,
          "Another user with the same phone number exists"
        );
      }
      return this.responseHandler.success(
        res,
        "User information updated",
        result
      );
    } catch (err) {
      console.error("Update user error:", err);
      return this.responseHandler.error(res, "Unexpected error during update");
    }
  };

  public getUser: RequestHandler = async (req, res) => {
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
      console.error("Search user error:", err);
      return this.responseHandler.error(res, "Unexpected error during search");
    }
  };

  public getUsers: RequestHandler = async (_req, res) => {
    try {
      const result = await this.userServices.getUsers();
      if (!result) {
        return this.responseHandler.notFound(res, "Users not found");
      }
      return this.responseHandler.success(
        res,
        "Users search successful",
        result
      );
    } catch (err) {
      console.error("Search users error:", err);
      return this.responseHandler.error(res, "Unexpected error during search");
    }
  };
}
