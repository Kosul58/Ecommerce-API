import { useQuery } from "@tanstack/react-query";
import axios from "./axios";
import type { ProductListResponse, Seller } from "../types/sellertypes";
export const useProducts = () => {
  return useQuery<ProductListResponse>({
    queryFn: async () => {
      const response = await axios.get("/product/myproduct");
      return response.data;
    },
    queryKey: ["Products"],
    retry: false,
  });
};

export const useSellerData = () => {
  return useQuery<Seller>({
    queryFn: async () => {
      const response = await axios.get("/seller");
      return response.data.data;
    },
    staleTime: 60 * 60 * 1000,
    queryKey: ["seller"],
    retry: false,
  });
};
