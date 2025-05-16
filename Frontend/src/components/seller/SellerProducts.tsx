import React, { useState, useEffect } from "react";
import type { Seller } from "./SellerDashboard";
interface Product {
  id: string;
  name: string;
  sellerid: string;
  price: number;
  description: string;
  category: string;
  inventory: string;
  images: string[];
}

interface SellerData {
  seller: Seller;
}

const SellerProducts: React.FC<SellerData> = ({ seller }) => {
  const [productData, setProductData] = useState<Product[] | null>(null);
  console.log(seller);
  const getSellerProducts = async (): Promise<Product[] | null> => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/product/myproduct",
        {
          method: "GET",
          credentials: "include",
        }
      );
      const result = await response.json();
      console.log(result);
      return result.data;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getSellerProducts();
      setProductData(data);
    };
    fetchData();
  }, []);

  return (
    <section className="w-[95%] h-[95%] flex flex-wrap justify-center items-center gap-2 overflow-y-auto scrollbar-cool ">
      {productData === null ? (
        <p>Loading...</p>
      ) : productData.length === 0 ? (
        <p>No products found.</p>
      ) : (
        productData.map((product) => (
          <div
            key={product.id}
            className="p-4 w-[45%] h-[auto] flex flex-row items-center justify-evenly bg-white rounded-lg m-2 shadow-2xl hover:scale-101 cursor-pointer gap-2"
          >
            <div className="size-[30%]">
              <h2 className="text-lg font-bold max-w-[100px]">
                <span className="block">Name:</span>
                <span className="block truncate">{product.name}</span>
              </h2>
              <p className="max-w-[150px]">
                <span className="block">Category:</span>
                <span className="block truncate">{product.category}</span>
              </p>
              <p className="max-w-[150px]">
                <span className="block">Description:</span>
                <span className="block truncate">{product.description}</span>
              </p>
              <p>Inventory: {product.inventory}</p>
              <p>Price: Rs.{product.price}</p>
            </div>
            {product.images.length > 0 && (
              <img
                src={product.images[0]}
                alt={product.name}
                className="size-[70%] object-cover rounded-md"
              />
            )}
          </div>
        ))
      )}
    </section>
  );
};

export default SellerProducts;
