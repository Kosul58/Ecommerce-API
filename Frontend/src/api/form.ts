import type {
  SignInResponse,
  SignInValues,
  SignUpValues,
} from "../types/sellertypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "./axios";

export const useUserSignIn = () => {
  const queryClient = useQueryClient();
  return useMutation<SignInResponse, Error, SignInValues>({
    mutationFn: async (values: SignInValues) => {
      const response = await axios.post<SignInResponse>("/user/signin", values);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
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
      queryClient.setQueryData(["user"], data);
    },
  });
};
