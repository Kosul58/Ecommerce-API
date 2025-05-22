export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category[];
}
export interface Category {
  id: string;
  name: string;
  description: string;
  parentId: string;
}
