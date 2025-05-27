import mongoose from "mongoose";
import { UserRole } from "../common/types/userType";
import { boolean, required, string } from "joi";

const sellerSchema = new mongoose.Schema({
  shopname: {
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
  image: {
    type: String,
    required: true,
    default: "",
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  emailVerified: {
    type: Boolean,
    default: false,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: UserRole.SELLER,
  },
});

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;
