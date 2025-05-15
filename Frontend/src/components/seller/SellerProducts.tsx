import React, { useState, useEffect } from "react";

interface ProductProps {
  token: string;
}

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

const SellerProducts: React.FC<ProductProps> = ({ token }) => {
  const [productData, setProductData] = useState<Product[] | null>(null);

  const getSellerProducts = async (): Promise<Product[] | null> => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/product/myproduct",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
  }, [token]);

  return (
    <section className="w-[95%] h-[95%] flex flex-col  items-center gap-4 overflow-y-auto mt-2 ">
      {productData === null ? (
        <p>Loading...</p>
      ) : productData.length === 0 ? (
        <p>No products found.</p>
      ) : (
        productData.map((product) => (
          <div
            key={product.id}
            className="p-4 w-[80%] h-[auto] flex flex-row items-center justify-evenly bg-white shadow-lg rounded-lg m-4 "
          >
            <div>
              <h2 className="text-lg font-bold">{product.name}</h2>
              <p>Category: {product.category}</p>
              <p>{product.description}</p>
              <p>Inventory: {product.inventory}</p>
              <p>Price: Rs.{product.price}</p>
            </div>

            {product.images.length > 0 && (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-[70%] h-32 object-cover rounded"
              />
            )}
          </div>
        ))
      )}
    </section>
  );
};

export default SellerProducts;
