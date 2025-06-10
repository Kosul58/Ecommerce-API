import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../api/axios";

interface OrderCreationResponse {
  success: string;
  message: string;
  data: string;
}
interface MultiOrderPayload {
  address: string;
  products: string[];
  paymentMethod: string;
  paymentStatus: boolean;
}

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
  productTrack: OrderTrack[];
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
  orderTrack: OrderTrack[];
  address: string;
  timestamp: string;
  deliverytime?: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order[];
}

export const useUserOrders = () => {
  return useQuery<Order[], Error>({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await axios.get("/order/user");
      return response.data.data;
    },
  });
};

export interface OrderTrack {
  status: string;
  time: string;
}
export interface SellerOrder {
  orderid: string;
  userid: string;
  productid: string;
  name: string;
  price: number;
  quantity: number;
  productstatus: string;
  orderstatus: string;
  paymentStatus: boolean;
  paymentMethod: string;
  orderTrack: OrderTrack[];
  productTrack: OrderTrack[];
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

export interface ProductStatusSeller {
  productid: string;
  orderid: string;
  status: string;
}

export interface ProductStatusResponse {
  success: string;
  message: string;
  data: string;
}

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<ProductStatusResponse, Error, ProductStatusSeller>({
    mutationFn: async (payload) => {
      const response = await axios.put("/order/orderdata", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellerOrders"] });
    },
    onError: (error) => {
      console.error("Failed to update order status:", error.message);
    },
  });
};

export interface CancelSingleOrder {
  orderid: string;
  productids: string[];
}

export interface CancelWholeOrder {
  orderid: string;
}
export const useCancelSelectedOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<ProductStatusResponse, Error, CancelSingleOrder>({
    mutationFn: async (payload) => {
      const response = await axios.delete("/order/cancelSelected", {
        data: payload,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useCancelWholeOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<ProductStatusResponse, Error, CancelWholeOrder>({
    mutationFn: async (payload) => {
      const response = await axios.delete("/order/cancelWhole", {
        data: payload,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
