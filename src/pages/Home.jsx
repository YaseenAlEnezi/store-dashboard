import React, { useState, useEffect } from "react";
import { Container } from "../components/Container";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Tag,
  Space,
  Progress,
  Typography,
  Divider,
} from "antd";
import {
  ShoppingCartOutlined,
  ShoppingOutlined,
  UndoOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../utils/api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalReturns: 0,
    totalRevenue: 0,
    totalCost: 0,
    profit: 0,
    profitMargin: 0,
  });

  const { data: ordersResponse, isLoading: ordersLoading } = useQuery({
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
        console.error("Error fetching orders:", error);
        return { data: [] };
      }
    },
  });

  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const res = await fetcher({
          pathname: "product",
          method: "GET",
          auth: true,
        });
        if (!res.success) throw new Error("Failed to fetch products");
        return res;
      } catch (error) {
        console.error("Error fetching products:", error);
        return { data: [] };
      }
    },
  });

  useEffect(() => {
    if (ordersResponse?.data) {
      calculateStats(ordersResponse.data);
    }
  }, [ordersResponse]);

  const calculateStats = (orders) => {
    let totalSales = 0;
    let totalPurchases = 0;
    let totalReturns = 0;
    let totalRevenue = 0;
    let totalCost = 0;

    orders.forEach((order) => {
      const cost = order.totalCost || 0;

      switch (order.orderType) {
        case "sale":
          totalSales++;
          totalRevenue += cost;
          break;
        case "purchase":
          totalPurchases++;
          totalCost += cost;
          break;
        case "saleReturn":
          totalReturns++;
          totalRevenue -= cost;
          break;
        case "purchaseReturn":
          totalReturns++;
          totalCost -= cost;
          break;
      }
    });

    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    setStats({
      totalSales,
      totalPurchases,
      totalReturns,
      totalRevenue,
      totalCost,
      profit,
      profitMargin,
    });
  };

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

  const recentOrders = ordersResponse?.data?.slice(0, 5) || [];
  const products = productsResponse?.data || [];

  const recentOrdersColumns = [
    {
      title: "رقم الطلب",
      dataIndex: "id",
      key: "id",
      width: 80,
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
      title: "التكلفة",
      dataIndex: "totalCost",
      key: "totalCost",
      width: 100,
      render: (cost) => (
        <span className="font-medium">
          {cost ? `${cost.toLocaleString()} د.ع` : "غير محدد"}
        </span>
      ),
    },
    {
      title: "التاريخ",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
  ];

  const quickActions = [
    {
      title: "فاتورة بيع جديدة",
      icon: <ShoppingCartOutlined className="text-2xl" />,
      color: "bg-green-500",
      action: () => navigate("/sales"),
    },
    {
      title: "فاتورة شراء جديدة",
      icon: <ShoppingOutlined className="text-2xl" />,
      color: "bg-blue-500",
      action: () => navigate("/purchasing"),
    },
    {
      title: "إدارة الطلبات",
      icon: <ShoppingOutlined className="text-2xl" />,
      color: "bg-purple-500",
      action: () => navigate("/order"),
    },
    {
      title: "إدارة المنتجات",
      icon: <ShoppingOutlined className="text-2xl" />,
      color: "bg-orange-500",
      action: () => navigate("/product"),
    },
  ];

  return (
    <Container width="100%">
      <div className="mb-6">
        <Title level={2} className="mb-2">
          لوحة التحكم
        </Title>
        <Text type="secondary">مرحباً بك في نظام إدارة المتجر</Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="إجمالي المبيعات"
              value={stats.totalSales}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="إجمالي المشتريات"
              value={stats.totalPurchases}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="إجمالي الإرجاعات"
              value={stats.totalReturns}
              prefix={<UndoOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="إجمالي الإيرادات"
              value={stats.totalRevenue.toLocaleString()}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#722ed1" }}
              suffix="د.ع"
            />
          </Card>
        </Col>
      </Row>

      {/* Financial Overview */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="نظرة عامة مالية" className="h-full">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Text>إجمالي التكاليف:</Text>
                <Text strong className="text-red-500">
                  {stats.totalCost.toLocaleString()} د.ع
                </Text>
              </div>
              <div className="flex justify-between items-center">
                <Text>صافي الربح:</Text>
                <Text
                  strong
                  className={
                    stats.profit >= 0 ? "text-green-500" : "text-red-500"
                  }
                >
                  {stats.profit.toLocaleString()} د.ع
                </Text>
              </div>
              <Divider />
              <div className="flex justify-between items-center">
                <Text>هامش الربح:</Text>
                <Text
                  strong
                  className={
                    stats.profitMargin >= 0 ? "text-green-500" : "text-red-500"
                  }
                >
                  {stats.profitMargin.toFixed(2)}%
                </Text>
              </div>
              <Progress
                percent={Math.min(Math.abs(stats.profitMargin), 100)}
                status={stats.profitMargin >= 0 ? "success" : "exception"}
                strokeColor={stats.profitMargin >= 0 ? "#52c41a" : "#ff4d4f"}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="إجراءات سريعة" className="h-full">
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  type="text"
                  className={`h-24 hover:opacity-80 border-1 border-gray-300 `}
                  onClick={action.action}
                  block
                >
                  <div className="flex flex-col items-center space-y-2">
                    {action.icon}
                    <Text className=" text-sm">{action.title}</Text>
                  </div>
                </Button>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders and Products */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="آخر الطلبات"
            extra={
              <Button type="link" onClick={() => navigate("/order")}>
                عرض الكل
              </Button>
            }
          >
            <Table
              columns={recentOrdersColumns}
              dataSource={recentOrders}
              loading={ordersLoading}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="إحصائيات المنتجات"
            extra={
              <Button type="link" onClick={() => navigate("/product")}>
                عرض الكل
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Text>إجمالي المنتجات:</Text>
                <Text strong>{products.length}</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text>المنتجات المتوفرة:</Text>
                <Text strong className="text-green-500">
                  {products.filter((p) => (p.stock || 0) > 0).length}
                </Text>
              </div>
              <div className="flex justify-between items-center">
                <Text>المنتجات غير المتوفرة:</Text>
                <Text strong className="text-red-500">
                  {products.filter((p) => (p.stock || 0) <= 0).length}
                </Text>
              </div>
              <Divider />
              <div className="text-center">
                <Text type="secondary">توزيع المخزون</Text>
                <div className="mt-2">
                  <Progress
                    percent={
                      products.length > 0
                        ? (products.filter((p) => (p.stock || 0) > 0).length /
                            products.length) *
                          100
                        : 0
                    }
                    status="active"
                    strokeColor="#1890ff"
                  />
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
