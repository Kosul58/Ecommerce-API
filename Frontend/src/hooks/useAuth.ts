import { signIn, signUp } from "../lib/axios";
import type { SignInValues, SignUpValues } from "../types/sellertypes";
import { useMutation } from "@tanstack/react-query";

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
