import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../api/axios";

interface DiscountCreationResponse {
  success: string;
  message: string;
  data: string;
}
interface DiscountPayload {
  name: string;
}

export const useCreateDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation<DiscountCreationResponse, Error, DiscountPayload>({
    mutationFn: async (payload: DiscountPayload) => {
      const response = await axios.post("/discount/", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
  });
};

export interface Discounts {
  id: string;
  discountName: string;
  timestamp: string;
}

export interface DiscountDelete {
  ids: string[];
}

export interface DiscountResponse {
  success: boolean;
  message: string;
  data: Discounts[];
}

export const useDiscountTypes = () => {
  return useQuery<Discounts[], Error>({
    queryKey: ["discounts"],
    queryFn: async () => {
      const response = await axios.get("/discount");
      return response.data.data;
    },
  });
};

export const useDeleteDiscounts = () => {
  const queryClient = useQueryClient();
  return useMutation<DiscountCreationResponse, Error, DiscountDelete>({
    mutationFn: async (payload) => {
      const response = await axios.delete("/discount", { data: payload });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
  });
};
