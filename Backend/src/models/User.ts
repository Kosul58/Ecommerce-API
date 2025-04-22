import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
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
    default: 99,
  },
  address: {
    type: String,
    default: "",
  },
  createdAt: {
    type: String,
    required: true,
  },
  lastLogin: {
    type: String,
  },
  role: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
