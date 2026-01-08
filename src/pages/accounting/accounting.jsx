import React, { useState } from "react";
import { Container } from "../../components/Container";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  DatePicker,
  Select,
  Button,
  Tabs,
  message,
  Space,
  Typography,
  Divider,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  ArrowUpOutlined,
  FileTextOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../../utils/api";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export const Accounting = () => {
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);
  const [period, setPeriod] = useState("month");
  const [activeTab, setActiveTab] = useState("summary");

  // Financial Summary Query
  const {
    data: summaryData,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["accounting-summary", period],
    queryFn: async () => {
      try {
        const res = await fetcher({
          pathname: `accounting/summary?period=${period}`,
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
  });

  // Profit & Loss Query
  const {
    data: profitLossData,
    isLoading: profitLossLoading,
    refetch: refetchProfitLoss,
  } = useQuery({
    queryKey: ["accounting-profit-loss", dateRange],
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

  // Balance Sheet Query
  const {
    data: balanceSheetData,
    isLoading: balanceSheetLoading,
    refetch: refetchBalanceSheet,
  } = useQuery({
    queryKey: ["accounting-balance-sheet"],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange && dateRange[1]) {
          params.append("asOfDate", dateRange[1].toISOString());
        }
        const res = await fetcher({
          pathname: `accounting/balance-sheet?${params.toString()}`,
          method: "GET",
          auth: true,
        });
        if (!res.success) throw new Error("Failed to fetch balance sheet");
        return res.data;
      } catch (error) {
        message.error("فشل في جلب الميزانية العمومية");
        return null;
      }
    },
    enabled: activeTab === "balance-sheet",
  });

  // Cash Flow Query
  const {
    data: cashFlowData,
    isLoading: cashFlowLoading,
    refetch: refetchCashFlow,
  } = useQuery({
    queryKey: ["accounting-cash-flow", dateRange],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange && dateRange[0] && dateRange[1]) {
          params.append("startDate", dateRange[0].toISOString());
          params.append("endDate", dateRange[1].toISOString());
        }
        const res = await fetcher({
          pathname: `accounting/cash-flow?${params.toString()}`,
          method: "GET",
          auth: true,
        });
        if (!res.success) throw new Error("Failed to fetch cash flow");
        return res.data;
      } catch (error) {
        message.error("فشل في جلب قائمة التدفقات النقدية");
        return null;
      }
    },
    enabled: activeTab === "cash-flow",
  });

  // Sales Report Query
  const {
    data: salesReportData,
    isLoading: salesReportLoading,
    refetch: refetchSalesReport,
  } = useQuery({
    queryKey: ["accounting-sales-report", dateRange],
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
    enabled: activeTab === "sales-report",
  });

  const handleRefresh = () => {
    refetchSummary();
    if (activeTab === "profit-loss") refetchProfitLoss();
    if (activeTab === "balance-sheet") refetchBalanceSheet();
    if (activeTab === "cash-flow") refetchCashFlow();
    if (activeTab === "sales-report") refetchSalesReport();
  };

  // Summary Tab Content
  const renderSummary = () => {
    if (!summaryData) return <div>لا توجد بيانات</div>;

    return (
      <div>
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="إجمالي الإيرادات"
                value={summaryData.revenue?.total || 0}
                prefix={<DollarOutlined />}
                suffix="د.ع"
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="تكلفة البضاعة المباعة"
                value={summaryData.expenses?.costOfGoodsSold || 0}
                prefix={<ShoppingCartOutlined />}
                suffix="د.ع"
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="إجمالي الربح"
                value={summaryData.profit?.grossProfit || 0}
                prefix={<ArrowUpOutlined />}
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
          <Col span={6}>
            <Card>
              <Statistic
                title="هامش الربح"
                value={summaryData.profit?.profitMargin || 0}
                prefix={<BarChartOutlined />}
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

        <Row gutter={16} className="mb-6">
          <Col span={8}>
            <Card>
              <Statistic
                title="الذمم المدينة"
                value={summaryData.accounts?.receivable || 0}
                suffix="د.ع"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="الذمم الدائنة"
                value={summaryData.accounts?.payable || 0}
                suffix="د.ع"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="قيمة المخزون"
                value={summaryData.inventory?.value || 0}
                suffix="د.ع"
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // Profit & Loss Tab Content
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

  // Balance Sheet Tab Content
  const renderBalanceSheet = () => {
    if (!balanceSheetData) return <div>لا توجد بيانات</div>;

    return (
      <div>
        <Row gutter={16}>
          <Col span={12}>
            <Card title="الأصول">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>المخزون:</Text>{" "}
                  {balanceSheetData.assets?.inventory?.toLocaleString() || 0}{" "}
                  د.ع
                </div>
                <div>
                  <Text strong>الذمم المدينة:</Text>{" "}
                  {balanceSheetData.assets?.accountsReceivable?.toLocaleString() ||
                    0}{" "}
                  د.ع
                </div>
                <Divider />
                <div>
                  <Text strong>إجمالي الأصول:</Text>{" "}
                  {balanceSheetData.assets?.totalAssets?.toLocaleString() || 0}{" "}
                  د.ع
                </div>
              </Space>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="الخصوم وحقوق الملكية">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>الذمم الدائنة:</Text>{" "}
                  {balanceSheetData.liabilities?.accountsPayable?.toLocaleString() ||
                    0}{" "}
                  د.ع
                </div>
                <div>
                  <Text strong>الأرباح المحتجزة:</Text>{" "}
                  {balanceSheetData.equity?.retainedEarnings?.toLocaleString() ||
                    0}{" "}
                  د.ع
                </div>
                <Divider />
                <div>
                  <Text strong>إجمالي الخصوم وحقوق الملكية:</Text>{" "}
                  {balanceSheetData.balance?.totalLiabilitiesAndEquity?.toLocaleString() ||
                    0}{" "}
                  د.ع
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // Cash Flow Tab Content
  const renderCashFlow = () => {
    if (!cashFlowData) return <div>لا توجد بيانات</div>;

    return (
      <Card>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <div>
            <Title level={4}>الأنشطة التشغيلية</Title>
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text>النقد من المبيعات:</Text>{" "}
                  {cashFlowData.operatingActivities?.cashFromSales?.toLocaleString() ||
                    0}{" "}
                  د.ع
                </div>
                <div>
                  <Text>النقد من إرجاعات المبيعات:</Text>{" "}
                  {cashFlowData.operatingActivities?.cashFromSaleReturns?.toLocaleString() ||
                    0}{" "}
                  د.ع
                </div>
                <div>
                  <Text>النقد من الطلبات:</Text>{" "}
                  {cashFlowData.operatingActivities?.cashFromOrders?.toLocaleString() ||
                    0}{" "}
                  د.ع
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text>النقد للمشتريات:</Text>{" "}
                  {cashFlowData.operatingActivities?.cashToPurchases?.toLocaleString() ||
                    0}{" "}
                  د.ع
                </div>
                <div>
                  <Text>النقد من إرجاعات المشتريات:</Text>{" "}
                  {cashFlowData.operatingActivities?.cashToPurchaseReturns?.toLocaleString() ||
                    0}{" "}
                  د.ع
                </div>
              </Col>
            </Row>
            <Divider />
            <div>
              <Text strong>صافي التدفق النقدي من الأنشطة التشغيلية:</Text>{" "}
              <span
                style={{
                  color:
                    (cashFlowData.operatingActivities?.netCashFromOperations ||
                      0) >= 0
                      ? "green"
                      : "red",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                {cashFlowData.operatingActivities?.netCashFromOperations?.toLocaleString() ||
                  0}{" "}
                د.ع
              </span>
            </div>
          </div>
        </Space>
      </Card>
    );
  };

  // Sales Report Tab Content
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

  return (
    <Container>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Title level={2}>التقارير المحاسبية</Title>
          <Space>
            <Select
              value={period}
              onChange={setPeriod}
              style={{ width: 120 }}
              options={[
                { label: "اليوم", value: "day" },
                { label: "الأسبوع", value: "week" },
                { label: "الشهر", value: "month" },
                { label: "السنة", value: "year" },
              ]}
            />
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="YYYY-MM-DD"
            />
            <Button onClick={handleRefresh}>تحديث</Button>
          </Space>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "summary",
              label: (
                <span>
                  <FileTextOutlined />
                  الملخص المالي
                </span>
              ),
              children: renderSummary(),
            },
            {
              key: "profit-loss",
              label: (
                <span>
                  <ArrowUpOutlined />
                  قائمة الأرباح والخسائر
                </span>
              ),
              children: renderProfitLoss(),
            },
            {
              key: "balance-sheet",
              label: (
                <span>
                  <BarChartOutlined />
                  الميزانية العمومية
                </span>
              ),
              children: renderBalanceSheet(),
            },
            {
              key: "cash-flow",
              label: (
                <span>
                  <DollarOutlined />
                  قائمة التدفقات النقدية
                </span>
              ),
              children: renderCashFlow(),
            },
            {
              key: "sales-report",
              label: (
                <span>
                  <PieChartOutlined />
                  تقرير المبيعات
                </span>
              ),
              children: renderSalesReport(),
            },
          ]}
        />
      </div>
    </Container>
  );
};
