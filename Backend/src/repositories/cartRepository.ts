import { Cart, CartDocument, CartProduct } from "../common/types/cartType";
import { CartRepositoryInterface } from "../common/types/classInterfaces";
import CartSchema from "../models/cart";
import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";

@injectable()
export default class CartRepository
  extends BaseRepository
  implements CartRepositoryInterface
{
  constructor() {
    super(CartSchema);
  }
  public async getCart(userid: string) {
    try {
      return await this.model.findOne({ userid });
    } catch (err) {
      throw err;
    }
  }
  public async createCart(userid: string) {
    try {
      const newCart = new CartSchema({ userid, products: [] });
      return await newCart.save();
    } catch (err) {
      throw err;
    }
  }
  public async saveCart(cart: CartDocument) {
    try {
      cart.markModified("products");
      return await cart.save();
    } catch (err) {
      throw err;
    }
  }

  // public async removeProduct(userid: string, productid: string) {
  //   try {
  //     const cart = await CartSchema.findOne({ userid });
  //     if (!cart) return "nocart";
  //     const productIndex = cart.products.findIndex(
  //       (p) => p.productid === productid
  //     );
  //     if (productIndex < 0) return null;
  //     cart.products.splice(productIndex, 1);
  //     const result = await cart.save();
  //     return result;
  //   } catch (err) {
  //     console.log("Failed to remove a product from the cart of a user", err);
  //     throw err;
  //   }
  // }

  // public async removeProducts(userid: string, products: string[]) {
  //   try {
  //     const cart = await CartSchema.findOne({ userid });
  //     if (!cart) return "nocart";
  //     for (let i = cart.products.length - 1; i >= 0; i--) {
  //       if (products.includes(cart.products[i].productid.toString())) {
  //         cart.products.splice(i, 1);
  //       }
  //     }
  //     const result = await cart.save();
  //     return result;
  //   } catch (err) {
  //     console.log(
  //       "Failed to remove multiple products from the cart of a user",
  //       err
  //     );
  //     throw err;
  //   }
  // }

  // public async updateProduct(
  //   userid: string,
  //   productid: string,
  //   quantity: number
  // ) {
  //   try {
  //     const cart = await CartSchema.findOne({ userid });
  //     if (!cart) return "nocart";
  //     const product = cart.products.find((p) => p.productid === productid);
  //     if (!product) return "noproduct";
  //     product.quantity = quantity;
  //     return await cart.save();
  //   } catch (err) {
  //     console.log("Failed to update a product in the cart", err);
  //     throw err;
  //   }
  // }

  // public async totalCartPrice(userid: string) {
  //   try {
  //     const cart = await CartSchema.findOne({ userid });
  //     if (!cart) return undefined;
  //     return cart.products.map((p) => ({
  //       productid: p.productid,
  //       quantity: p.quantity,
  //     }));
  //   } catch (err) {
  //     console.log(
  //       "Failed to calculate total price of products in the cart of a user",
  //       err
  //     );
  //     throw err;
  //   }
  // }

  public async deleteOne(userid: string) {
    try {
      return await CartSchema.findOneAndDelete({ userid });
    } catch (err) {
      throw err;
    }
  }
}
