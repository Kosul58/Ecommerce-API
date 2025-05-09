export interface User {
  userid?: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  timestamp?: Date;
  createdAt?: string;
  lastLogin?: string;
  phone: number;
  address: string;
  role: UserRole;
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
}

export interface AddUser {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  phone: number;
  address: string;
}

export interface UpdateUser {
  firstname?: string;
  lastname?: string;
  username?: string;
  phone?: number;
  address?: string;
}
