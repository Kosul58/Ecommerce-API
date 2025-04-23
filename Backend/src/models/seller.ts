import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  shopname: {
    type: String,
    required: true,
  },
  ownername: {
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

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;
