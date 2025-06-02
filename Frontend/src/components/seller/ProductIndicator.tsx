import React from "react";

interface Status {
  active: boolean;
}

const ProductIndicator: React.FC<Status> = ({ active }) => {
  return (
    <div className="absolute top-2 right-4 w-[40px] h-[20px] flex justify-center items-center rounded  px-2">
      {active ? (
        <div className="flex items-center gap-1 text-xs">
          <p>Active</p>
          <span className="size-4 rounded-full bg-green-500 inline-block"></span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-xs">
          <p>Hidden</p>
          <span className="w-4 h-4 rounded-full bg-red-500 inline-block"></span>
        </div>
      )}
    </div>
  );
};

export default ProductIndicator;
