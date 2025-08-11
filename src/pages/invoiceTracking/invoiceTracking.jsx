import { useState, useEffect } from "react";
import {
  Clock,
  User,
  Phone,
  Package,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Edit3,
  Save,
  CreditCard,
  Trash2,
  FileText,
} from "lucide-react";
import { Button, Card, Input, Popconfirm, Select, Table, Tag } from "antd";
import { useParams } from "react-router-dom";
import { fetcher } from "../../utils/api";
import { safeJsonParse } from "../../utils/jsonParser";
import { showNotification } from "../../utils/Notification";

export const InvoiceTracking = () => {
  const [invoice, setInvoice] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editID, setEditID] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");
  const { id } = useParams();

  const getInvoiceById = async () => {
    setLoading(true);
    try {
      const response = await fetcher({
        pathname: `invoice/${id}`,
        method: "GET",
        data: null,
        auth: true,
      });
      if (response.success) {
        // Parse items JSON string to array using utility function
        let invoiceData = response.data;
        invoiceData.items = safeJsonParse(invoiceData.items, []);
        setInvoice(invoiceData);
        setEditedStatus(invoiceData.status);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showNotification("error", "Failed to fetch invoice", "");
      console.log(error);
    }
  };

  const updateInvoice = async () => {
    try {
      const response = await fetcher({
        pathname: `invoice/${id}`,
        method: "PUT",
        data: invoice,
        auth: true,
      });
      getInvoiceById();
      if (response.success) {
        showNotification("success", "Invoice updated successfully", "");
      } else {
        showNotification("error", "Failed to update invoice", "");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getProducts = async () => {
    try {
      const response = await fetcher({
        pathname: `product?search=${search}&page=1&pageSize=10`,
        method: "GET",
        data: null,
        auth: true,
      });
      if (response.success) {
        setProducts(response.data);
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showNotification("error", "Failed to fetch products", "");
    }
    return [];
  };

  useEffect(() => {
    getInvoiceById();
  }, []);
  useEffect(() => {
    getProducts();
  }, [search]);

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

  const getInvoiceTypeText = (type) => {
    const types = {
      sale: "بيع",
      saleReturn: "إرجاع بيع",
      purchase: "شراء",
      purchaseReturn: "إرجاع شراء",
    };
    return types[type] || type;
  };

  const getInvoiceTypeColor = (type) => {
    const colors = {
      sale: "green",
      saleReturn: "orange",
      purchase: "blue",
      purchaseReturn: "red",
    };
    return colors[type] || "default";
  };

  const getStatusText = (status) => {
    const statuses = {
      created: "تم الإنشاء",
      deferred: "مؤجل",
      partiallyPaid: "مدفوع جزئياً",
      paid: "مدفوع",
      cancelled: "ملغي",
      returned: "مرتجع",
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      created: "blue",
      deferred: "orange",
      partiallyPaid: "yellow",
      paid: "green",
      cancelled: "red",
      returned: "purple",
    };
    return colors[status] || "default";
  };

  const calculateTotal = (items) => {
    if (!items) return 0;
    return items.reduce((total, item) => {
      return total + Math.abs(item.quantity) * item.cost;
    }, 0);
  };

  const columns = [
    {
      title: "المنتج",
      dataIndex: ["product", "name"],
      key: "name",
      width: 200,
    },
    {
      title: "الموقع",
      dataIndex: ["product", "location"],
      key: "location",
    },
    {
      title: "الكمية",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (text, record) =>
        editID === record.id ? (
          <Input
            size="small"
            value={record.quantity}
            type="number"
            onChange={(e) =>
              setInvoice((prev) => ({
                ...prev,
                items: prev.items.map((item) =>
                  item.id === record.id
                    ? { ...item, quantity: parseFloat(e.target.value) }
                    : item
                ),
              }))
            }
          />
        ) : (
          <span>{Math.abs(text)}</span>
        ),
    },
    {
      title: "سعر البيع",
      dataIndex: ["product", "SellingPrice"],
      key: "SellingPrice",
      width: 150,
      render: (text, record) =>
        editID === record.id ? (
          <Input
            size="small"
            value={record?.price}
            onChange={(e) =>
              setInvoice((prev) => ({
                ...prev,
                items: prev.items.map((item) =>
                  item.id === record.id
                    ? { ...item, price: parseFloat(e.target.value) }
                    : item
                ),
              }))
            }
          />
        ) : (
          <span>{record?.cost?.toLocaleString()} د.ع</span>
        ),
    },
    {
      title: "المجموع",
      dataIndex: "total",
      key: "total",
      render: (text, record) => (
        <span>
          {(Math.abs(record.quantity) * record.cost).toLocaleString()} د.ع
        </span>
      ),
    },
    {
      title: "الإجراءات",
      key: "actions",
      width: 100,
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <button className="text-blue-500 hover:text-blue-700">
            {editID === record.id ? (
              <Save size={20} onClick={() => setEditID(null)} />
            ) : (
              <Edit3 size={20} onClick={() => setEditID(record?.id)} />
            )}
          </button>
          <Popconfirm
            title="هل أنت متأكد من حذف هذا المنتج؟"
            onConfirm={() => {
              setInvoice((prev) => ({
                ...prev,
                items: prev.items.filter((item) => item.id !== record.id),
              }));
            }}
          >
            <button className="text-red-500 hover:text-red-700">
              <Trash2 size={20} />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleStatusChange = (newStatus) => {
    setEditedStatus(newStatus);
    setInvoice({ ...invoice, status: newStatus });
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
          <h1 className="text-2xl font-bold">متابعة الفاتورة</h1>
          <div className="flex items-center gap-4">
            <Button type="primary" onClick={updateInvoice}>
              حفظ التغييرات
            </Button>
            <Button className="pointer-events-none">
              رقم الفاتورة: {invoice?.invoiceNumber}
            </Button>
          </div>
        </div>

        {invoice && (
          <>
            <div className="flex justify-between items-center gap-4 mb-4">
              {/* Customer Information */}
              <Card className="bg-white px-6 py-2 w-full h-[220px]">
                <h2 className="text-xl font-semibold mb-4">معلومات العميل</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-r border-gray-200 pr-4 text-lg">
                    <p className="mb-2 flex items-center">
                      <User size={20} className="ml-2 text-gray-500" />
                      {invoice.user?.name || "غير محدد"}
                    </p>
                    <p className="mb-2 flex items-center">
                      <Phone size={20} className="ml-2 text-gray-500" />
                      {invoice.user?.phone || "غير محدد"}
                    </p>
                    <p className="flex items-center">
                      <CreditCard size={20} className="ml-2 text-gray-500" />
                      {calculateTotal(invoice.items).toLocaleString()} د.ع
                    </p>
                  </div>
                  <div className="pl-4 text-lg">
                    <p className="mb-2 flex items-center">
                      <FileText size={20} className="ml-2 text-gray-500" />
                      <Tag color={getInvoiceTypeColor(invoice.type)}>
                        {getInvoiceTypeText(invoice.type)}
                      </Tag>
                    </p>
                    <p className="flex items-center">
                      <ShoppingBag size={20} className="ml-2 text-gray-500" />
                      <Tag color={getStatusColor(invoice.status)}>
                        {getStatusText(invoice.status)}
                      </Tag>
                    </p>
                  </div>
                </div>
              </Card>
              {/* Invoice Status and Progress */}
              <Card className="bg-white px-6 py-2 w-full h-[220px]">
                <div className="flex justify-between mb-4">
                  <h2 className="text-xl font-semibold">حالة الفاتورة</h2>
                  <Select
                    value={editedStatus}
                    onChange={handleStatusChange}
                    style={{ width: 150 }}
                    options={[
                      { value: "created", label: "تم الإنشاء" },
                      { value: "deferred", label: "مؤجل" },
                      { value: "partiallyPaid", label: "مدفوع جزئياً" },
                      { value: "paid", label: "مدفوع" },
                      { value: "cancelled", label: "ملغي" },
                      { value: "returned", label: "مرتجع" },
                    ]}
                  />
                </div>

                <div className="flex items-center gap-2 mb-5">
                  <Clock size={20} className="text-gray-500" />
                  <p className="text-gray-500 flex items-center">
                    {formatDate(invoice.createdAt)}
                  </p>
                </div>

                {invoice.status !== "cancelled" ? (
                  <div className="w-full">
                    <div className="bg-green-50 p-4 rounded-md border border-green-200 gap-1 text-center flex items-center justify-center">
                      <CheckCircle size={20} className="text-green-600" />
                      <p className="text-green-600 font-semibold">
                        فاتورة {getInvoiceTypeText(invoice.type)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 p-4 rounded-md border border-red-200 gap-1 text-center flex items-center justify-center">
                    <XCircle size={20} className="text-red-600" />
                    <p className="text-red-600 font-semibold">
                      تم إلغاء هذه الفاتورة
                    </p>
                  </div>
                )}
              </Card>
            </div>
            {/* Invoice Items */}
            <Card className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Package size={20} className="ml-2" />
                    المنتجات
                  </h2>
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">
                    {invoice.items.length} منتج
                  </div>
                </div>
                <Select
                  placeholder="بحث عن منتج"
                  options={products
                    .filter(
                      (product) =>
                        !invoice.items.some((item) => item.id === product.id)
                    )
                    .map((product) => ({
                      label: product.name,
                      value: product.id,
                    }))}
                  className="w-[200px]"
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    const selectedProduct = products.find(
                      (product) => product.id === value
                    );
                    if (selectedProduct) {
                      setInvoice((prev) => ({
                        ...prev,
                        items: [
                          ...prev.items,
                          {
                            id: selectedProduct.id,
                            name: selectedProduct.name,
                            price: selectedProduct.SellingPrice || 0,
                            quantity: 1, // Default quantity
                            location: selectedProduct.location || "غير محدد",
                          },
                        ],
                      }));
                    }
                  }}
                />
              </div>
              <Table
                dataSource={invoice.items}
                columns={columns}
                pagination={false}
              />

              {/* Total */}
              <div className="flex justify-start mt-6">
                <div className="text-lg font-semibold">
                  <span>المجموع الكلي : </span>
                  <span className="text-xl">
                    {calculateTotal(invoice.items).toLocaleString()} د.ع
                  </span>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
