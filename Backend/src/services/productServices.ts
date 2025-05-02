import { injectable, inject } from "tsyringe";
import {
  AddProduct,
  Product,
  ProductReturn,
  UpdateProdcut,
} from "../common/types/productType.js";
import ProductRepository from "../repository/productRepository";
import CategoryService from "./categoryServices.js";
import FactoryService from "./factoryService.js";
@injectable()
export default class ProductServices {
  private productRepository: ProductRepository;
  constructor(
    @inject(FactoryService) private factoryService: FactoryService,
    @inject(CategoryService) private categoryService: CategoryService
  ) {
    this.productRepository = this.factoryService.getRepository(
      "PRODUCT"
    ) as ProductRepository;
  }
  private async categoryManager(name: string) {
    if (name) {
      const newCategory = { name, description: "", parentId: "" };
      await this.categoryService.createCategory(newCategory);
    }
  }
  private async createProduct(
    productData: AddProduct,
    sellerid: string
  ): Promise<Product> {
    const { name, price, inventory, description, category } = productData;
    if (category) {
      await this.categoryManager(category);
    }
    return {
      name,
      sellerid,
      price: Number(price),
      inventory: Number(inventory),
      description,
      category,
    };
  }
  private returnProductData<
    T extends {
      _id: any;
      name: string;
      sellerid: string;
      price: number;
      description: string;
      category: string;
      inventory: number;
    }
  >(product: T): ProductReturn {
    return {
      id: product._id.toString(),
      name: product.name,
      sellerid: product.sellerid,
      price: product.price,
      description: product.description,
      category: product.category,
      inventory: product.inventory,
    };
  }
  public async getProducts() {
    try {
      const products = await this.productRepository.findAll();
      if (!products || products.length === 0) {
        const error = new Error("No Products found");
        (error as any).statusCode = 404;
        throw error;
      }
      return products.map((p: any) => this.returnProductData(p));
    } catch (err) {
      throw err;
    }
  }

  //to get the products of a seller
  public async getSellerProducts(id: string) {
    try {
      const products = await this.productRepository.getSellerProducts(id);
      if (!products || products.length === 0) {
        // const error = new Error("No Products found");
        // (error as any).statusCode = 404;
        // throw error;
        return null;
      }
      return products.map((p: any) => this.returnProductData(p));
    } catch (err) {
      throw err;
    }
  }

  public async getHiddenProducts(id: string) {
    try {
      const products = await this.getSellerProducts(id);
      if (!products || products.length === 0) {
        // const error = new Error("No Products found");
        // (error as any).statusCode = 404;
        // throw error;
        return null;
      }
      return products
        .filter((p: any) => p.active === false)
        .map((p: any) => this.returnProductData(p));
    } catch (err) {
      throw err;
    }
  }

  public async getProductById(productid: string) {
    try {
      const product = await this.productRepository.findOne(productid);
      if (!product) {
        const error = new Error("No Products found");
        (error as any).statusCode = 404;
        throw error;
      }
      return this.returnProductData(product);
    } catch (err) {
      throw err;
    }
  }

