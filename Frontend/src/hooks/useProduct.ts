import { addProduct, sellerProducts } from "../lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Product } from "../types/sellertypes";

export const useMyProducts = () => {
  return useQuery<Product[], Error>({
    queryKey: ["my-products"],
    queryFn: async () => {
      const response = await sellerProducts.get("");
      return response.data.data as Product[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAddProduct = () => {
  return useMutation({
    mutationFn: async (values: string) => {
      const response = await addProduct.post(values);
      return response.data;
    },
  });
};
