import React, { useState, useEffect } from "react";
import { Container } from "../../components/Container";
import {
  Button,
  Table,
  Tag,
  Space,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  message,
  Modal,
  Descriptions,
  Badge,
} from "antd";
import { SearchOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../../utils/api";
import dayjs from "dayjs";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { RangePicker } = DatePicker;

export const Order = () => {
  const [search, setSearch] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const Navigate = useNavigate();

  const {
    data: ordersResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      try {
        const res = await fetcher({
          pathname: "order",
          method: "GET",
          auth: true,
        });
        if (!res.success) throw new Error("Failed to fetch orders");
        return res;
      } catch (error) {
        message.error("فشل في جلب الطلبات");
        return { data: [] };
      }
    },
  });

  const orders = ordersResponse?.data || [];

  // Filter orders based on current filters
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id?.toString().includes(search) ||
      order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.phone?.includes(search) ||
      order.supplierName?.toLowerCase().includes(search.toLowerCase()) ||
      order.supplierPhone?.includes(search);

    const matchesOrderType =
      orderTypeFilter === "all" || order.orderType === orderTypeFilter;
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    let matchesDate = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const orderDate = dayjs(order.createdAt);
      matchesDate =
        orderDate.isAfter(dateRange[0]) && orderDate.isBefore(dateRange[1]);
    }

    return matchesSearch && matchesOrderType && matchesStatus && matchesDate;
  });

  const getOrderTypeColor = (orderType) => {
    const colors = {
      sale: "green",
      saleReturn: "orange",
      purchase: "blue",
      purchaseReturn: "red",
      online: "purple",
    };
    return colors[orderType] || "default";
  };

  const getOrderTypeLabel = (orderType) => {
    const labels = {
      sale: "بيع",
      saleReturn: "إرجاع بيع",
      purchase: "شراء",
      purchaseReturn: "إرجاع شراء",
      online: "طلب إلكتروني",
    };
    return labels[orderType] || orderType;
  };

  const getStatusColor = (status) => {
    const colors = {
      created: "default",
      accepted: "processing",
      shipping: "warning",
      delivered: "success",
      cancelled: "error",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      created: "تم الإنشاء",
      accepted: "قيد التجهيز",
      shipping: "قيد الشحن",
      delivered: "تم التسليم",
      cancelled: "ملغي",
    };
    return labels[status] || status;
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleDeleteOrder = async (orderId) => {
    Modal.confirm({
      title: "تأكيد الحذف",
      content: "هل أنت متأكد من حذف هذا الطلب؟",
      okText: "نعم",
      cancelText: "لا",
      onOk: async () => {
        try {
          const res = await fetcher({
            pathname: `order/${orderId}`,
            method: "DELETE",
            auth: true,
          });
          if (res.success) {
            message.success("تم حذف الطلب بنجاح");
            refetch();
          } else {
            message.error(res.msg || "فشل في حذف الطلب");
          }
        } catch (error) {
          message.error("فشل في حذف الطلب");
        }
      },
    });
  };

  const columns = [
    {
      title: "رقم الطلب",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id) => `#${id}`,
    },
    {
      title: "نوع الطلب",
      dataIndex: "orderType",
      key: "orderType",
      width: 120,
      render: (orderType) => (
        <Tag color={getOrderTypeColor(orderType)}>
          {getOrderTypeLabel(orderType)}
        </Tag>
      ),
    },
    {
      title: "الحالة",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Badge status={getStatusColor(status)} text={getStatusLabel(status)} />
      ),
    },
    {
      title: "العميل/المورد",
      key: "customerSupplier",
      width: 200,
      render: (_, record) => {
        if (record.orderType === "sale" || record.orderType === "saleReturn") {
          return (
            <div>
              <div className="font-medium">
                {record.user?.name || "غير محدد"}
              </div>
              <div className="text-sm text-gray-500">
                {record.user?.phone || ""}
              </div>
            </div>
          );
        } else {
          return (
            <div>
              <div className="font-medium">
                {record.supplierName || "غير محدد"}
              </div>
              <div className="text-sm text-gray-500">
                {record.supplierPhone || ""}
              </div>
            </div>
          );
        }
      },
    },
    {
      title: "العنوان",
      dataIndex: "address",
      key: "address",
      width: 200,
      render: (address) => address || "غير محدد",
    },
    {
      title: "التكلفة الإجمالية",
      dataIndex: "totalCost",
      key: "totalCost",
      width: 120,
      render: (totalCost) => (
        <span className="font-medium">
          {totalCost ? `${totalCost.toLocaleString()} د.ع` : "غير محدد"}
        </span>
      ),
    },
    {
      title: "تاريخ الإنشاء",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "الإجراءات",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showOrderDetails(record)}
          >
            عرض
          </Button>

          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              Navigate(`/orderTracking/${record.id}`);
            }}
          >
            تعديل
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteOrder(record.id)}
          >
            حذف
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Container width="100%">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">إدارة الطلبات</h1>
        <p className="text-gray-600">عرض وإدارة جميع أنواع الطلبات</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="البحث في الطلبات..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="نوع الطلب"
              value={orderTypeFilter}
              onChange={setOrderTypeFilter}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "جميع الأنواع" },
                { value: "sale", label: "بيع" },
                { value: "saleReturn", label: "إرجاع بيع" },
                { value: "purchase", label: "شراء" },
                { value: "purchaseReturn", label: "إرجاع شراء" },
                { value: "online", label: "طلب إلكتروني" },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="الحالة"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "جميع الحالات" },
                { value: "created", label: "تم الإنشاء" },
                { value: "accepted", label: "تم القبول" },
                { value: "shipping", label: "قيد الشحن" },
                { value: "delivered", label: "تم التسليم" },
                { value: "cancelled", label: "ملغي" },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              placeholder={["من تاريخ", "إلى تاريخ"]}
              value={dateRange}
              onChange={setDateRange}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              onClick={() => {
                setSearch("");
                setOrderTypeFilter("all");
                setStatusFilter("all");
                setDateRange(null);
              }}
              style={{ width: "100%" }}
            >
              إعادة تعيين
            </Button>
          </Col>
        </Row>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredOrders}
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} من ${total} طلب`,
          }}
          rowKey="id"
          scroll={{ x: 1200 }}
        />
      </div>

      {/* Order Details Modal */}
      <Modal
        title="تفاصيل الطلب"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            إغلاق
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="رقم الطلب" span={2}>
              #{selectedOrder.id}
            </Descriptions.Item>
            <Descriptions.Item label="نوع الطلب">
              <Tag color={getOrderTypeColor(selectedOrder.orderType)}>
                {getOrderTypeLabel(selectedOrder.orderType)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="الحالة">
              <Badge
                status={getStatusColor(selectedOrder.status)}
                text={getStatusLabel(selectedOrder.status)}
              />
            </Descriptions.Item>
            <Descriptions.Item label="التكلفة الإجمالية" span={2}>
              {selectedOrder.totalCost
                ? `${selectedOrder.totalCost.toLocaleString()} دينار عراقي`
                : "غير محدد"}
            </Descriptions.Item>
            <Descriptions.Item label="العنوان" span={2}>
              {selectedOrder.address || "غير محدد"}
            </Descriptions.Item>
            <Descriptions.Item label="تاريخ الإنشاء" span={2}>
              {dayjs(selectedOrder.createdAt).format("DD/MM/YYYY HH:mm:ss")}
            </Descriptions.Item>

            {selectedOrder.user && (
              <>
                <Descriptions.Item label="اسم العميل">
                  {selectedOrder.user.name}
                </Descriptions.Item>
                <Descriptions.Item label="رقم الهاتف">
                  {selectedOrder.user.phone}
                </Descriptions.Item>
              </>
            )}

            {selectedOrder.supplierName && (
              <>
                <Descriptions.Item label="اسم المورد">
                  {selectedOrder.supplierName}
                </Descriptions.Item>
                <Descriptions.Item label="رقم هاتف المورد">
                  {selectedOrder.supplierPhone || "غير محدد"}
                </Descriptions.Item>
              </>
            )}

            <Descriptions.Item label="المنتجات" span={2}>
              <div className="max-h-40 overflow-y-auto">
                {Array.isArray(selectedOrder.items) ? (
                  selectedOrder.items.map((item, index) => (
                    <div key={index} className="border-b py-2">
                      <div className="font-medium">
                        {item.product?.name || `منتج ${index + 1}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        الكمية: {item.quantity} | السعر:{" "}
                        {item.cost || item.price || "غير محدد"} د.ع
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">لا توجد تفاصيل للمنتجات</span>
                )}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Container>
  );
};
