import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";
import { fetcher } from "../../../utils/api";
import { showNotification } from "../../../utils/Notification";

export const ModalForm = ({
  showModal,
  setShowModal,
  getProducts,
  record,
  setRecord,
}) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [currentKeyword, setCurrentKeyword] = useState("");

  const getCategories = async () => {
    try {
      const response = await fetcher({
        pathname: "category",
        method: "GET",
        data: null,
        auth: true,
      });
      if (response.success) {
        response.data.map((item) => {
          setCategories((prev) => [
            ...prev,
            { label: item.name, value: item.id },
          ]);
        });
      }
    } catch (error) {
      showNotification("error", "Failed to fetch categories", "");
      console.log(error);
    }
  };

  const getBrands = async () => {
    try {
      const response = await fetcher({
        pathname: "brand",
        method: "GET",
        data: null,
        auth: true,
      });
      if (response.success) {
        response.data.map((item) => {
          setBrands((prev) => [...prev, { label: item.name, value: item.id }]);
        });
      }
    } catch (error) {
      showNotification("error", "Failed to fetch brands", "");
      console.log(error);
    }
  };

  useEffect(() => {
    getCategories();
    getBrands();
  }, []);

  const handleAddKeyword = () => {
    const trimmed = currentKeyword.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setCurrentKeyword("");
    }
  };

  const handleRemoveKeyword = (removedTag) => {
    setKeywords(keywords.filter((kw) => kw !== removedTag));
  };

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        ...record,
        category: record.category?.id || record.categoryID || null,
        brand: record.brand?.id || record.brandID || null,
      });
      setKeywords(record.keywords || []);
    }
  }, [record]);
  const onFinish = async (values) => {
    try {
      const payload = {
        ...values,
        categoryID: values.category,
        brandID: values.brand,
        keywords,
      };

      const res = await fetcher({
        pathname: record ? `product/${record.id}` : "/product",
        method: record ? "PUT" : "POST",
        data: payload,
        auth: true,
      });

      if (res.success) {
        showNotification(
          "success",
          record ? "تم تعديل المنتج بنجاح" : "تم اضافة المنتج بنجاح",
          ""
        );
        form.resetFields();
        setShowModal(false);
        setRecord(null);
        getProducts();
      } else {
        showNotification("error", "فشل في الحفظ", res.message || "");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };


  return (
    <Modal
      open={showModal}
      footer={null}
      destroyOnClose
      centered
      onCancel={() => {
        setShowModal(false), setRecord(null), form.resetFields();
      }}
      width={600}
      title={record ? "تعديل منتج" : "اضافة منتج"}
    >
      <Form
        className="mt-[16px] -mb-[20px]"
        form={form}
        onFinish={onFinish}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="اسم المنتج"
              rules={[{ required: true, message: "ادخل اسم المنتج" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="description"
              label="وصف المنتج"
              rules={[{ required: true, message: "ادخل وصف المنتج" }]}
            >
              <Input.TextArea />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="shortDescription" label="وصف قصير">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="buyingPrice" label="سعر الشراء">
              <InputNumber className="w-full" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="SellingPrice"
              label="سعر البيع"
              rules={[{ required: true, message: "ادخل سعر المنتج" }]}
            >
              <InputNumber className="w-full" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="quantity"
              label="كمية المنتج"
              rules={[{ required: true, message: "ادخل كمية المنتج" }]}
            >
              <InputNumber className="w-full" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="category" label="قسم المنتج">
              <Select options={categories} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="brand" label="ماركة المنتج">
              <Select options={brands} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="barcode" label="الباركود">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item label="كلمات مفتاحية">
              <div className="flex gap-2 items-center w-full">
                <Input
                  className="w-full"
                  value={currentKeyword}
                  onChange={(e) => setCurrentKeyword(e.target.value)}
                  onPressEnter={handleAddKeyword}
                />
                <Button type="primary" onClick={handleAddKeyword}>
                  اضافة
                </Button>
              </div>
              <div className="mt-2">
                {keywords.map((keyword, index) => (
                  <Tag
                    key={index}
                    closable
                    color="blue"
                    className="text-lg"
                    onClose={() => handleRemoveKeyword(keyword)}
                  >
                    {keyword}
                  </Tag>
                ))}
              </div>
            </Form.Item>
          </Col>
        </Row>
        <div className="flex justify-end my-4">
          <Button type="primary" htmlType="submit">
            {record ? "تعديل المنتج" : "اضافة منتج"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
