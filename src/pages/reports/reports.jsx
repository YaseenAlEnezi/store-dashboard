import React, { useState } from "react";
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
  Card,
  Statistic,
  Tabs,
  Typography,
  Divider,
} from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  DownloadOutlined,
  PrinterOutlined,
  BarChartOutlined,
  PieChartOutlined,
  ArrowUpOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../../utils/api";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export const Reports = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [reportType, setReportType] = useState("all");
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);
  const [activeTab, setActiveTab] = useState("summary");

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Invoices for detailed report
  const {
    data: invoicesResponse,
    isLoading: invoicesLoading,
    refetch: refetchInvoices,
  } = useQuery({
    queryKey: ["reports-invoices", debouncedSearch, reportType, dateRange],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append("search", debouncedSearch);
        if (reportType !== "all") params.append("type", reportType);
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
    enabled: activeTab === "invoices" || activeTab === "summary",
  });

  // Fetch Financial Summary
  const {
    data: summaryData,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["reports-summary", dateRange],
    queryFn: async () => {
      try {
        const res = await fetcher({
          pathname: `accounting/summary?period=month`,
          method: "GET",
          auth: true,
        });
        if (!res.success) throw new Error("Failed to fetch summary");
        return res.data;
      } catch (error) {
        message.error("فشل في جلب الملخص المالي");
        return null;
      }
    },
    enabled: activeTab === "summary",
  });

  // Fetch Profit & Loss
  const {
    data: profitLossData,
    isLoading: profitLossLoading,
    refetch: refetchProfitLoss,
  } = useQuery({
    queryKey: ["reports-profit-loss", dateRange],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange && dateRange[0] && dateRange[1]) {
          params.append("startDate", dateRange[0].toISOString());
          params.append("endDate", dateRange[1].toISOString());
        }
        const res = await fetcher({
          pathname: `accounting/profit-loss?${params.toString()}`,
          method: "GET",
          auth: true,
        });
        if (!res.success) throw new Error("Failed to fetch profit & loss");
        return res.data;
      } catch (error) {
        message.error("فشل في جلب قائمة الأرباح والخسائر");
        return null;
      }
    },
    enabled: activeTab === "profit-loss",
  });

  // Fetch Sales Report
  const {
    data: salesReportData,
    isLoading: salesReportLoading,
    refetch: refetchSalesReport,
  } = useQuery({
    queryKey: ["reports-sales", dateRange],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange && dateRange[0] && dateRange[1]) {
          params.append("startDate", dateRange[0].toISOString());
          params.append("endDate", dateRange[1].toISOString());
        }
        params.append("groupBy", "day");
        const res = await fetcher({
          pathname: `accounting/sales-report?${params.toString()}`,
          method: "GET",
          auth: true,
        });
        if (!res.success) throw new Error("Failed to fetch sales report");
        return res.data;
      } catch (error) {
        message.error("فشل في جلب تقرير المبيعات");
        return null;
      }
    },
    enabled: activeTab === "sales",
  });

  const invoices = invoicesResponse?.data || [];
  const totals = invoicesResponse?.totals || {};

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

  const handleRefresh = () => {
    if (activeTab === "summary") {
      refetchSummary();
      refetchInvoices();
    } else if (activeTab === "profit-loss") {
      refetchProfitLoss();
    } else if (activeTab === "sales") {
      refetchSalesReport();
    } else if (activeTab === "invoices") {
      refetchInvoices();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    message.info("سيتم إضافة ميزة التصدير قريباً");
  };

  // Summary Tab
  const renderSummary = () => {
    return (
      <div>
        {/* Statistics Cards */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card loading={summaryLoading || invoicesLoading}>
              <Statistic
                title="إجمالي الإيرادات"
                value={summaryData?.revenue?.total || totals?.totalAmount || 0}
                prefix={<DollarOutlined />}
                suffix="د.ع"
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card loading={summaryLoading || invoicesLoading}>
              <Statistic
                title="إجمالي الفواتير"
                value={totals?.totalInvoices || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card loading={summaryLoading || invoicesLoading}>
              <Statistic
                title="الفواتير المعلقة"
                value={totals?.pendingInvoices || 0}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card loading={summaryLoading || invoicesLoading}>
              <Statistic
                title="الفواتير المدفوعة"
                value={totals?.paidInvoices || 0}
                prefix={<ReloadOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>

        {summaryData && (
          <Row gutter={16} className="mb-6">
            <Col span={8}>
              <Card>
                <Statistic
                  title="تكلفة البضاعة المباعة"
                  value={summaryData.expenses?.costOfGoodsSold || 0}
                  suffix="د.ع"
                  valueStyle={{ color: "#cf1322" }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="إجمالي الربح"
                  value={summaryData.profit?.grossProfit || 0}
                  suffix="د.ع"
                  valueStyle={{
                    color:
                      (summaryData.profit?.grossProfit || 0) >= 0
                        ? "#3f8600"
                        : "#cf1322",
                  }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="هامش الربح"
                  value={summaryData.profit?.profitMargin || 0}
                  suffix="%"
                  valueStyle={{
                    color:
                      (summaryData.profit?.profitMargin || 0) >= 0
                        ? "#3f8600"
                        : "#cf1322",
                  }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Recent Invoices Table */}
        <Card title="الفواتير الأخيرة" className="mb-6">
          <Table
            columns={[
              {
                title: "رقم الفاتورة",
                dataIndex: "id",
                key: "id",
                width: 100,
              },
              {
                title: "نوع الفاتورة",
                dataIndex: "type",
                key: "type",
                width: 120,
                render: (type) => (
                  <Tag color={getInvoiceTypeColor(type)}>
                    {getInvoiceTypeLabel(type)}
                  </Tag>
                ),
              },
              {
                title: "الحالة",
                dataIndex: "status",
                key: "status",
                width: 120,
                render: (status) => (
                  <Tag color={getStatusColor(status)}>
                    {getStatusLabel(status)}
                  </Tag>
                ),
              },
              {
                title: "العميل/المورد",
                key: "customerSupplier",
                width: 200,
                render: (_, record) => (
                  <div>
                    <div className="font-medium">
                      {record.user?.name || "غير محدد"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.user?.phone || ""}
                    </div>
                  </div>
                ),
              },
              {
                title: "المبلغ الإجمالي",
                dataIndex: "totalCost",
                key: "totalCost",
                width: 120,
                render: (totalCost) => (
                  <span className="font-medium">
                    {totalCost?.toLocaleString()} د.ع
                  </span>
                ),
              },
              {
                title: "تاريخ الإنشاء",
                dataIndex: "createdAt",
                key: "createdAt",
                width: 120,
                render: (createdAt) => dayjs(createdAt).format("DD/MM/YYYY"),
              },
            ]}
            dataSource={invoices.slice(0, 10)}
            loading={invoicesLoading}
            rowKey="id"
            pagination={false}
            scroll={{ x: 800 }}
          />
        </Card>
      </div>
    );
  };

  // Profit & Loss Tab
  const renderProfitLoss = () => {
    if (!profitLossData) return <div>لا توجد بيانات</div>;

    const profitLossColumns = [
      {
        title: "البند",
        dataIndex: "item",
        key: "item",
      },
      {
        title: "المبلغ",
        dataIndex: "amount",
        key: "amount",
        render: (amount) => `${amount?.toLocaleString() || 0} د.ع`,
      },
    ];

    const profitLossTableData = [
      {
        key: "revenue",
        item: "إجمالي الإيرادات",
        amount: profitLossData.revenue?.totalRevenue || 0,
      },
      {
        key: "returns",
        item: "إرجاعات المبيعات",
        amount: profitLossData.revenue?.saleReturnsAmount || 0,
      },
      {
        key: "netRevenue",
        item: "صافي الإيرادات",
        amount: profitLossData.revenue?.netRevenue || 0,
        style: { fontWeight: "bold" },
      },
      {
        key: "cogs",
        item: "تكلفة البضاعة المباعة",
        amount: profitLossData.costOfGoodsSold?.totalCOGS || 0,
      },
      {
        key: "grossProfit",
        item: "إجمالي الربح",
        amount: profitLossData.profit?.grossProfit || 0,
        style: {
          fontWeight: "bold",
          color:
            (profitLossData.profit?.grossProfit || 0) >= 0 ? "green" : "red",
        },
      },
      {
        key: "margin",
        item: "هامش الربح (%)",
        amount: profitLossData.profit?.profitMargin || 0,
        render: (_, record) => `${record.amount.toFixed(2)}%`,
      },
    ];

    return (
      <div>
        <Card className="mb-6">
          <Table
            columns={profitLossColumns}
            dataSource={profitLossTableData}
            pagination={false}
            rowClassName={(record) => (record.style ? "font-bold" : "")}
          />
        </Card>

        {profitLossData.dailyStats && profitLossData.dailyStats.length > 0 && (
          <Card title="الاتجاه اليومي">
            <Table
              columns={[
                { title: "التاريخ", dataIndex: "date", key: "date" },
                {
                  title: "الإيرادات",
                  dataIndex: "revenue",
                  key: "revenue",
                  render: (val) => `${val?.toLocaleString() || 0} د.ع`,
                },
                {
                  title: "التكلفة",
                  dataIndex: "cogs",
                  key: "cogs",
                  render: (val) => `${val?.toLocaleString() || 0} د.ع`,
                },
                {
                  title: "الربح",
                  dataIndex: "profit",
                  key: "profit",
                  render: (val) => (
                    <span
                      style={{
                        color: (val || 0) >= 0 ? "green" : "red",
                      }}
                    >
                      {val?.toLocaleString() || 0} د.ع
                    </span>
                  ),
                },
              ]}
              dataSource={profitLossData.dailyStats}
              pagination={false}
            />
          </Card>
        )}
      </div>
    );
  };

  // Sales Report Tab
  const renderSalesReport = () => {
    if (!salesReportData) return <div>لا توجد بيانات</div>;

    return (
      <div>
        <Card title="المبيعات حسب الفترة" className="mb-6">
          <Table
            columns={[
              { title: "الفترة", dataIndex: "date", key: "date" },
              {
                title: "المبيعات",
                dataIndex: "sales",
                key: "sales",
                render: (val) => `${val?.toLocaleString() || 0} د.ع`,
              },
              {
                title: "الإرجاعات",
                dataIndex: "returns",
                key: "returns",
                render: (val) => `${val?.toLocaleString() || 0} د.ع`,
              },
              {
                title: "عدد المبيعات",
                dataIndex: "count",
                key: "count",
              },
              {
                title: "عدد الإرجاعات",
                dataIndex: "returnCount",
                key: "returnCount",
              },
            ]}
            dataSource={salesReportData.salesByPeriod || []}
            pagination={false}
          />
        </Card>

        {salesReportData.topProducts && (
          <Card title="أفضل المنتجات مبيعاً">
            <Table
              columns={[
                {
                  title: "المنتج",
                  dataIndex: "productName",
                  key: "productName",
                },
                {
                  title: "الكمية المباعة",
                  dataIndex: "quantity",
                  key: "quantity",
                },
                {
                  title: "الإيرادات",
                  dataIndex: "revenue",
                  key: "revenue",
                  render: (val) => `${val?.toLocaleString() || 0} د.ع`,
                },
                {
                  title: "التكلفة",
                  dataIndex: "cost",
                  key: "cost",
                  render: (val) => `${val?.toLocaleString() || 0} د.ع`,
                },
                {
                  title: "الربح",
                  key: "profit",
                  render: (_, record) => {
                    const profit = (record.revenue || 0) - (record.cost || 0);
                    return (
                      <span
                        style={{
                          color: profit >= 0 ? "green" : "red",
                        }}
                      >
                        {profit.toLocaleString()} د.ع
                      </span>
                    );
                  },
                },
              ]}
              dataSource={salesReportData.topProducts || []}
              pagination={false}
            />
          </Card>
        )}
      </div>
    );
  };

  // Detailed Invoices Tab
  const renderInvoices = () => {
    const invoiceColumns = [
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
          <Tag color={getInvoiceTypeColor(type)}>
            {getInvoiceTypeLabel(type)}
          </Tag>
        ),
      },
      {
        title: "الحالة",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (status) => (
          <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
        ),
      },
      {
        title: "العميل/المورد",
        key: "customerSupplier",
        width: 200,
        render: (_, record) => (
          <div>
            <div className="font-medium">{record.user?.name || "غير محدد"}</div>
            <div className="text-sm text-gray-500">
              {record.user?.phone || ""}
            </div>
          </div>
        ),
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
        render: (createdAt) => dayjs(createdAt).format("DD/MM/YYYY HH:mm"),
      },
      {
        title: "الملاحظات",
        dataIndex: "notes",
        key: "notes",
        width: 200,
        render: (notes) => notes || "-",
      },
    ];

    return (
      <Card>
        <Table
          columns={invoiceColumns}
          dataSource={invoices}
          loading={invoicesLoading}
          rowKey="id"
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `إجمالي ${total} فاتورة`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    );
  };

  return (
    <Container>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Title level={2}>التقارير التفصيلية</Title>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              تحديث
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              type="primary"
            >
              طباعة
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              type="default"
            >
              تصدير
            </Button>
          </Space>
        </div>

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
                value={reportType}
                onChange={setReportType}
                style={{ width: "100%" }}
              >
                <Select.Option value="all">جميع الأنواع</Select.Option>
                <Select.Option value="sale">بيع</Select.Option>
                <Select.Option value="saleReturn">إرجاع بيع</Select.Option>
                <Select.Option value="purchase">شراء</Select.Option>
                <Select.Option value="purchaseReturn">إرجاع شراء</Select.Option>
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
                onClick={() => {
                  setSearch("");
                  setReportType("all");
                  setDateRange([dayjs().subtract(30, "days"), dayjs()]);
                }}
                style={{ width: "100%" }}
              >
                إعادة تعيين
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "summary",
              label: (
                <span>
                  <BarChartOutlined />
                  الملخص
                </span>
              ),
              children: renderSummary(),
            },
            {
              key: "profit-loss",
              label: (
                <span>
                  <ArrowUpOutlined />
                  الأرباح والخسائر
                </span>
              ),
              children: renderProfitLoss(),
            },
            {
              key: "sales",
              label: (
                <span>
                  <PieChartOutlined />
                  تقرير المبيعات
                </span>
              ),
              children: renderSalesReport(),
            },
            {
              key: "invoices",
              label: (
                <span>
                  <FileTextOutlined />
                  الفواتير التفصيلية
                </span>
              ),
              children: renderInvoices(),
            },
          ]}
        />
      </div>
    </Container>
  );
};
