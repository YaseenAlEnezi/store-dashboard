import React, { useState, useEffect } from "react";
import {
  Clock,
  User,
  Phone,
  MapPin,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Edit3,
  Save,
  X,
  CreditCard,
  PackageMinusIcon,
} from "lucide-react";
import { Card, Table } from "antd";
import StatusDropdown from "./StatusDropdown";
import { useParams } from "react-router-dom";
import { fetcher } from "../../utils/api";
import { showNotification } from "../../utils/Notification";
import { EditModal } from "./EditModal";

export const OrderTracking = () => {
  // Initialize state
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState(null);
  const { id } = useParams();

  const getOrderById = async () => {
    setLoading(true);
    try {
      const response = await fetcher({
        pathname: `order/${id}`,
        method: "GET",
        data: null,
        auth: true,
      });
      if (response.success) {
        setOrder(response.data);
        setEditedStatus(response.data.status);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showNotification("error", "Failed to fetch order", "");
      console.log(error);
    }
  };

  useEffect(() => {
    getOrderById();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderType = (type) => {
    return type === "onSite" ? "استلام من المحل" : "توصيل";
  };

  const calculateTotal = (items) => {
    if (!items) return 0;
    return items.reduce((total, item) => {
      return total + Math.abs(item.quantity) * item.price;
    }, 0);
  };

  const getCurrentStep = (status) => {
    switch (status) {
      case "created":
        return { step: 0, color: "bg-blue-600" };
      case "accepted":
        return { step: 1, color: "bg-yellow-500" };
      case "shipping":
        return { step: 2, color: "bg-purple-500" };
      case "delivered":
        return { step: 3, color: "bg-green-500" };
      case "cancelled":
        return { step: -1, color: "bg-red-500" };
      default:
        return { step: 0, color: "bg-gray-400" };
    }
  };

  const steps = [
    {
      title: "تم الإنشاء",
      icon: <Clock size={20} />,
    },
    {
      title: "قيد التجهيز",
      icon: <Package size={20} />,
    },
    {
      title: "تم الشحن",
      icon: <Truck size={20} />,
    },
    {
      title: "تم التسليم",
      icon: <CheckCircle size={20} />,
    },
  ];

  const columns = [
    {
      title: "المنتج",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "الموقع",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "الكمية",
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => <span>{Math.abs(text)}</span>,
    },
    {
      title: "السعر",
      dataIndex: "price",
      key: "price",
      render: (text) => <span>{text.toLocaleString()} د.ع</span>,
    },
    {
      title: "المجموع",
      dataIndex: "total",
      key: "total",
      render: (text, record) => (
        <span>
          {(Math.abs(record.quantity) * record.price).toLocaleString()} د.ع
        </span>
      ),
    },
    {
      title: "الإجراءات",
      key: "actions",
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => {
              setRecord(record);
              setOpen(true);
            }}
          >
            <Edit3 size={20} />
          </button>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => console.log("Delete", record)}
          >
            <PackageMinusIcon size={20} />
          </button>
        </div>
      ),
    },
  ];

  const handleStatusChange = (newStatus) => {
    setEditedStatus(newStatus);
    setOrder({ ...order, status: newStatus });
  };

  const stepStyles = {
    created: {
      bg: "bg-blue-600",
      text: "text-blue-600",
      ring: "ring-blue-100",
    },
    accepted: {
      bg: "bg-yellow-300",
      text: "text-yellow-600",
      ring: "ring-yellow-100",
    },
    shipping: {
      bg: "bg-purple-500",
      text: "text-purple-600",
      ring: "ring-purple-100",
    },
    delivered: {
      bg: "bg-green-500",
      text: "text-green-600",
      ring: "ring-green-100",
    },
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-48 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">متابعة الطلب</h1>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">
            رقم الطلب: {order?.id}
          </div>
        </div>

        {order && (
          <>
            <div className="flex justify-between items-center gap-4 mb-4">
              {/* Customer Information */}
              <Card className="bg-white px-6 py-2 w-full h-[220px]">
                <h2 className="text-xl font-semibold mb-4">معلومات الزبون</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-r border-gray-200 pr-4 text-lg">
                    <p className="mb-2 flex items-center">
                      <User size={20} className="ml-2 text-gray-500" />
                      {order.user?.name}
                    </p>
                    <p className="mb-2 flex items-center">
                      <Phone size={20} className="ml-2 text-gray-500" />

                      {order.user?.phone}
                    </p>
                    <p className="flex items-center">
                      <CreditCard size={20} className="ml-2 text-gray-500" />
                      {calculateTotal(order.items).toLocaleString()} د.ع
                    </p>
                  </div>
                  <div className="pl-4 text-lg">
                    <p className="mb-2 flex items-center">
                      <MapPin size={20} className="ml-2 text-gray-500" />
                      {order.address}
                    </p>
                    <p className="flex items-center">
                      <ShoppingBag size={20} className="ml-2 text-gray-500" />
                      {getOrderType(order.orderType)}
                    </p>
                  </div>
                </div>
              </Card>
              {/* Order Status and Progress */}
              <Card className="bg-white px-6 py-2 w-full h-[220px]">
                <div className="flex justify-between mb-4">
                  <h2 className="text-xl font-semibold">حالة الطلب</h2>
                  <StatusDropdown
                    order={order}
                    onStatusChange={handleStatusChange}
                  />
                </div>

                <div className="flex items-center gap-2 mb-5">
                  <Clock size={20} className="text-gray-500" />
                  <p className="text-gray-500 flex items-center">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                {order.status !== "cancelled" ? (
                  <div className="w-full">
                    {/* Custom Step Indicator */}
                    <div className="relative flex items-center justify-between">
                      {steps.map((step, index) => {
                        const currentStep = getCurrentStep(order.status).step;
                        const isCompleted = index <= currentStep;
                        const isCurrent = index === currentStep;

                        // Get colors based on this step
                        const statusKeys = Object.keys(stepStyles);
                        const stepKey = statusKeys[index]; // Assumes steps follow same order
                        const colors = stepStyles[stepKey] || {
                          bg: "bg-gray-200",
                          text: "text-gray-500",
                          ring: "ring-gray-100",
                        };

                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center z-10"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center
                                          ${
                                            isCompleted
                                              ? colors.bg + " text-white"
                                              : "bg-gray-200"
                                          }
                                          ${
                                            isCurrent
                                              ? colors.ring + " ring-4"
                                              : ""
                                          }`}
                            >
                              {step.icon}
                            </div>
                            <div className="text-center mt-2">
                              <p
                                className={`font-medium ${
                                  isCompleted ? colors.text : "text-gray-500"
                                }`}
                              >
                                {step.title}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {/* Progress bar connecting steps */}
                      <div
                        className={`absolute top-5 left-0 h-1 bg-gray-200 w-full -z-10`}
                      ></div>
                      <div
                        className={`absolute top-5 left-0 h-1 ${
                          getCurrentStep(order.status).color
                        } -z-10`}
                        style={{
                          width: `${getCurrentStep(order.status).step}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 p-4 rounded-md border border-red-200 gap-1 text-center flex items-center justify-center">
                    <XCircle size={20} className="text-red-600" />
                    <p className="text-red-600 font-semibold">
                      تم إلغاء هذا الطلب
                    </p>
                  </div>
                )}
              </Card>
            </div>
            {/* Order Items */}
            <Card className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Package size={20} className="ml-2" />
                  المنتجات
                </h2>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">
                  {order.items.length} منتج
                </div>
              </div>
              <Table
                dataSource={order.items}
                columns={columns}
                pagination={false}
              />

              {/* Total */}
              <div className="flex justify-start mt-6">
                <div className="text-lg font-semibold">
                  <span>المجموع الكلي : </span>
                  <span className="text-xl">
                    {calculateTotal(order.items).toLocaleString()} د.ع
                  </span>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
      <EditModal open={open} setOpen={setOpen} record={record} />
    </div>
  );
};
