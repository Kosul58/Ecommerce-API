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
        className="mt-0.5 w-[80%] min-w-[180px] p-4 rounded border-gray-300 shadow-sm sm:text-sm bg-white/70 cursor-pointer"
        value={selectedId}
        onChange={handleChange}
      >
        <option value="" className="bg-white/70 text-gray-500">
          Please select
        </option>
        {values.map((value) => (
          <option
            key={value.id}
            value={value.id}
            className="bg-white/70 text-gray-800"
          >
            {value.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategorySelect;
