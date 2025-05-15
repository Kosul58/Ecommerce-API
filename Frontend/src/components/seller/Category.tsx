import React, { useState } from "react";

export const categoryData: CategoryTree = {
  electronics: {
    phone: {
      poco: "cat001",
      xiaomi: "cat002",
    },
    laptop: {
      lenovo: "cat003",
      asus: "cat004",
    },
  },
  fashion: {
    men: {
      pants: "cat005",
      tshirts: "cat006",
    },
    women: {
      lotion: {
        sunsilk: "cat007",
        ordinary: "cat008",
      },
    },
  },
};

type CategoryTree = {
  [key: string]: string | CategoryTree;
};

const getSubcategories = (path: string[], data: CategoryTree): string[] => {
  let current: string | CategoryTree = data;

  for (const key of path) {
    if (typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return [];
    }
  }

  return typeof current === "object" ? Object.keys(current) : [];
};

interface CategorySelectProps {
  data: typeof categoryData;
  onSelect: (categoryId: string) => void;
}

const CategorySelect: React.FC<CategorySelectProps> = ({ data, onSelect }) => {
  const [path, setPath] = useState<string[]>([]);

  const getCurrentLevel = (
    currentPath: string[]
  ): string | CategoryTree | null => {
    let level: string | CategoryTree = data;
    for (const key of currentPath) {
      if (typeof level === "object" && key in level) {
        level = level[key];
      } else {
        return null;
      }
    }
    return level;
  };

  const handleChange = (levelIndex: number, value: string) => {
    if (value === "") {
      const newPath = path.slice(0, levelIndex);
      setPath(newPath);
      onSelect("");
    } else {
      const newPath = [...path.slice(0, levelIndex), value];
      setPath(newPath);

      const next = getCurrentLevel(newPath);
      if (typeof next === "string") {
        onSelect(next);
      } else {
        onSelect("");
      }
    }
  };

  const levelsToRender = [...Array(path.length + 1).keys()];

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {levelsToRender.map((_, index) => {
        const options = getSubcategories(path.slice(0, index), data);
        if (options.length === 0) return null;

        return (
          <select
            key={index}
            value={path[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            className="p-2 bg-amber-50 border rounded"
          >
            <option value="">Select...</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      })}
    </div>
  );
};

export default CategorySelect;
