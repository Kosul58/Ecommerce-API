import { sellerProducts } from "../lib/axios";
import { useQuery } from "@tanstack/react-query";
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
