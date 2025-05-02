import { required } from "joi";
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: "",
    reuired: true,
  },
  parentId: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
