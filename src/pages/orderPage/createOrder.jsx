import React, { useState, useEffect } from "react";
import { Container } from "../../components/Container";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  Typography,
  Card,
  Row,
  Col,
  Divider,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import { fetcher } from "../../utils/api";
import { showNotification } from "../../utils/Notification";
import { IoArrowBack } from "react-icons/io5";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

const { Option } = Select;

export const CreateOrderPage = () => {
  const [form] = Form.useForm();
  const [orderType, setOrderType] = useState("sale");
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = async () => {
    try {
      const response = await fetcher({
        pathname: "product",
        method: "GET",
        auth: true,
      });
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      showNotification("error", "فشل في جلب المنتجات", "");
    }
  };

  const addProduct = () => {
    const newProduct = {
      id: null,
      quantity: 1,
      cost: 0,
    };
    setSelectedProducts([...selectedProducts, newProduct]);
  };

  const removeProduct = (index) => {
    const newProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(newProducts);
  };

  const updateProduct = (index, field, value) => {
    const newProducts = [...selectedProducts];
    newProducts[index][field] = value;
    setSelectedProducts(newProducts);
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      const product = products.find((p) => p.id === item.id);
      if (orderType === "purchase") {
        return total + item.cost * item.quantity;
      } else {
        return total + (product?.generalPrice || 0) * item.quantity;
      }
    }, 0);
  };

  const onFinish = async (values) => {
    if (selectedProducts.length === 0) {
      message.error("يرجى إضافة منتج واحد على الأقل");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        ...values,
        orderType,
        items: selectedProducts.map((item) => {
          const product = products.find((p) => p.id === item.id);
          return {
            id: item.id,
            quantity: item.quantity,
            cost: orderType === "purchase" ? item.cost : undefined,
            buyingPrice: orderType === "purchase" ? item.cost : undefined,
          };
        }),
        totalCost: orderType === "purchase" ? calculateTotal() : undefined,
      };

      const response = await fetcher({
        pathname: "create-order",
        method: "POST",
        data: orderData,
        auth: true,
      });

      if (response.success) {
        showNotification("success", "تم إنشاء الطلب بنجاح", "");
        navigate("/order");
      }
    } catch (error) {
      showNotification("error", "فشل في إنشاء الطلب", "");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "المنتج",
      dataIndex: "id",
      key: "id",
      render: (_, record, index) => (
        <Select
          placeholder="اختر المنتج"
          value={record.id}
          onChange={(value) => updateProduct(index, "id", value)}
          style={{ width: "100%" }}
        >
          {products.map((product) => (
            <Option key={product.id} value={product.id}>
              {product.name} - الكمية المتوفرة: {product.quantity}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "الكمية",
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record, index) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => updateProduct(index, "quantity", value)}
          style={{ width: "100%" }}
        />
      ),
    },
    ...(orderType === "purchase"
      ? [
          {
            title: "سعر الشراء",
            dataIndex: "cost",
            key: "cost",
            render: (_, record, index) => (
              <InputNumber
                min={0}
                value={record.cost}
                onChange={(value) => updateProduct(index, "cost", value)}
                style={{ width: "100%" }}
              />
            ),
          },
        ]
      : []),
    {
      title: "الإجراءات",
      key: "actions",
      render: (_, record, index) => (
        <Button
          type="text"
          danger
          icon={<AiOutlineMinus />}
          onClick={() => removeProduct(index)}
        />
      ),
    },
  ];

  return (
    <div>
      <Container>
        <div className="mb-4 flex items-center gap-4">
          <Button icon={<IoArrowBack />} onClick={() => navigate("/order")}>
            رجوع
          </Button>
          <h1 className="text-3xl font-bold">
            إنشاء طلب {orderType === "purchase" ? "شراء" : "بيع"}
          </h1>
        </div>

        <Card className="mb-6">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="نوع الطلب">
                <Select
                  value={orderType}
                  onChange={setOrderType}
                  style={{ width: "100%" }}
                >
                  <Option value="sale">بيع</Option>
                  <Option value="purchase">شراء</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="العنوان">
                <Input placeholder="عنوان التوصيل" />
              </Form.Item>
            </Col>
          </Row>

          {orderType === "purchase" && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="اسم المورد">
                  <Input placeholder="اسم المورد" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="رقم هاتف المورد">
                  <Input placeholder="رقم الهاتف" />
                </Form.Item>
              </Col>
            </Row>
          )}

          {orderType === "sale" && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="اسم العميل">
                  <Input placeholder="اسم العميل" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="رقم هاتف العميل">
                  <Input placeholder="رقم الهاتف" />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Card>

        <Card title="المنتجات" className="mb-6">
          <div className="mb-4">
            <Button
              type="dashed"
              icon={<AiOutlinePlus />}
              onClick={addProduct}
              block
            >
              إضافة منتج
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={selectedProducts}
            pagination={false}
            rowKey={(record, index) => index}
          />

          {selectedProducts.length > 0 && (
            <div className="mt-4 text-right">
              <Typography.Title level={4}>
                الإجمالي: {calculateTotal().toLocaleString("en")} د.ع
              </Typography.Title>
            </div>
          )}
        </Card>

        <div className="flex justify-end gap-4">
          <Button onClick={() => navigate("/order")}>إلغاء</Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={loading}
            disabled={selectedProducts.length === 0}
          >
            إنشاء الطلب
          </Button>
        </div>
      </Container>
    </div>
  );
};
