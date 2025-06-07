import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../api/axios";

interface OrderCreationResponse {
  success: string;
  message: string;
  data: string;
}

// interface SingleOrderPayload {
//   address: string;
//   productid: string;
//   paymentMethod: string;
//   paymentStatus: boolean;
// }

interface MultiOrderPayload {
  address: string;
  products: string[];
  paymentMethod: string;
  paymentStatus: boolean;
}

// export const useCreateOrder = () => {
//   const queryClient = useQueryClient();
//   return useMutation<OrderCreationResponse, Error, SingleOrderPayload>({
//     mutationFn: async (payload: SingleOrderPayload) => {
//       const response = await axios.post("/order/", payload);
//       return response.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["orders"] });
//     },
//   });
// };

export const useCreateOrders = () => {
  const queryClient = useQueryClient();
  return useMutation<OrderCreationResponse, Error, MultiOrderPayload>({
    mutationFn: async (payload: MultiOrderPayload) => {
      const response = await axios.post("/order/createOrders", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export interface OrderItem {
  productid: string;
  sellerid: string;
  name: string;
  price: number;
  quantity: number;
  active: boolean;
  status: string;
}

export interface Order {
  orderid: string;
  userid: string;
  items: OrderItem[];
  type: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: boolean;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order[];
}

export const useUserOrders = () => {
  return useQuery<OrderResponse, Error>({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await axios.get("/order/user");
      return response.data;
    },
  });
};

export interface SellerOrder {
  orderid: string;
  userid: string;
  productid: string;
  name: string;
  price: number;
  quantity: number;
  status: string;
  paymentStatus: boolean;
  paymentMethod: string;
}

interface SellerOrdersResponse {
  success: boolean;
  message: string;
  data: SellerOrder[];
}

export const useSellerOrders = () => {
  return useQuery<SellerOrdersResponse, Error>({
    queryKey: ["sellerOrders"],
    queryFn: async () => {
      const response = await axios.get("/order");
      return response.data;
    },
  });
};
