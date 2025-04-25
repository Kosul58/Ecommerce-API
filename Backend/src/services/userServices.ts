import { inject, injectable } from "tsyringe";
import {
  AddUser,
  UpdateUser,
  User,
  UserRole,
} from "../common/types/userType.js";
import AuthServices from "./authServices.js";
import CartService from "./cartServices.js";
import UserRepository from "../repository/userRepository.js";
import Utills from "../utils/utils.js";

@injectable()
export default class UserServices {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(CartService) private cartService: CartService,
    @inject(AuthServices) private authService: AuthServices,
    @inject(Utills) private utils: Utills
  ) {}
  private async generateUser(user: AddUser, role: string): Promise<User> {
    const encryptedPassword = await this.utils.encryptPassword(user.password);
    let userRole;
    if (role === "User") {
      userRole = UserRole.USER;
    } else {
      userRole = UserRole.ADMIN;
    }
    return {
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      password: encryptedPassword,
      phone: user.phone,
      address: user.address,
      role: userRole,
    };
  }

  public async signUp(user: AddUser, role: string) {
    try {
      const [usernameTaken, emailTaken, phoneTaken] = await Promise.all([
        this.userRepository.findUserName(user.username),
        this.userRepository.findEmail(user.email),
        this.userRepository.findPhoneNumber(user.phone),
      ]);
      if (usernameTaken || emailTaken || phoneTaken) return null;
      const newUser = await this.generateUser(user, role);
      const result = await this.userRepository.signUp(newUser);
      if (result && result.role === "User") {
        await this.cartService.createCart(result._id.toString());
      }
      const token = this.authService.generateToken(
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

  public async signIn(username: string, email: string, password: string) {
    try {
      const result = await this.userRepository.signIn(username, email);
      let token;
      if (result) {
        const check = await this.utils.comparePassword(
          password,
          result.password
        );
        if (!check) return { result: "incorrectpwd" };
        token = this.authService.generateToken(
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
      return await this.userRepository.findUser(userid);
    } catch (err) {
      console.log("Failed to get user", err);
      throw err;
    }
  }
  public async getUsers() {
    try {
      return await this.userRepository.findUsers();
    } catch (err) {
      throw err;
    }
  }

  public async deleteUser(userid: string) {
    try {
      const data = await this.userRepository.deleteUser(userid);
      if (data) {
        await this.cartService.deleteCart(userid);
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
        const usernameTaken = await this.userRepository.findUserName(
          updateFields.username,
          userid
        );
        if (usernameTaken) return null;
      }
      if (updateFields.phone) {
        const usernameTaken = await this.userRepository.findPhoneNumber(
          updateFields.phone,
          userid
        );
        if (usernameTaken) return null;
      }
      return await this.userRepository.updateUser(userid, updateFields);
    } catch (err) {
      console.log("Failed to update user info", err);
      throw err;
    }
  }

  public async updatePassword() {
    try {
    } catch (err) {
      console.log("Failed to update password", err);
      throw err;
    }
  }

  public async updateEmail() {
    try {
    } catch (err) {
      console.log("Failed to update email", err);
      throw err;
    }
  }
}
