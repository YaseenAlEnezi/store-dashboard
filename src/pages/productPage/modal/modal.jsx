import { Col, Form, Input, Modal, Row } from "antd";
import React, { useEffect } from "react";

export const ModalForm = ({
  showModal,
  setShowModal,
  getProducts,
  record,
  setRecord,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        username: record.username,
        name: record.name,
      });
    }
  });
  const onFinish = async (values) => {
    try {
      // Send the values to your API
      const res = await fetcher({
        pathname: record ? `/admins/${record.id}` : "/register",
        method: record ? "PUT" : "POST",
        data: record
          ? { name: values.name, username: values.username }
          : {
              name: values.name,
              username: values.username,
              password: values.password,
            },
        auth: true,
      });

      if (res.success) {
        showNotification(
          "success",
          record ? "User updated successfully" : "User added successfully",
          ""
        );
        form.resetFields();
        setShowModal(false);
        setRecord(null);
        getProducts();
      } else {
        showNotification("error", "Failed to add user", res.message || "");
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  return (
    <Modal open={showModal} width={500}>
      <Form>
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="اسم المنتج"
              rules={[{ required: true, message: "ادخل اسم المنتج" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="description"
              label="وصف المنتج"
              rules={[{ required: true, message: "ادخل وصف المنتج" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
