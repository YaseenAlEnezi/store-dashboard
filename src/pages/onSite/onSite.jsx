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
      price: "",
      total: 0,
      location: "",
    };
    setData((prev) => [...prev, newRow]);
  };

  const deleteRow = (key) => {
    if (data.length === 1) {
      message.info("يجب أن يكون هناك صف واحد على الأقل");
      return;
    }
    setData((prev) => prev.filter((item) => item.key !== key));
  };

  const handleProductSelect = (value, option, recordKey) => {
    const productData = option.data;

    setData((prevData) =>
      prevData.map((item) => {
        if (item.key === recordKey) {
          return {
            ...item,
            id: productData.id,
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

  const grandTotal = useMemo(() => {
    return data.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0),
      0
    );
  }, [data]);

  const submit = async () => {
    if (data?.[0]?.id === undefined || data?.[0]?.id === null) {
      message.info("يجب أن يكون هناك صف واحد على الأقل");
      return;
    }
    const payload = {
      user: {
        name: form.getFieldValue("customerName"),
        phone: parseInt(form.getFieldValue("customerPhone")),
      },
      items: data.map((item) => ({
        id: item.id,
        quantity: parseInt(item.quantity),
        price: parseInt(item.price),
      })),
      orderType: "onSite",
    };

    console.log(payload);

    try {
      const res = await fetcher({
        pathname: "create-order",
        method: "POST",
        data: payload,
        auth: true,
      });
      if (res.success) {
        message.success("تم اضافة المنتجات بنجاح");
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
        message.error("فشل في اضافة المنتجات");
      }
    } catch (error) {
      message.error("فشل في اضافة المنتجات");
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
          value={record.name || undefined}
          options={productOptions.filter(
            (option) =>
              !data.some(
                (item) => item.name === option.label && item.key !== record.key
              )
          )}
          onChange={(value, option) =>
            handleProductSelect(value, option, record.key)
          }
          onSearch={(value) => setSearch(value)}
          loading={isLoading}
          filterOption={(inputValue, option) =>
            option.label.includes(inputValue)
          }
          notFoundContent={isLoading ? "جاري البحث..." : "لا توجد منتجات"}
          placeholder="اختر المنتج"
          className="w-full text-right"
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
      onCell: (record) => ({
        onKeyDown: (e) => {
          if (e.key === "Enter" && record?.location != "") {
            addEmptyRow();
          }
        },
      }),
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

  return (
    <Container>
      <div className="mb-4 flex flex-wrap justify-between items-center">
        <h1 className="text-3xl font-bold">فاتورة البيع</h1>
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

      <Form form={form} onFinish={submit} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              label="اسم الزبون"
              name="customerName"
              rules={[{ required: true, message: "أسم الزبون مطلوب" }]}
            >
              <Input placeholder="اسم الزبون" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              label="رقم هاتف الزبون"
              name="customerPhone"
              rules={[
                { required: true, message: "رقم هاتف الزبون مطلوب" },
                { min: 11, message: "رقم هاتف الزبون يجب أن يكون 11 رقم" },
                { max: 11, message: "رقم هاتف الزبون يجب أن يكون 11 رقم" },
                {
                  validator(_, value) {
                    if (value.startsWith("07")) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("رقم هاتف الزبون يجب ان يبدا ب 07")
                    );
                  },
                },
              ]}
            >
              <Input showCount placeholder="رقم هاتف الزبون" maxLength={11} />
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
            render={() => (
              <>
                <Table.Row>
                  <Table.Cell colSpan={6} className="text-right">
                    <strong>المجموع الكلي:</strong>
                  </Table.Cell>
                  <Table.Cell colSpan={2}>
                    <span className="text-lg font-bold">
                      {grandTotal.toFixed(2)} د.ع
                    </span>
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell colSpan={8} className="text-right">
                    <strong>إضافة صف جديد:</strong>
                  </Table.Cell>
                </Table.Row>
              </>
            )}
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
          <Button type="primary" htmlType="submit">
            حفظ القائمة
          </Button>
        </div>
      </Form>
    </Container>
  );
};
