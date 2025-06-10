import mongoose from "mongoose";

const discountSchema = new mongoose.Schema({
  discountName: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const Discount = mongoose.model("Discount", discountSchema);

export default Discount;
