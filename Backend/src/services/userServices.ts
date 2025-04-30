import { inject, injectable } from "tsyringe";
import {
  AddUser,
  UpdateUser,
  User,
  UserReturn,
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
    try {
      const encryptedPassword = await this.utils.encryptPassword(user.password);
      const userRole = role === "User" ? UserRole.USER : UserRole.ADMIN;
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
    } catch {
      const error = new Error("Password encryption failed");
      (error as any).statusCode = 500;
      throw error;
    }
  }

  public async signUp(user: AddUser, role: string) {
    try {
      const [usernameTaken, emailTaken, phoneTaken] = await Promise.all([
        this.userRepository.findUserName(user.username),
        this.userRepository.findEmail(user.email),
        this.userRepository.findPhoneNumber(user.phone),
      ]);

      if (usernameTaken || emailTaken || phoneTaken) {
        const reasons = [];
        if (usernameTaken) reasons.push("Username already taken");
        if (emailTaken) reasons.push("Email already registered");
        if (phoneTaken) reasons.push("Phone number already registered");

        const error = new Error("User already exists");
        (error as any).statusCode = 409;
        (error as any).details = reasons;
        throw error;
      }

      const newUser = await this.generateUser(user, role);
      const result = await this.userRepository.signUp(newUser);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("User creation failed");
        (error as any).statusCode = 500;
        throw error;
      }

      if (result.role === "User") {
        await this.cartService.createCart(result._id.toString());
      }

      return {
        result: this.returnData(result),
        token: this.authService.generateToken(
          result._id.toString(),
          user.username,
          user.email,
          result.role
        ),
      };
    } catch (err) {
      throw err;
    }
  }

  public async signIn(username: string, email: string, password: string) {
    try {
      const result = await this.userRepository.signIn(username, email);

      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Signin failed. User not found");
        (error as any).statusCode = 404;
        throw error;
      }

      const check = await this.utils.comparePassword(password, result.password);
      if (!check) {
        const error = new Error("Signin failed. Incorrect password");
        (error as any).statusCode = 401;
        throw error;
      }

      return {
        result: this.returnData(result),
        token: this.authService.generateToken(
          result._id.toString(),
          username,
          email,
          result.role
        ),
      };
    } catch (err) {
      throw err;
    }
  }

  public async getUser(userid: string) {
    try {
      const result = await this.userRepository.findUser(userid);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("User not found");
        (error as any).statusCode = 404;
        throw error;
      }
      return this.returnData(result);
    } catch (err) {
      throw err;
    }
  }

  public async getUsers() {
    try {
      const result = await this.userRepository.findUsers();
      if (!result || result.length === 0) {
        const error = new Error("No users found");
        (error as any).statusCode = 404;
        throw error;
      }
      return result.map((user) => this.returnData(user));
    } catch (err) {
      throw err;
    }
  }

  public async deleteUser(userid: string, id: string, role: string) {
    try {
      if (role === "User") {
        if (userid !== id) {
          const error = new Error("User not authorized to delete others");
          (error as any).statusCode = 401;
          throw error;
        }
      }
      const data = await this.userRepository.deleteUser(userid);
      if (!data) {
        const error = new Error("User not found or already deleted");
        (error as any).statusCode = 404;
        throw error;
      }

      await this.cartService.deleteCart(userid);
      return "success";
    } catch (err) {
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
        if (usernameTaken) {
          const error = new Error("Username is already taken");
          (error as any).statusCode = 409;
          throw error;
        }
      }
      if (updateFields.phone) {
        const phoneTaken = await this.userRepository.findPhoneNumber(
          updateFields.phone,
          userid
        );
        if (phoneTaken) {
          const error = new Error("Phone number is already in use");
          (error as any).statusCode = 409;
          throw error;
        }
      }
      const result = await this.userRepository.updateUser(userid, updateFields);
      if (!result) {
        return;
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }

  public async updatePassword() {
    throw new Error("updatePassword not implemented");
  }

  public async updateEmail() {
    throw new Error("updateEmail not implemented");
  }

  private returnData<
    T extends {
      _id: any;
      username: string;
      email: string;
      phone: number;
      address: string;
    }
  >(data: T): UserReturn {
    return {
      id: data._id.toString(),
      username: data.username,
      email: data.email,
      phone: data.phone,
      address: data.address,
    };
  }
}
