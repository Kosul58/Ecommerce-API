export interface User {
  userid?: string;
  firstname?: string;
  lastname?: string;
  username: string;
  email: string;
  password: string;
  timestamp?: Date;
  createdAt?: string;
  lastLogin?: string;
  phone?: number;
  address?: string;
  role: UserRole;
  image: string;
}

export enum UserRole {
  ADMIN = "Admin",
  USER = "User",
  SELLER = "Seller",
}

export interface UserReturn {
  id: string;
  username: string;
  email: string;
  phone: number;
  address: string;
  image: string;
  shopname?: string;
}

export interface AddUser {
  // firstname?: string;
  // lastname?: string;
  username: string;
  email: string;
  password: string;
  // phone?: number;
  // address?: string;
}

export interface UpdateUser {
  firstname?: string;
  lastname?: string;
  username?: string;
  phone?: number;
  address?: string;
  email?: string;
  image?: string;
  emailVerified?: boolean;
  image_removed?: string;
}
