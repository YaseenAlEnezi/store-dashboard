import React, { useState, useEffect, useCallback } from "react";
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
  Card,
  Statistic,
  Dropdown,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  FileTextOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  UndoOutlined,
  DownloadOutlined,
  EditOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  FileSearchOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../../utils/api";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { RangePicker } = DatePicker;

export const Invoices = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: invoicesResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "invoices",
      debouncedSearch,
      invoiceTypeFilter,
      statusFilter,
      dateRange,
    ],
    queryFn: async () => {
      try {
        // Build query parameters
        const params = new URLSearchParams();

        if (debouncedSearch) params.append("search", debouncedSearch);
        if (invoiceTypeFilter !== "all")
          params.append("type", invoiceTypeFilter);
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (dateRange && dateRange[0] && dateRange[1]) {
          params.append("startDate", dateRange[0].toISOString());
          params.append("endDate", dateRange[1].toISOString());
        }

        const queryString = params.toString();
        const pathname = queryString ? `invoice?${queryString}` : "invoice";

        const res = await fetcher({
          pathname,
          method: "GET",
          auth: true,
        });
        if (!res.success) throw new Error("Failed to fetch invoices");
        return res;
      } catch (error) {
        message.error("فشل في جلب الفواتير");
        return { data: [], totals: {}, pagination: {} };
      }
    },
    keepPreviousData: true,
  });

  const invoices = invoicesResponse?.data || [];
  const totals = invoicesResponse?.totals || {};
  const pagination = invoicesResponse?.pagination || {};

  // Use backend totals for statistics
  const totalInvoices = totals.totalInvoices || 0;
  const totalAmount = totals.totalAmount || 0;
  const pendingInvoices = totals.pendingInvoices || 0;
  const paidInvoices = totals.paidInvoices || 0;

  const getInvoiceTypeColor = (invoiceType) => {
    const colors = {
      sale: "green",
      saleReturn: "orange",
      purchase: "blue",
      purchaseReturn: "red",
      online: "purple",
    };
    return colors[invoiceType] || "default";
  };

  const getInvoiceTypeLabel = (invoiceType) => {
    const labels = {
      sale: "بيع",
      saleReturn: "إرجاع بيع",
      purchase: "شراء",
      purchaseReturn: "إرجاع شراء",
      online: "طلب إلكتروني",
    };
    return labels[invoiceType] || invoiceType;
  };

  const getStatusColor = (status) => {
    const colors = {
      created: "processing",
      deferred: "warning",
      partiallyPaid: "warning",
      paid: "success",
      cancelled: "error",
      returned: "default",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      created: "تم الإنشاء",
      deferred: "مؤجل",
      partiallyPaid: "مدفوع جزئياً",
      paid: "مدفوع",
      cancelled: "ملغي",
      returned: "مسترد",
    };
    return labels[status] || status;
  };

  const showInvoiceDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalVisible(true);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    Modal.confirm({
      title: "تأكيد الحذف",
      content: "هل أنت متأكد من حذف هذه الفاتورة؟",
      okText: "نعم",
      cancelText: "لا",
      onOk: async () => {
        try {
          const res = await fetcher({
            pathname: `invoice/${invoiceId}`,
            method: "DELETE",
            auth: true,
          });
          if (res.success) {
            message.success("تم حذف الفاتورة بنجاح");
            refetch();
          } else {
            message.error(res.msg || "فشل في حذف الفاتورة");
          }
        } catch (error) {
          message.error("فشل في حذف الفاتورة");
        }
      },
    });
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const res = await fetcher({
        pathname: `invoice/${invoiceId}/download`,
        method: "GET",
        auth: true,
      });
      if (res.success) {
        // Handle download logic here
        message.success("تم بدء تحميل الفاتورة");
      } else {
        message.error(res.msg || "فشل في تحميل الفاتورة");
      }
    } catch (error) {
      message.error("فشل في تحميل الفاتورة");
    }
  };

  const handleTrackInvoice = (invoiceId) => {
    navigate(`/invoiceTracking/${invoiceId}`);
  };

  const handleUpdateStatus = async (invoiceId, newStatus) => {
    try {
      const res = await fetcher({
        pathname: `invoice/status/${invoiceId}`,
        method: "PUT",
        data: { status: newStatus },
        auth: true,
      });
      if (res.success) {
        message.success("تم تحديث حالة الفاتورة بنجاح");
        refetch();
      } else {
        message.error(res.msg || "فشل في تحديث حالة الفاتورة");
      }
    } catch (error) {
      message.error("فشل في تحديث حالة الفاتورة");
    }
  };

  const handlePrintInvoice = (invoice) => {
    // Open print dialog with invoice details
    const printWindow = window.open("", "_blank");
    const invoiceContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #f2f2f2; }
          .total { text-align: left; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>فاتورة ${invoice.invoiceNumber}</h1>
        </div>
        <div class="info">
          <p><strong>نوع الفاتورة:</strong> ${getInvoiceTypeLabel(
            invoice.type
          )}</p>
          <p><strong>الحالة:</strong> ${getStatusLabel(invoice.status)}</p>
          <p><strong>العميل/المورد:</strong> ${
            invoice.user?.name || "غير محدد"
          } - ${invoice.user?.phone || ""}</p>
          <p><strong>تاريخ الإنشاء:</strong> ${dayjs(invoice.createdAt).format(
            "DD/MM/YYYY HH:mm"
          )}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>المجموع</th>
            </tr>
          </thead>
          <tbody>
            ${
              Array.isArray(invoice.items)
                ? invoice.items
                    .map(
                      (item) => `
              <tr>
                <td>${item.name || item.product?.name || "منتج"}</td>
                <td>${item.quantity}</td>
                <td>${item.cost || item.price || 0} د.ع</td>
                <td>${(
                  item.quantity * (item.cost || item.price || 0)
                ).toLocaleString()} د.ع</td>
              </tr>
            `
                    )
                    .join("")
                : ""
            }
          </tbody>
        </table>
        <div class="total">
          <p>المبلغ الإجمالي: ${invoice.totalCost?.toLocaleString()} د.ع</p>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.print();
  };

  const columns = [
    {
      title: "رقم الفاتورة",
      dataIndex: "id",
      key: "id",
      width: 120,
    },
    {
      title: "نوع الفاتورة",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type) => (
        <Tag color={getInvoiceTypeColor(type)}>{getInvoiceTypeLabel(type)}</Tag>
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
        if (record.type === "sale" || record.type === "saleReturn") {
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
                {record.user?.name || "غير محدد"}
              </div>
              <div className="text-sm text-gray-500">
                {record.user?.phone || ""}
              </div>
            </div>
          );
        }
      },
    },
    {
      title: "المبلغ الإجمالي",
      dataIndex: "totalCost",
      key: "totalCost",
      width: 120,
      render: (totalCost) => (
        <span className="font-medium">{totalCost?.toLocaleString()} د.ع</span>
      ),
    },
    {
      title: "تاريخ الإنشاء",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (createdAt) => dayjs(createdAt).format("DD/MM/YYYY"),
    },
    {
      title: "الإجراءات",
      key: "actions",
      width: 250,
      render: (_, record) => {
        const statusMenuItems = [
          {
            key: "created",
            label: "تم الإنشاء",
            icon: <FileTextOutlined />,
            disabled: record.status === "created",
          },
          {
            key: "deferred",
            label: "مؤجل",
            icon: <ClockCircleOutlined />,
            disabled: record.status === "deferred",
          },
          {
            key: "partiallyPaid",
            label: "مدفوع جزئياً",
            icon: <ReloadOutlined />,
            disabled: record.status === "partiallyPaid",
          },
          {
            key: "paid",
            label: "مدفوع",
            icon: <CheckCircleOutlined />,
            disabled: record.status === "paid",
          },
          {
            key: "cancelled",
            label: "ملغي",
            icon: <CloseCircleOutlined />,
            disabled: record.status === "cancelled",
          },
          {
            key: "returned",
            label: "مسترد",
            icon: <UndoOutlined />,
            disabled: record.status === "returned",
          },
        ];

        return (
          <Space size="small" wrap>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showInvoiceDetails(record)}
              title="عرض التفاصيل"
            />
            <Button
              type="text"
              icon={<FileSearchOutlined />}
              onClick={() => handleTrackInvoice(record.id)}
              title="متابعة الفاتورة"
            />
            <Dropdown
              menu={{
                items: statusMenuItems,
                onClick: ({ key }) => handleUpdateStatus(record.id, key),
              }}
              trigger={["click"]}
            >
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                title="تحديث الحالة"
              />
            </Dropdown>
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => handlePrintInvoice(record)}
              title="طباعة الفاتورة"
            />
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadInvoice(record.id)}
              title="تحميل الفاتورة"
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteInvoice(record.id)}
              title="حذف الفاتورة"
            />
          </Space>
        );
      },
    },
  ];

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          إدارة الفواتير
        </h1>

        {/* Statistics Cards */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card loading={isLoading}>
              <Statistic
                title="إجمالي الفواتير"
                value={totalInvoices}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card loading={isLoading}>
              <Statistic
                title="إجمالي المبالغ"
                value={totalAmount?.toLocaleString() || 0}
                prefix={<DollarOutlined />}
                suffix="د.ع"
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card loading={isLoading}>
              <Statistic
                title="الفواتير المعلقة"
                value={pendingInvoices}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card loading={isLoading}>
              <Statistic
                title="الفواتير المدفوعة"
                value={paidInvoices}
                prefix={<UndoOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="mb-6">
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Input
                placeholder="البحث في الفواتير..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="نوع الفاتورة"
                value={invoiceTypeFilter}
                onChange={setInvoiceTypeFilter}
                style={{ width: "100%" }}
              >
                <Select.Option value="all">جميع الأنواع</Select.Option>
                <Select.Option value="sale">بيع</Select.Option>
                <Select.Option value="saleReturn">إرجاع بيع</Select.Option>
                <Select.Option value="purchase">شراء</Select.Option>
                <Select.Option value="purchaseReturn">إرجاع شراء</Select.Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="الحالة"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: "100%" }}
              >
                <Select.Option value="all">جميع الحالات</Select.Option>
                <Select.Option value="created">تم الإنشاء</Select.Option>
                <Select.Option value="deferred">مؤجل</Select.Option>
                <Select.Option value="partiallyPaid">
                  مدفوع جزئياً
                </Select.Option>
                <Select.Option value="paid">مدفوع</Select.Option>
                <Select.Option value="cancelled">ملغي</Select.Option>
                <Select.Option value="returned">مسترد</Select.Option>
              </Select>
            </Col>
            <Col span={6}>
              <RangePicker
                placeholder={["من تاريخ", "إلى تاريخ"]}
                value={dateRange}
                onChange={setDateRange}
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={4}>
              <Button
                type="primary"
                onClick={() => {
                  setSearch("");
                  setInvoiceTypeFilter("all");
                  setStatusFilter("all");
                  setDateRange(null);
                }}
                style={{ width: "100%" }}
              >
                إعادة تعيين
              </Button>
            </Col>
          </Row>

          {/* Active Filters Summary */}
          {(search ||
            invoiceTypeFilter !== "all" ||
            statusFilter !== "all" ||
            dateRange) && (
            <Row className="mt-4">
              <Col span={24}>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">الفلاتر النشطة:</span>
                  {search && <Tag className="ml-2">البحث: {search}</Tag>}
                  {invoiceTypeFilter !== "all" && (
                    <Tag className="ml-2">
                      النوع: {getInvoiceTypeLabel(invoiceTypeFilter)}
                    </Tag>
                  )}
                  {statusFilter !== "all" && (
                    <Tag className="ml-2">
                      الحالة: {getStatusLabel(statusFilter)}
                    </Tag>
                  )}
                  {dateRange && dateRange[0] && dateRange[1] && (
                    <Tag className="ml-2">
                      التاريخ: {dayjs(dateRange[0]).format("DD/MM/YYYY")} -{" "}
                      {dayjs(dateRange[1]).format("DD/MM/YYYY")}
                    </Tag>
                  )}
                </div>
              </Col>
            </Row>
          )}
        </Card>

        {/* Results Summary */}
        <Card className="mb-4">
          <Row justify="space-between" align="middle">
            <Col>
              <span className="text-gray-600">
                تم العثور على <strong>{totalInvoices}</strong> فاتورة
                {search && (
                  <span>
                    {" "}
                    تطابق البحث: "<strong>{search}</strong>"
                  </span>
                )}
              </span>
            </Col>
            <Col>
              <span className="text-gray-600">
                إجمالي المبالغ:{" "}
                <strong>{totalAmount?.toLocaleString() || 0} د.ع</strong>
              </span>
            </Col>
          </Row>
        </Card>

        {/* Invoices Table */}
        <Table
          columns={columns}
          dataSource={invoices}
          loading={isLoading}
          rowKey="id"
          pagination={{
            current: pagination.current || 1,
            pageSize: pagination.pageSize || 50,
            total: pagination.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} من ${total} فاتورة`,
            onChange: (page, pageSize) => {
              // Handle pagination change
              // You can implement this if needed
            },
          }}
          scroll={{ x: 1200 }}
        />
      </div>

      {/* Invoice Details Modal */}
      <Modal
        title="تفاصيل الفاتورة"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            إغلاق
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              if (selectedInvoice) {
                handleDownloadInvoice(selectedInvoice.id);
              }
            }}
          >
            تحميل الفاتورة
          </Button>,
        ]}
        width={800}
      >
        {selectedInvoice && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="رقم الفاتورة" span={2}>
              #{selectedInvoice.invoiceNumber}
            </Descriptions.Item>
            <Descriptions.Item label="نوع الفاتورة">
              <Tag color={getInvoiceTypeColor(selectedInvoice.type)}>
                {getInvoiceTypeLabel(selectedInvoice.type)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="الحالة">
              <Badge
                status={getStatusColor(selectedInvoice.status)}
                text={getStatusLabel(selectedInvoice.status)}
              />
            </Descriptions.Item>
            <Descriptions.Item label="العميل/المورد" span={2}>
              {selectedInvoice.type === "sale" ||
              selectedInvoice.type === "saleReturn"
                ? `${selectedInvoice.user?.name || "غير محدد"} - ${
                    selectedInvoice.user?.phone || ""
                  }`
                : `${selectedInvoice.user?.name || "غير محدد"} - ${
                    selectedInvoice.user?.phone || ""
                  }`}
            </Descriptions.Item>
            <Descriptions.Item label="المبلغ الإجمالي">
              {selectedInvoice.totalCost?.toLocaleString()} د.ع
            </Descriptions.Item>
            <Descriptions.Item label="تاريخ الإنشاء">
              {dayjs(selectedInvoice.createdAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            {selectedInvoice.notes && (
              <Descriptions.Item label="ملاحظات" span={2}>
                {selectedInvoice.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </Container>
  );
};
