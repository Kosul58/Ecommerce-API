import { useQuery } from "@tanstack/react-query";
import axios from "./axios";
import type { CategoryResponse } from "../types/categoryTypes";
export const useCategoryList = () =>
  //   options?: Partial<UseQueryOptions<CategoryListResponse>>
  {
    return useQuery<CategoryResponse>({
      queryFn: async () => {
        const response = await axios.get("/category");
        return response.data;
      },
      queryKey: ["Categories"],
      retry: 2,
      retryDelay: 2000,
      //   ...options,
    });
  };
