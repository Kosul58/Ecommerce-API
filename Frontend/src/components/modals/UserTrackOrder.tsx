import React from "react";
import {
  type Order,
  type OrderTrack,
  type OrderItem,
} from "../../hooks/orders";
import { IoClose } from "react-icons/io5";

interface TrackOrderModalProps {
  order: Order | null;
  onClose: () => void;
}

const UserTrackOrder: React.FC<TrackOrderModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const sortedOrderTrack = [...(order.orderTrack || [])].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  const getSortedProductTrack = (item: OrderItem) =>
    [...(item.productTrack || [])].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-lg overflow-auto rounded-lg bg-white p-6 shadow-xl max-h-[90vh]">
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

        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Overall Order Status
        </h3>
        {sortedOrderTrack.length > 0 ? (
          <ol className="relative border-s border-gray-200 mb-6">
            {sortedOrderTrack.map((track: OrderTrack, index: number) => (
              <li className="mb-6 ms-4" key={index}>
                <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-400"></div>
                <div>
                  <time className="mb-1 text-sm font-normal text-gray-500">
                    {new Date(track.time).toLocaleString()}
                  </time>
                  <h4 className="mt-1 text-md font-medium text-gray-600">
                    {track.status || "Status N/A"}
                  </h4>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-600 mb-6">No overall tracking available.</p>
        )}

        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Product Statuses
        </h3>
        {order.items.map((item: OrderItem) => (
          <div key={item.productid} className="mb-6">
            <p className="font-semibold text-gray-800 mb-1">{item.name}</p>
            {item.productTrack && item.productTrack.length > 0 ? (
              <ol className="relative border-s border-gray-200 ml-2">
                {getSortedProductTrack(item).map((track, idx) => (
                  <li className="mb-4 ms-4" key={idx}>
                    <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-300"></div>
                    <div>
                      <time className="mb-1 text-sm text-gray-500">
                        {new Date(track.time).toLocaleString()}
                      </time>
                      <h4 className="mt-1 text-md font-medium text-gray-600">
                        {track.status || "Status N/A"}
                      </h4>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-gray-500 ml-4">
                No tracking info available for this item.
              </p>
            )}
          </div>
        ))}
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

export default UserTrackOrder;
