import React, { useMemo, useState, useEffect } from "react";
import { Container } from "../../components/Container";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Table,
  message,
} from "antd";
import { IoSearchOutline } from "react-icons/io5";
import { DeleteOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../../utils/api";

export const Sales = () => {
  const [search, setSearch] = useState("");
  const [operationType, setOperationType] = useState("sale"); // sale or return
  const [currency, setCurrency] = useState("IQD");
  const [data, setData] = useState([
    {
      key: Date.now(),
      barcode: "",
      name: "",
      quantity: 1,
      price: "",
      total: 0,
      location: "",
    },
  ]);
  const [form] = Form.useForm();

  // Currency options with symbols and names
  const currencyOptions = [
    { value: "IQD", label: "دينار عراقي (د.ع)", symbol: "د.ع" },
    { value: "USD", label: "دولار أمريكي ($)", symbol: "$" },
  ];

  // Get current currency symbol
  const getCurrencySymbol = () => {
    return currencyOptions.find((c) => c.value === currency)?.symbol || "د.ع";
  };

  const {
    data: productsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["products", search],
    queryFn: async () => {
      try {
        const res = await fetcher({
          pathname: `product?search=${search}`,
          method: "GET",
          auth: true,
        });
        if (!res.success) throw new Error("Failed to fetch products");
        return res;
      } catch (error) {
        message.error("فشل في جلب المنتجات");
        return { data: [] };
      }
    },
    keepPreviousData: true,
  });

  const products = productsResponse?.data || [];

  const productOptions = useMemo(() => {
    return products.map((p) => ({
      value: p.id || p._id,
      label: p.name,
      data: p,
    }));
  }, [products]);

  const handleInputChange = (value, key, field) => {
    setData((prevData) =>
      prevData.map((item) => {
        if (item.key === key) {
          const newItem = { ...item, [field]: value };

          // Calculate total
          if (field === "quantity" || field === "price") {
            newItem.total =
              (Number(newItem.quantity) || 0) * (Number(newItem.price) || 0);
          }

          return newItem;
        }
        return item;
      })
    );
  };

  const addEmptyRow = () => {
    const newRow = {
      id: null,
      key: Date.now(),
      barcode: "",
      name: "",
      quantity: 1,
      price: 0,
      total: 0,
      location: "",
    };
    setData((prev) => [...prev, newRow]);
  };

  const deleteRow = (key) => {
    if (data.length === 1 && !data[0].name) {
      message.info("يجب أن يكون هناك صف واحد على الأقل");
      return;
    } else if (data.length === 1 && data[0].name) {
      setData((prev) => prev.filter((item) => item.key !== key));
      addEmptyRow();
      return;
    }
    setData((prev) => prev.filter((item) => item.key !== key));
  };

  const handleProductSelect = (value, option, recordKey) => {
    const productData = option.data;

    setData((prevData) =>
      prevData.map((item) => {
        if (item.key === recordKey) {
          const generalPrice =
            productData.generalPrice || productData.price || 0;
          return {
            ...item,
            id: productData.id,
            name: productData.name,
            barcode: productData.barcode || "",
            price: generalPrice,
            location: productData.location || "",
            total: (item.quantity || 1) * generalPrice,
          };
        }
        return item;
      })
    );
  };

  const grandTotal = useMemo(() => {
    return data.reduce((sum, item) => {
      return sum + Number(item.quantity || 0) * Number(item.price || 0);
    }, 0);
  }, [data]);

  const changeTab = (key) => {
    setOperationType(key);
    setData([
      {
        key: Date.now(),
        barcode: "",
        name: "",
        quantity: 1,
        price: "",
        total: 0,
        location: "",
      },
    ]);
    form.resetFields();
  };

  const submit = async () => {
    if (data?.[0]?.id === undefined || data?.[0]?.id === null) {
      message.info("يجب أن يكون هناك صف واحد على الأقل");
      return;
    }

    const customerName = form.getFieldValue("customerName");
    const customerPhone = form.getFieldValue("customerPhone");
    const address = form.getFieldValue("address");
    const notes = form.getFieldValue("notes");

    const payload = {
      items: data.map((item) => ({
        id: item.id,
        quantity: parseInt(item.quantity),
        cost: parseInt(item.price),
      })),
      address: address,
      user: {
        name: customerName,
        phone: customerPhone,
      },
      totalCost: grandTotal,
    };

    console.log(payload);

    try {
      const endpoint = operationType === "sale" ? "sales" : "salesReturn";
      const res = await fetcher({
        pathname: endpoint,
        method: "POST",
        data: payload,
        auth: true,
      });
      if (res.success) {
        message.success(
          operationType === "sale"
            ? "تم إنشاء فاتورة البيع بنجاح"
            : "تم إنشاء فاتورة إرجاع البيع بنجاح"
        );
        form.resetFields();
        setData([
          {
            key: Date.now(),
            barcode: "",
            name: "",
            quantity: 1,
            price: "",
            total: 0,
            location: "",
          },
        ]);
        refetch();
      } else {
        message.error(res.msg || "فشل في إنشاء الفاتورة");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      message.error("فشل في إنشاء الفاتورة");
    }
  };

  const columns = [
    {
      title: "ت",
      dataIndex: "key",
      key: "key",
      width: 50,
      render: (text, record, index) => index + 1,
    },
    {
      title: "المادة",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (text, record) => (
        <Select
          showSearch
          size="small"
          value={record.name || undefined}
          options={productOptions.filter(
            (option) =>
              !data.some(
                (item) => item.id === option.value && item.key !== record.key
              )
          )}
          onChange={(value, option) =>
            handleProductSelect(value, option, record.key)
          }
          onSearch={(value) => setSearch(value)}
          loading={isLoading}
          filterOption={(inputValue, option) => {
            const { name, barcode } = option.data;
            return (
              name?.toLowerCase().includes(inputValue.toLowerCase()) ||
              barcode?.toLowerCase().includes(inputValue.toLowerCase())
            );
          }}
          notFoundContent={isLoading ? "جاري البحث..." : "لا توجد منتجات"}
          placeholder="اختر المنتج"
          className="w-full text-right"
        />
      ),
    },
    {
      title: "المواقع",
      dataIndex: "location",
      key: "location",
      width: 150,
      render: (text, record) => <p placeholder="الموقع">{record.location}</p>,
    },
    {
      title: "الكمية",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (text, record) => (
        <Input
          size="small"
          type="number"
          min={1}
          value={record.quantity}
          onChange={(e) =>
            handleInputChange(e.target.value, record.key, "quantity")
          }
          placeholder="الكمية"
        />
      ),
    },
    {
      title: "الباركود",
      dataIndex: "barcode",
      key: "barcode",
      width: 150,
      render: (text, record) => <p placeholder="الباركود">{record.barcode}</p>,
    },
    {
      title: "السعر",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (text, record) => (
        <Input
          size="small"
          type="number"
          min={0}
          value={record.price}
          onChange={(e) =>
            handleInputChange(e.target.value, record.key, "price")
          }
          placeholder="السعر"
        />
      ),
    },
    {
      title: "المجموع",
      dataIndex: "total",
      key: "total",
      width: 120,
      render: (text, record) => {
        const total = Number(record.quantity || 0) * Number(record.price || 0);
        return (
          <span className="text-nowrap font-semibold">
            {total.toFixed(2)} {getCurrencySymbol()}
          </span>
        );
      },
    },
    {
      title: "حذف",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => deleteRow(record.key)}
          onKeyDown={(e) => {
            if (e.key === "Tab" && !record.name) {
              addEmptyRow();
            } else {
              e.preventDefault();
            }
          }}
          size="small"
        />
      ),
    },
  ];

  return (
    <Container width="100%">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {" "}
          {operationType === "sale" ? "فاتورة بيع جديدة" : "فاتورة إرجاع بيع"}
        </h1>

        <div className="flex items-center border border-gray-300 rounded-xl">
          <button
            className="px-4 py-2 rounded-r-xl"
            onClick={() => changeTab("sale")}
            style={{
              backgroundColor: operationType === "sale" ? "#FFED03" : "#FAFAFA",
              opacity: operationType === "sale" ? 1 : 0.5,
            }}
          >
            فاتورة مبيعات
          </button>
          <button
            className=" px-4 py-2 rounded-l-xl"
            onClick={() => changeTab("saleReturn")}
            style={{
              backgroundColor:
                operationType === "saleReturn" ? "#FFED03" : "#FAFAFA",
              opacity: operationType === "saleReturn" ? 1 : 0.5,
            }}
          >
            إرجاع مبيعات
          </button>
        </div>
      </div>

      <Form form={form} onFinish={submit} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              label="اسم الزبون"
              name="customerName"
              rules={[{ required: true, message: "اسم الزبون مطلوب" }]}
            >
              <Input placeholder="اسم الزبون" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="رقم هاتف الزبون" name="customerPhone">
              <Input showCount placeholder="رقم هاتف الزبون" maxLength={11} />
            </Form.Item>
          </Col>
          {operationType === "sale" && (
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="عنوان الزبون" name="address">
                <Input placeholder="عنوان الزبون" />
              </Form.Item>
            </Col>
          )}
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              label={operationType === "sale" ? "ملاحظات" : "سبب الإرجاع"}
              name="notes"
            >
              <Input
                placeholder={
                  operationType === "sale" ? "ملاحظات إضافية" : "سبب الإرجاع"
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="العملة" name="currency">
              <Select
                value={currency}
                onChange={(value) => setCurrency(value)}
                options={currencyOptions}
                defaultValue={currency}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="mb-4 mt-4 overflow-x-auto">
          <div className="flex justify-end mb-2">
            <Button type="dashed" onClick={addEmptyRow}>
              إضافة صف جديد
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: "max-content" }}
            rowKey="key"
            bordered
            summary={() => (
              <Table.Summary fixed="bottom">
                <Table.Summary.Row>
                  <Table.Summary.Cell
                    index={0}
                    colSpan={6}
                    className="text-right"
                  >
                    <strong>المجموع الكلي:</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={2}>
                    <span className="text-lg font-bold">
                      {grandTotal.toFixed(2)} {getCurrencySymbol()}
                    </span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <Button type="default">إلغاء</Button>
          <Button type="primary" htmlType="submit">
            {operationType === "sale"
              ? "حفظ فاتورة البيع"
              : "حفظ فاتورة الإرجاع"}
          </Button>
        </div>
      </Form>
    </Container>
  );
};
