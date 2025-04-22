import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema(
  {
    productid: {
      type: String,
      required: true,
    },
    sellerid: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { _id: false } // Disable automatic _id for subdocuments
);

const cartSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
    unique: true,
  },
  products: {
    type: [cartProductSchema],
    required: true,
  },
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
