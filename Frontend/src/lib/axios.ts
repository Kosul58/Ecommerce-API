import axios from "axios";

export const sellerProducts = axios.create({
  baseURL: "http://localhost:3000/api/product/myproduct",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const signIn = (url: string) =>
  axios.create({
    baseURL: url,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

export const signUp = (url: string) =>
  axios.create({
    baseURL: url,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

export const addProduct = axios.create({
  baseURL: "http://localhost:3000/api/product",
  withCredentials: true,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// export const sellerSignUp = signIn("http://localhost:3000/api/seller/signup");
// export const userSignUp = signIn("http://localhost:3000/api/user/signup");
// export const adminSignUp = signUp("http://localhost:3000/api/admin/signup");
// export const sellerSignIn = signIn("http://localhost:3000/api/seller/signin");
// export const userSignIn = signUp("http://localhost:3000/api/user/signin");
// export const adminSignIn = signUp("http://localhost:3000/api/admin/signin");
