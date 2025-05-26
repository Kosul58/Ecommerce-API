import { inject, injectable } from "tsyringe";
import { UpdateUser, User } from "../common/types/userType";
import { UserRepositoryInterface } from "../common/types/classInterfaces";
import UserSchema from "../models/user";
import { BaseRepository } from "./baseRepository";

@injectable()
export default class UserRepository
  extends BaseRepository
  implements UserRepositoryInterface
{
  constructor() {
    super(UserSchema);
  }
  public async findUserName(username: string, excludeId?: string) {
    const user = await this.model.findOne({ username });
    return user && user._id.toString() !== excludeId;
  }
  public async findEmail(email: string, excludeId?: string) {
    const user = await this.model.findOne({ email });
    return user && user._id.toString() !== excludeId;
  }
  public async findPhoneNumber(phone: number, excludeId?: string) {
    const user = await this.model.findOne({ phone });
    return user && user._id.toString() !== excludeId;
  }
  public async signIn(email: string) {
    try {
      return await this.model.findOne({ email });
    } catch (err) {
      throw err;
    }
  }
  public async signUp(user: User) {
    try {
      return await this.create(user);
    } catch (err) {
      throw err;
    }
  }
  public async updatePassword(userid: string, password: string) {
    try {
      return await this.updateOne(userid, { password });
    } catch (err) {
      throw err;
    }
  }

  public async updateEmail(userid: string, email: string) {
    try {
      return await this.updateOne(userid, { email });
    } catch (err) {
      throw err;
    }
  }
}
