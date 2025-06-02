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
      queryClient.setQueryData(["admin"], data);
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
      queryClient.setQueryData(["admin"], data);
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
      queryClient.setQueryData(["seller"], data.data);
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
    staleTime: 5 * 60 * 1000,
  });
};
