import { inject, injectable } from "tsyringe";
import { UpdateUser, User } from "../common/types/userType.js";
import { getCurrentDateTimeStamp } from "../utils/utils.js";
import MongoDb from "../config/mongoConfig.js";
import UserSchema from "../models/user.js";

@injectable()
export default class UserRepository {
  constructor(@inject(MongoDb) private mongoDb: MongoDb) {}

  public async usernameExists(username: string, excludeId?: string) {
    const user = await this.mongoDb.findOne(UserSchema, { username });
    return user && user["_id"].toString() !== excludeId;
  }

  public async emailExists(email: string, excludeId?: string) {
    const user = await this.mongoDb.findOne(UserSchema, { email });
    return user && user["_id"].toString() !== excludeId;
  }

  public async signIn(username: string, email: string) {
    try {
      const user = await this.mongoDb.findOne(UserSchema, { username, email });
      if (!user) return undefined;
      user.lastLogin = getCurrentDateTimeStamp();
      await this.mongoDb.save(user);
      return user;
    } catch (err) {
      console.log("Failed to sign in user", err);
      throw err;
    }
  }

  public async updateSigninInfo(username: string, email: string) {
    try {
      const user = await this.mongoDb.findOne(UserSchema, { username, email });
      if (!user) return undefined;
      user.lastLogin = getCurrentDateTimeStamp();
      await this.mongoDb.save(user);
      return user;
    } catch (err) {
      console.log("Failed to update user signin", err);
      throw err;
    }
  }

  public async signUp(user: User) {
    try {
      const newUser = new UserSchema({
        ...user,
        createdAt: getCurrentDateTimeStamp(),
        lastLogin: getCurrentDateTimeStamp(),
      });
      return await this.mongoDb.save(newUser);
    } catch (err) {
      console.log("Failed to register user", err);
      throw err;
    }
  }

  public async getUser(userid: string) {
    try {
      return await this.mongoDb.findById(UserSchema, userid);
    } catch (err) {
      console.log("Failed to fetch user", err);
      throw err;
    }
  }

  public async deleteUser(userid: string) {
    try {
      return await this.mongoDb.findByIdAndDelete(UserSchema, userid);
    } catch (err) {
      console.log("Failed to remove user", err);
      throw err;
    }
  }

  public async updateUserInfo(userid: string, update: UpdateUser) {
    try {
      return await this.mongoDb.findByIdAndUpdate(
        UserSchema,
        userid,
        { $set: update },
        { new: true }
      );
    } catch (err) {
      console.log("Failed to update user info", err);
      throw err;
    }
  }

  public async updatePassword(userid: string, password: string) {
    // TODO: implement logic
  }

  public async updateEmail(userid: string, email: string) {
    // TODO: implement logic
  }
}
