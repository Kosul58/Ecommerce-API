import { inject, injectable } from "tsyringe";
import { UpdateUser, User } from "../common/types/userType.js";
import MongoDb from "../config/mongoConfig.js";
import UserSchema from "../models/user.js";

@injectable()
export default class UserRepository {
  public async findUserName(username: string, excludeId?: string) {
    const user = await UserSchema.findOne({ username });
    return user && user._id.toString() !== excludeId;
  }

  public async findEmail(email: string, excludeId?: string) {
    const user = await UserSchema.findOne({ email });
    return user && user._id.toString() !== excludeId;
  }

  public async findPhoneNumber(phone: number, excludeId?: string) {
    const user = await UserSchema.findOne({ phone });
    return user && user._id.toString() !== excludeId;
  }

  public async signIn(username: string, email: string) {
    try {
      const user = await UserSchema.findOne({ username, email });
      if (!user) return undefined;
      return await user.save();
    } catch (err) {
      console.log("Failed to sign in user", err);
      throw err;
    }
  }

  public async signUp(user: User) {
    try {
      const newUser = new UserSchema(user);
      await newUser.save();
      return newUser;
    } catch (err) {
      console.log("Failed to register user", err);
      throw err;
    }
  }

  public async findUser(userid: string) {
    try {
      return await UserSchema.findById(userid);
    } catch (err) {
      console.log("Failed to fetch user", err);
      throw err;
    }
  }
  public async findUsers() {
    try {
      return await UserSchema.find();
    } catch (err) {
      console.log("Failed to fetch users", err);
      throw err;
    }
  }

  public async deleteUser(userid: string) {
    try {
      return await UserSchema.findByIdAndDelete(userid);
    } catch (err) {
      console.log("Failed to remove user", err);
      throw err;
    }
  }

  public async updateUser(userid: string, update: UpdateUser) {
    try {
      const user = await UserSchema.findByIdAndUpdate(
        userid,
        { $set: update },
        { new: true }
      );
      return user;
    } catch (err) {
      console.log("Failed to update user info", err);
      throw err;
    }
  }

  public async updatePassword(userid: string, password: string) {}

  public async updateEmail(userid: string, email: string) {}
}
