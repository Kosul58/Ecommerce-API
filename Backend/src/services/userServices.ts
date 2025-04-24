import { inject, injectable } from "tsyringe";
import {
  AddUser,
  UpdateUser,
  User,
  UserRole,
} from "../common/types/userType.js";
import { encryptPassword } from "../utils/utils.js";
import AuthServices from "./authServices.js";
import cartServices from "./cartServices.js";
import { comparePassword } from "../utils/utils.js";
import UserRepository from "../repository/userRepository.js";
@injectable()
export default class UserServices {
  constructor(@inject(UserRepository) private userRepository: UserRepository) {}
  private async generateUser(user: AddUser, userRole: string): Promise<User> {
    const encryptedPassword = await encryptPassword(user.password);
    if (userRole === "admin") {
      return {
        userid: "",
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        password: encryptedPassword,
        createdAt: "",
        lastLogin: "",
        role: UserRole.ADMIN,
      };
    } else if (userRole === "seller") {
      return {
        userid: "",
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        password: encryptedPassword,
        createdAt: "",
        lastLogin: "",
        role: UserRole.SELLER,
      };
    } else if (userRole === "user") {
      return {
        userid: "",
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        password: encryptedPassword,
        createdAt: "",
        lastLogin: "",
        role: UserRole.USER,
      };
    }
    throw new Error("Invalid role");
  }

  public async signUp(user: AddUser, role: string) {
    try {
      const [usernameTaken, emailTaken] = await Promise.all([
        this.userRepository.usernameExists(user.username),
        this.userRepository.emailExists(user.email),
      ]);

      if (usernameTaken || emailTaken) return null;
      const newUser = await this.generateUser(user, role);
      const result = await this.userRepository.signUp(newUser);
      if (result) {
        await cartServices.createCart(result._id.toString());
      }
      const token = AuthServices.generateToken(
        result._id.toString(),
        user.username,
        user.email,
        result.role
      );
      return { result, token };
    } catch (err) {
      console.log("Failed to register user", err);
      throw err;
    }
  }

  private async passwordCheck(password: string, encryptedPassword: string) {
    return await comparePassword(password, encryptedPassword);
  }

  public async signIn(username: string, email: string, password: string) {
    try {
      const result = await this.userRepository.signIn(username, email);
      let token;
      if (result) {
        const check = await this.passwordCheck(password, result.password);
        if (!check) return { result: null, token: null };
        await this.userRepository.updateSigninInfo(username, email);
        token = AuthServices.generateToken(
          result._id.toString(),
          username,
          email,
          result.role
        );
      }
      return { result, token };
    } catch (err) {
      console.log("Failed to sign in user", err);
      throw err;
    }
  }

  public async getUser(userid: string) {
    try {
      return await this.userRepository.getUser(userid);
    } catch (err) {
      console.log("Failed to get user", err);
      throw err;
    }
  }

  public async deleteUser(userid: string) {
    try {
      const data = await this.userRepository.deleteUser(userid);
      if (data) {
        await cartServices.deleteCart(userid);
      }
      return data;
    } catch (err) {
      console.log("Failed to delete user", err);
      throw err;
    }
  }

  public async updateUserInfo(userid: string, update: UpdateUser) {
    try {
      const updateFields = Object.fromEntries(
        Object.entries(update).filter(([_, value]) => value !== undefined)
      ) as Partial<UpdateUser>;
      if (updateFields.username) {
        const usernameTaken = await this.userRepository.usernameExists(
          updateFields.username,
          userid
        );
        if (usernameTaken) return null;
      }
      return await this.userRepository.updateUserInfo(userid, updateFields);
    } catch (err) {
      console.log("Failed to update user info", err);
      throw err;
    }
  }

  public async updatePassword() {
    try {
      // Implement password update logic if necessary
    } catch (err) {
      console.log("Failed to update password", err);
      throw err;
    }
  }

  public async updateEmail() {
    try {
      // Implement email update logic if necessary
    } catch (err) {
      console.log("Failed to update email", err);
      throw err;
    }
  }
}
