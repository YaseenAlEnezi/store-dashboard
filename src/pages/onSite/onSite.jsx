import React, { useMemo, useState, useEffect } from "react";
import { Container } from "../../components/Container";
import { Button, Col, Form, Input, InputNumber, Row, Select, Table, message } from "antd";
import { IoSearchOutline } from "react-icons/io5";
import { DeleteOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../../utils/api";

export const OnSite = () => {
  const [search, setSearch] = useState("");
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

  // Product data fetching
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

  // Generate product options for Select component
  const productOptions = useMemo(() => {
    return products.map((p) => ({
      value: p.id || p._id, // Use a unique ID instead of name for value
      label: p.name,
      data: p, // Store the full product data in the option
    }));
  }, [products]);

  // Handle input changes for any field
  const handleInputChange = (value, key, field) => {
    setData((prevData) =>
      prevData.map((item) => {
        if (item.key === key) {
          const newItem = { ...item, [field]: value };

          // Recalculate total when quantity or price changes
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

  // Add new empty row
  const addEmptyRow = () => {
    const newRow = {
      key: Date.now(),
      barcode: "",
      name: "",
      quantity: 1,
      price: "",
      total: 0,
      location: "",
    };
    setData((prev) => [...prev, newRow]);
  };

  // Delete row
  const deleteRow = (key) => {
    if (data.length === 1) {
      message.info("يجب أن يكون هناك صف واحد على الأقل");
      return;
    }
    setData((prev) => prev.filter((item) => item.key !== key));
  };

  // Handle product selection - FIXED VERSION
  const handleProductSelect = (value, option, recordKey) => {
    const productData = option.data;

    // Update the entire row at once to prevent React state update issues
    setData((prevData) =>
      prevData.map((item) => {
        if (item.key === recordKey) {
          return {
            ...item,
            name: productData.name,
            barcode: productData.barcode || "",
            price: productData.SellingPrice || 0,
            location: productData.location || "",
            total: (item.quantity || 1) * (productData.price || 0),
          };
        }
        return item;
      })
    );
  };

  // Calculate grand total
  const grandTotal = useMemo(() => {
    return data.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0),
      0
    );
  }, [data]);

  // Table columns configuration
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
          value={record.name || undefined}
          options={productOptions}
          onChange={(value, option) =>
            handleProductSelect(value, option, record.key)
          }
          onSearch={(value) => setSearch(value)}
          loading={isLoading}
          filterOption={false}
          notFoundContent={isLoading ? "جاري البحث..." : "لا توجد منتجات"}
          placeholder="اختر المنتج"
          className="w-full text-right"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "الباركود",
      dataIndex: "barcode",
      key: "barcode",
      width: 150,
      render: (text, record) => (
        <Input
          value={record.barcode}
          onChange={(e) =>
            handleInputChange(e.target.value, record.key, "barcode")
          }
          placeholder="الباركود"
        />
      ),
    },
    {
      title: "الكمية",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (text, record) => (
        <Input
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
      title: "السعر",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (text, record) => (
        <Input
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
      title: "المواقع",
      dataIndex: "location",
      key: "location",
      width: 150,
      render: (text, record) => (
        <Input
          value={record.location}
          onChange={(e) =>
            handleInputChange(e.target.value, record.key, "location")
          }
          placeholder="الموقع"
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
            {total.toFixed(2)} د.ع{" "}
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
          size="small"
        />
      ),
    },
  ];

  // Debug current state
  useEffect(() => {
    console.log("Current data:", data);
  }, [data]);

  return (
    <Container>
      <div className="mb-4 flex flex-wrap justify-between items-center">
        <h1 className="text-3xl font-bold">قائمة المنتجات</h1>
        <div className="flex justify-end items-center gap-4 mt-2 sm:mt-0">
          <Button
            type="primary"
            className="bg-[#FFED03] hover:bg-[#FFED03] text-black"
            onClick={addEmptyRow}
          >
            اضافة صف
          </Button>
        </div>
      </div>

      <Form form={form} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="الزبون" name="customerName">
              <Input placeholder="الزبون" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="رقم هاتف الزبون" name="customerPhone">
              <Input placeholder="رقم هاتف الزبون" />
            </Form.Item>
          </Col>
        </Row>

        <div className="mb-4 mt-4 overflow-x-auto">
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
                      {grandTotal.toFixed(2)} د.ع
                    </span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <Button type="default">إلغاء</Button>
          <Button
            type="primary"
            onClick={() => {
              console.log("Submitted data:", data);
              message.success("تم حفظ القائمة بنجاح");
            }}
          >
            حفظ القائمة
          </Button>
        </div>
      </Form>
    </Container>
  );
};
