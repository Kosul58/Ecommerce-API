import React from "react";
import { type OrderTrack, type SellerOrder } from "../../hooks/orders";
import { IoClose } from "react-icons/io5";

interface TrackOrderModalProps {
  order: SellerOrder | null;
  onClose: () => void;
}

const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  order,
  onClose,
}) => {
  if (!order) return null;

  const sortedOrderTrack = [...order.orderTrack].sort((a, b) => {
    return new Date(a.time).getTime() - new Date(b.time).getTime();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-lg overflow-auto rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="hidden sm:block absolute right-4 top-4 text-gray-500 hover:text-gray-800 cursor-pointer"
          title="Close"
        >
          <IoClose className="h-6 w-6" />
        </button>

        <h2 className="mb-4 text-2xl max-sm:text-sm font-bold text-gray-800">
          Order Tracking: {order.orderid}
        </h2>
        <p className="mb-6 text-gray-600">Product: {order.name}</p>

        {sortedOrderTrack.length > 0 ? (
          <ol className="relative border-s border-gray-200 dark:border-gray-700">
            {sortedOrderTrack.map((track: OrderTrack, index: number) => (
              <li className="mb-10 ms-4" key={index}>
                <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-400 dark:border-gray-900 dark:bg-gray-700"></div>
                <div>
                  <time className="mb-1 text-sm font-normal leading-none text-gray-500 dark:text-gray-500">
                    {new Date(track.time).toLocaleString()}
                  </time>
                  <h3 className="mt-1 text-lg font-semibold text-gray-500">
                    {track.status || "Status N/A"}
                  </h3>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-600">
            No tracking information available yet.
          </p>
        )}
        <div className="mt-6 flex justify-end sm:hidden">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-300 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderModal;
