import { signIn, signUp } from "../lib/axios";
import type {
  SignInResponse,
  SignInValues,
  SignUpValues,
} from "../types/sellertypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../api/axios";

export const useSignIn = (url: string) => {
  return useMutation({
    mutationFn: async (values: SignInValues) => {
      const response = await signIn(url).post("", values);
      return response.data;
    },
  });
};

export const useSignUp = (url: string) => {
  return useMutation({
    mutationFn: async (values: SignUpValues) => {
      const response = await signUp(url).post("", values);
      return response.data;
    },
  });
};

export const useUserSignIn = () => {
  const queryClient = useQueryClient();
  return useMutation<SignInResponse, Error, SignInValues>({
    mutationFn: async (values: SignInValues) => {
      const response = await axios.post<SignInResponse>("/user/signin", values);
      console.log(response.data.data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.data);
    },
  });
};
export const useUserSignUp = () => {
  const queryClient = useQueryClient();
  return useMutation<SignInResponse, Error, SignUpValues>({
    mutationFn: async (values: SignUpValues) => {
      const response = await axios.post("/user/signup", values);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.data);
    },
  });
};

export const useAdminSignUp = () => {
  const queryClient = useQueryClient();
  return useMutation<SignInResponse, Error, SignUpValues>({
    mutationFn: async (values: SignUpValues) => {
      const response = await axios.post("/admin/signup", values);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["admin"], data.data.result);
    },
  });
};

export const useAdminSignIn = () => {
  const queryClient = useQueryClient();
  return useMutation<SignInResponse, Error, SignInValues>({
    mutationFn: async (values: SignInValues) => {
      const response = await axios.post<SignInResponse>(
        "/admin/signin",
        values
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["admin"], data.data.result);
    },
  });
};

export const useSellerSignIn = () => {
  const queryClient = useQueryClient();
  return useMutation<SignInResponse, Error, SignInValues>({
    mutationFn: async (values: SignInValues) => {
      const response = await axios.post<SignInResponse>(
        "/seller/signin",
        values
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["seller"], data.data.result);
    },
  });
};

export const useSellerSignUp = () => {
  const queryClient = useQueryClient();
  return useMutation<SignInResponse, Error, SignUpValues>({
    mutationFn: async (values: SignUpValues) => {
      const response = await axios.post("/seller/signup", values);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["seller"], data.data);
    },
  });
};

export const useUserSignOut = () => {
  return useMutation<ApiResponse, Error>({
    mutationFn: async () => {
      const response = await axios.post("/user/signout");
      return response.data;
    },
  });
};

export const useSellerSignOut = () => {
  return useMutation<ApiResponse, Error>({
    mutationFn: async () => {
      const response = await axios.post("/seller/signout");
      return response.data;
    },
  });
};

export const useAdminSignOut = () => {
  return useMutation<ApiResponse, Error>({
    mutationFn: async () => {
      const response = await axios.post("/admin/signout");
      return response.data;
    },
  });
};

interface VerificationValues {
  email: string;
  otp: string;
}
export const useSellerVerification = () => {
  const queryClient = useQueryClient();
  return useMutation<SignInResponse, Error, VerificationValues>({
    mutationFn: async (values: VerificationValues) => {
      const response = await axios.post("/seller/verifyseller", values);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["seller"], data.data.result);
    },
  });
};

export const useUserVerification = () => {
  const queryClient = useQueryClient();
  return useMutation<SignInResponse, Error, VerificationValues>({
    mutationFn: async (values: VerificationValues) => {
      const response = await axios.post("/user/verifyuser", values);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.data.result);
    },
  });
};

export const useAdminVerification = () => {
  const queryClient = useQueryClient();
  return useMutation<SignInResponse, Error, VerificationValues>({
    mutationFn: async (values: VerificationValues) => {
      const response = await axios.post("/admin/verifyadmin", values);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["admin"], data.data.result);
    },
  });
};
interface ResendValues {
  email: string;
}
export const useResendOtp = () => {
  return useMutation<SignInResponse, Error, ResendValues>({
    mutationFn: async (values: ResendValues) => {
      const response = await axios.post("/otp/resend", values);
      return response.data;
    },
  });
};

interface ProductDelete {
  productids: string[];
}

