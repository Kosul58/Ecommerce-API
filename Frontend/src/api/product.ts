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

interface AddImage {
  success: boolean;
  message: string;
  data: string[];
}

interface RemoveImage {
  success: boolean;
  message: string;
}
interface AddImagePayload {
  formData: FormData;
  url: string;
}
export const useAddImages = () => {
  const queryClient = useQueryClient();
  return useMutation<AddImage, Error, AddImagePayload>({
    mutationFn: async ({ formData, url }) => {
      const response = await axios.post(url, formData, {
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
interface RemoveImagePayload {
  imageUrl: string[];
  productid: string;
}

export const useRemoveImages = () => {
  const queryClient = useQueryClient();
  return useMutation<RemoveImage, Error, RemoveImagePayload>({
    mutationFn: async (values) => {
      const response = await axios.delete("/product/image", { data: values });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Products"] });
    },
    retry: false,
  });
};

interface UpdatePayload {
  name: string;
  price: number;
  inventory: number;
  category: string;
  description: string;
  url: string;
  discount?: number;
  discountType?: string;
}
interface UpdateProduct {
  success: boolean;
  message: string;
  data: string;
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<UpdateProduct, Error, UpdatePayload>({
    mutationFn: async (values) => {
      const response = await axios.put(values.url, values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Products"] });
    },
    retry: false,
  });
};
