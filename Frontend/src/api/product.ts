import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axios";
import type { ProductListResponse } from "../types/sellertypes";
export const useAddProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<ProductListResponse, Error, FormData>({
    mutationFn: async (formData) => {
      const response = await axios.post("/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Products"] });
    },
    retry: false,
  });
};