export const useDeleteProducts = () => {
  const queryClient = useQueryClient();
  return useMutation<SignInResponse, Error, ProductDelete>({
    mutationFn: async (values) => {
      const response = await axios.delete("/product/selected", {
        data: values,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Products"] });
    },
  });
};

interface ProductStatus {
  productids: string[];
  status: boolean;
}
export const useChangeVisibility = () => {
  const queryClient = useQueryClient();
  return useMutation<SignInResponse, Error, ProductStatus>({
    mutationFn: async (values) => {
      const response = await axios.put("/product/status", values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Products"] });
    },
  });
};
export interface Product {
  id: string;
  name: string;
  sellerid: string;
  price: number;
  description: string;
  category: string;
  inventory: number;
  timestamp: string;
  images: string[];
  discount?: number;
}
interface ProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
}

export const useAllProducts = () => {
  return useQuery<Product[], Error>({
    queryKey: ["all-products"],
    queryFn: async () => {
      const response = await axios.get<ProductsResponse>("/product");
      return response.data.data;
    },
  });
};

export interface UserData {
  id: string;
  username: string;
  email: string;
  image?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  address?: string;
}

interface UserDataResponse {
  success: boolean;
  message: string;
  data: UserData;
}

export const useUserData = () => {
  return useQuery<UserData, Error>({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await axios.get<UserDataResponse>("/user");
      if (!response.data || !response.data.data) {
        throw new Error("User data not found in response.");
      }
      return response.data.data;
    },
  });
};

export interface EnrichedCartProduct {
  productid: string;
  name: string;
  price: number;
  discount: number;
  quantity: number;
  sellerid: string;
  shopname: string;
}

export interface CartData {
  products: EnrichedCartProduct[];
}

export interface CartDataResponse {
  success: boolean;
  message: string;
  data: CartData;
}

export const useCartData = () => {
  return useQuery<CartData, Error>({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await axios.get<CartDataResponse>("/cart/user");
      return response.data.data;
    },
  });
};

interface AddCartValues {
  productid: string;
  quantity: number;
}
interface ApiResponse {
  success: boolean;
  message: string;
  data: string;
}
export const useAddCart = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse, Error, AddCartValues>({
    mutationFn: async (values: AddCartValues) => {
      const response = await axios.post<ApiResponse>("/cart", values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

interface CartRemoveValues {
  products: string[];
}
interface ApiResponse {
  success: boolean;
  message: string;
  data: string;
}
export const useRemoveCart = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse, Error, CartRemoveValues>({
    mutationFn: async ({ products }) => {
      const response = await axios.delete<ApiResponse>("/cart", {
        data: { products },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useCartUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse, Error, AddCartValues>({
    mutationFn: async (cartData) => {
      const response = await axios.put("/cart", cartData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useUserUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse, Error, FormData>({
    mutationFn: async (values) => {
      const response = await axios.put("/user", values, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

interface ChangePassword {
  oldpassword: string;
  newpassword: string;
}

export const useChangeUserPassword = () => {
  return useMutation<ApiResponse, Error, ChangePassword>({
    mutationFn: async (values) => {
      const response = await axios.put("/user/changepassword", values);
      return response.data;
    },
  });
};

interface DeleteUser {
  userid: string;
}
export const useDeleteuser = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse, Error, DeleteUser>({
    mutationFn: async (values) => {
      const response = await axios.delete(`/user/${values.userid}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

interface CalculationResponse {
  success: string;
  message: string;
  data: {
    subtotal: number;
    tax: number;
    shippingfee: number;
  };
}

interface CartTotal {
  products: string[];
}

export const useCalcTotal = () => {
  const queryClient = useQueryClient();
  return useMutation<CalculationResponse, Error, CartTotal>({
    mutationFn: async (values) => {
      const response = await axios.post(`/cart/total`, values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartTotal"] });
    },
  });
};

export interface Admin {
  id: string;
  username: string;
  email: string;
  image: string;
  firstname: string;
  lastname: string;
  phone: string;
  address: string;
}

export const useAdminData = () => {
  return useQuery<Admin>({
    queryFn: async () => {
      const response = await axios.get("/admin");
      return response.data.data;
    },
    staleTime: 60 * 60 * 1000,
    queryKey: ["admin"],
    retry: false,
  });
};