  public async addProduct(product: AddProduct, sellerid: string) {
    try {
      const check = await this.productRepository.checkProduct({
        ...product,
        sellerid,
      });

      if (check && Object.keys(check).length > 0) {
        const error = new Error("Product already exits");
        (error as any).statusCode = 409;
        throw error;
      }

      const newProduct: Product = await this.createProduct(product, sellerid);
      const result = await this.productRepository.addProduct(newProduct);
      if (!result) {
        const error = new Error("Product addition failed");
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }

  public async addProducts(products: AddProduct[], sellerid: string) {
    try {
      const productInputs: Product[] = products.map((p) => ({
        ...p,
        sellerid,
      }));

      const existingProducts = await this.productRepository.checkProducts(
        productInputs
      );
      const existingSet = new Set(
        existingProducts.map((p: any) => `${p.name}-${p.price}-${p.sellerid}`)
      );

      const filteredProducts = productInputs.filter(
        (p) => !existingSet.has(`${p.name}-${p.price}-${p.sellerid}`)
      );

      let productList: Product[] = [];
      for (const product of filteredProducts) {
        const newProduct = await this.createProduct(product, sellerid);
        productList.push(newProduct);
      }
      if (productList.length === 0) {
        const error = new Error("Products already exist");
        (error as any).statusCode = 409;
        throw error;
      }
      const result = await this.productRepository.addProducts(productList);
      if (!result || result.length === 0) {
        const error = new Error("Product addition failed");
        (error as any).statusCode = 500;
        throw error;
      }
      productList = [];
      return "success";
    } catch (err) {
      throw err;
    }
  }

  public async updateProduct(
    productid: string,
    sellerid: string,
    update: UpdateProdcut
  ) {
    try {
      const updateFields = Object.fromEntries(
        Object.entries(update).filter(([_, value]) => value !== undefined)
      ) as Partial<UpdateProdcut>;
      const prodcut = await this.getProductById(productid);
      if (!prodcut || prodcut.sellerid !== sellerid) {
        const error = new Error("No product found");
        (error as any).statusCode = 404;
        throw error;
      }
      if (update.category) {
        await this.categoryManager(update.category);
      }
      const result = await this.productRepository.updateOne(
        productid,
        updateFields
      );
      if (!result) {
        const error = new Error("Product update failed");
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }

  public async deleteProduct(productid: string, sellerid: string) {
    try {
      const prodcut = await this.getProductById(productid);
      if (!prodcut || prodcut.sellerid !== sellerid) {
        // const error = new Error("No product found");
        // (error as any).statusCode = 404;
        // throw error;
        return null;
      }
      const result = await this.productRepository.deleteOne(productid);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Product delete failed");
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }

  public async deleteProducts(id: string) {
    try {
      const products = await this.getSellerProducts(id);
      if (!products || products.length === 0) {
        // const error = new Error("No products found to delete");
        // (error as any).statusCode = 404;
        // throw error;
        return null;
      }
      const deleteIds = products.map((p: any) => p.id);
      const result = await this.productRepository.deleteProducts(deleteIds);
      if (!result || result.deletedCount === 0) {
        {
          const error = new Error("Products deletion failed");
          (error as any).statusCode = 500;
          throw error;
        }
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }

  public async hideProducts(productids: string[]) {
    try {
      const result = await this.productRepository.hideProducts(productids);
      if (!result || result.modifiedCount === 0) {
        {
          const error = new Error("Product hide failed");
          (error as any).statusCode = 500;
          throw error;
        }
      }
      return "success";
    } catch (err) {}
  }
  public async showProducts(productids: string[]) {
    try {
      const result = await this.productRepository.hideProducts(productids);
      if (!result || result.modifiedCount === 0) {
        {
          const error = new Error("Product visiblity change failed");
          (error as any).statusCode = 500;
          throw error;
        }
      }
      return "success";
    } catch (err) {}
  }

  public async hideSellerProducts(sellerid: string) {
    try {
      const products = await this.getSellerProducts(sellerid);
      if (!products || products.length === 0) {
        // const error = new Error("No products found to hide");
        // (error as any).statusCode = 404;
        // throw error;
        return null;
      }
      const deleteIds = products.map((p: any) => p.id);
      const result = await this.productRepository.hideProducts(deleteIds);
      if (!result || result.modifiedCount === 0) {
        {
          const error = new Error("Product hide failed");
          (error as any).statusCode = 500;
          throw error;
        }
      }
      return "success";
    } catch (err) {}
  }

  public async modifyInventory(
    id: string,
    quantity: number,
    modification: "increase" | "decrease"
  ) {
    try {
      const product = await this.productRepository.findOne(id);
      if (!product) {
        const error = new Error("No product found");
        (error as any).statusCode = 404;
        throw error;
      }
      if (modification === "decrease" && product.inventory < quantity) {
        const error = new Error("Insufficient inventory");
        (error as any).statusCode = 404;
        throw error;
      }
      let newInventory = product.inventory ?? 0;
      if (modification === "increase") {
        newInventory += quantity;
      } else {
        newInventory -= quantity;
      }
      const result = await this.productRepository.manageInventory(
        id,
        newInventory
      );
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Product inventory modification failed");
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }
}
