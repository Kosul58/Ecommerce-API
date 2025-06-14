import mongoose from "mongoose";
import { UserRole } from "../common/types/userType";
import { required } from "joi";

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    // required: true,
  },
  lastname: {
    type: String,
    // required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    // required: true,
  },
  address: {
    type: String,
    // required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  image: {
    type: String,
    required: true,
    default: "",
  },
  emailVerified: {
    type: Boolean,
    default: false,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: UserRole.USER,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
