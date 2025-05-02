//types required for fetching category
export interface Category {
  categoryId?: string;
  name: string;
  description?: string;
  parentId: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  timestamp?: Date;
}

//type required to update category
export interface UpdateCategory {
  name?: string;
  description?: string;
  parentId?: string;
}

//type required to add a category
export interface CategoryOption {
  name: string;
  description: string;
  parentId?: string;
}

// to parse cli commands
export interface CategoryParser {
  categoryId?: string;
  name?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}
