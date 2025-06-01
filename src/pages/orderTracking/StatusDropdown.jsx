import {
  CheckCircle,
  Clock,
  Edit,
  Package,
  Pencil,
  Truck,
  XCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { fetcher } from "../../utils/api";
import { showNotification } from "../../utils/Notification";

// Status helper functions
const getStatusColor = (status) => {
  const colors = {
    created: "bg-blue-100 text-blue-800",
    accepted: "bg-yellow-100 text-yellow-800",
    shipping: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const getStatusName = (status) => {
  const names = {
    created: "تم الإنشاء",
    accepted: "قيد التجهيز",
    shipping: "يتم الشحن",
    delivered: "تم التسليم",
    cancelled: "ملغي",
  };
  return names[status] || "غير معروف";
};

const getStatusIcon = (status) => {
  switch (status) {
    case "created":
      return <Clock size={20} className="mr-1" />;
    case "accepted":
      return <Package size={20} className="mr-1" />;
    case "shipping":
      return <Truck size={20} className="mr-1" />;
    case "delivered":
      return <CheckCircle size={20} className="mr-1" />;
    case "cancelled":
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

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetcher({
        pathname: `order/status/${order.id}`,
        method: "PUT",
        data: { status: newStatus },
      });

      if (response) {
        onStatusChange(response.data.status);
        showNotification(
          "success",
          "تم تحديث الحالة بنجاح",
          "تم تحديث حالة الطلب بنجاح."
        );
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error changing status:", error);
      showNotification(
        "error",
        "فشل في التحديث",
        "حدث خطأ أثناء تحديث حالة الطلب."
      );
    }
  };

  return (
    <div className="flex items-center relative" ref={dropdownRef}>
      <div
        className={`px-3 py-1 rounded-lg border hover:shadow hover:scale-105 transition duration-300 gap-1 flex items-center cursor-pointer `}
        dir="rtl"
        onClick={() => setIsEditing(!isEditing)}
      >
        <p>{getStatusName(order.status)}</p>
        <p>
          <Pencil size={20} />
        </p>
      </div>

      {isEditing && (
        <div className="absolute top-9 right-0 z-50 bg-white shadow-lg rounded-lg p-2 w-36">
          {["created", "accepted", "shipping", "delivered", "cancelled"].map(
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
