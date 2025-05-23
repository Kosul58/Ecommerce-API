import React, { useState } from "react";
import { useCategoryList } from "../../api/cateogry";
import type { Category } from "../../types/categoryTypes";
import CategorySelect from "../selects/CategorySelect";
interface CategoryProps {
  onCategorySelect: (categoryName: string) => void;
}

const ProductCategory: React.FC<CategoryProps> = ({ onCategorySelect }) => {
  const { data: categoryList, isLoading } = useCategoryList();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  if (isLoading) return <p>Loading Data...</p>;
  if (!categoryList?.data) return <p>No Categories Found</p>;

  const handleCategorySelect = (level: number, selectedId: string) => {
    if (selectedId === "") {
      setSelectedCategories([...selectedCategories.slice(0, level)]);
      return;
    }

    const newSelected = [...selectedCategories.slice(0, level), selectedId];
    setSelectedCategories(newSelected);

    const hasChildren = categoryList.data.some(
      (cat: Category) => cat.parentId === selectedId
    );

    if (!hasChildren) {
      const category = categoryList.data.find((c) => c.id === selectedId)?.name;
      if (category) onCategorySelect(category);
    }
  };

  const getCategoriesAtLevel = (level: number): Category[] => {
    if (level === 0) {
      return categoryList.data.filter((cat) => cat.parentId === "");
    }
    const parentId = selectedCategories[level - 1];
    return categoryList.data.filter((cat) => cat.parentId === parentId);
  };

  const dropdowns = [];
  for (let i = 0; i <= selectedCategories.length; i++) {
    const options = getCategoriesAtLevel(i);
    if (options.length === 0) break;

    dropdowns.push(
      <CategorySelect
        key={i}
        values={options}
        selectedId={selectedCategories[i] || ""}
        onSelect={(id) => handleCategorySelect(i, id)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-md justify-center items-center">
      {dropdowns}
    </div>
  );
};

export default ProductCategory;
