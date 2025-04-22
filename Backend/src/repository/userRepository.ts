import { UpdateUser, User } from "../common/types/userType.js";
import { getCurrentDateTimeStamp, comparePassword } from "../utils/utils.js";
import UserSchema from "../models/User.js";

class UserRepository {
  public async usernameExists(username: string, excludeId?: string) {
    const user = await UserSchema.findOne({ username });
    return user && user._id.toString() !== excludeId;
  }
  public async emailExists(email: string, excludeId?: string) {
    const user = await UserSchema.findOne({ email });
    return user && user._id.toString() !== excludeId;
  }

  public async signIn(username: string, email: string) {
    try {
      const user = await UserSchema.findOne({ username, email });
      if (!user) return undefined;
      user.lastLogin = getCurrentDateTimeStamp();
      await user.save();
      return user;
    } catch (err) {
      console.log("Failed to sign in user", err);
      throw err;
    }
  }
  public async updateSigninInfo(username: string, email: string) {
    try {
      const user = await UserSchema.findOne({ username, email });
      if (!user) return undefined;
      user.lastLogin = getCurrentDateTimeStamp();
      await user.save();
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
      await newUser.save();
      return newUser;
    } catch (err) {
      console.log("Failed to register user", err);
      throw err;
    }
  }

  public async getUser(userid: string) {
    try {
      return await UserSchema.findById(userid);
    } catch (err) {
      console.log("Failed to fetch user", err);
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

  public async updateUserInfo(userid: string, update: UpdateUser) {
    try {
      const user = await UserSchema.findByIdAndUpdate(
        userid,
        { $set: update },
        { new: true }
      );
      return user || undefined;
    } catch (err) {
      console.log("Failed to update user info", err);
      throw err;
    }
  }

  public async updatePassword(userid: string, password: string) {}

  public async updateEmail(userid: string, email: string) {}
}

export default new UserRepository();
