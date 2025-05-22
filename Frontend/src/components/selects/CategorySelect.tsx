import React from "react";
import type { Category } from "../../types/categoryTypes";

interface CategoryProps {
  values: Category[] | undefined;
  selectedId: string;
  onSelect: (categoryId: string) => void;
}

const CategorySelect: React.FC<CategoryProps> = ({
  values,
  selectedId,
  onSelect,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onSelect(value);
  };

  if (!values || values.length === 0) {
    return null;
  }

  return (
    <div>
      <select
        name="Headline"
        id="Headline"
        className="mt-0.5 w-full rounded border-gray-300 shadow-sm sm:text-sm bg-amber-50"
        value={selectedId}
        onChange={handleChange}
      >
        <option value="" className="bg-amber-100 text-red-600">
          Please select
        </option>
        {values.map((value) => (
          <option
            key={value.id}
            value={value.id}
            className="bg-amber-100 text-red-600"
          >
            {value.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategorySelect;
