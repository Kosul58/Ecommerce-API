import { boolean, required } from "joi";
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sellerid: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  inventory: {
    type: Number,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
    required: true,
  },
  images: {
    type: Array,
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
