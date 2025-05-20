import { CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Status helper functions
const getStatusColor = (status) => {
  const colors = {
    created: "bg-blue-100 text-blue-800",
    processing: "bg-yellow-100 text-yellow-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const getStatusName = (status) => {
  const names = {
    created: "تم الإنشاء",
    processing: "قيد التجهيز",
    shipped: "تم الشحن",
    delivered: "تم التسليم",
    canceled: "ملغي",
  };
  return names[status] || "غير معروف";
};

  const getStatusIcon = (status) => {
    switch (status) {
      case "created":
        return <Clock size={20} className="mr-1" />;
      case "processing":
        return <Package size={20} className="mr-1" />;
      case "shipped":
        return <Truck size={20} className="mr-1" />;
      case "delivered":
        return <CheckCircle size={20} className="mr-1" />;
      case "canceled":
        return <XCircle size={20} className="mr-1" />;
      default:
        return <Package size={20} className="mr-1" />;
    }
  };

const StatusDropdown = ({ order, onStatusChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleStatusChange = (newStatus) => {
    onStatusChange(newStatus);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center relative" ref={dropdownRef}>
      <div
        className={`px-3 py-1 rounded-lg gap-1 flex items-center cursor-pointer ${getStatusColor(
          order.status
        )}`}
        dir="rtl"
        onClick={() => setIsEditing(!isEditing)}
      >
        <p>{getStatusName(order.status)}</p>
        <p>{getStatusIcon(order.status)}</p>
      </div>

      {isEditing && (
        <div className="absolute top-9 right-0 z-50 bg-white shadow-lg rounded-lg p-2 w-36">
          {["created", "processing", "shipped", "delivered", "canceled"].map(
            (status) => (
              <div
                key={status}
                className={`p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-1 ${
                  order.status === status ? "bg-gray-100" : ""
                }`}
                onClick={() => handleStatusChange(status)}
                dir="rtl"
              >
                <span>{getStatusName(status)}</span>
                <span>{getStatusIcon(status)}</span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
