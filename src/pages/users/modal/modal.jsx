import { Button, Col, Form, Input, Modal, Row } from "antd";
import React, { useEffect } from "react";
import { fetcher } from "../../../utils/api";
import { showNotification } from "../../../utils/Notification";

export const ModalForm = ({
  showModal,
  setShowModal,
  getUsers,
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
        pathname: record ? `admins/${record.id}` : "register",
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
        getUsers();
      } else {
        showNotification("error", "Failed to add user", res.message || "");
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  return (
    <Modal
      open={showModal}
      footer={null}
      destroyOnClose
      onCancel={() => {
        setShowModal(false), setRecord(null), form.resetFields();
      }}
      width={600}
      title={record ? "تعديل مستخدم" : "اضافة مستخدم"}
    >
      <Form
        className="mt-[16px] -mb-[20px]"
        form={form}
        onFinish={onFinish}
        layout="vertical"
      >
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Form.Item
              label="اسم"
              name="name"
              rules={[{ required: true, message: "الحقل مطلوب!" }]}
            >
              <Input placeholder="اسم" />
            </Form.Item>
          </Col>
          {!record && (
            <Col span={12}>
              <Form.Item
                label="كلمة المرور"
                name="password"
                rules={[{ required: true, message: "الحقل مطلوب!" }]}
              >
                <Input.Password placeholder="كلمة المرور" />
              </Form.Item>
            </Col>
          )}
          <Col span={12}>
            <Form.Item
              label="اسم المستخدم"
              name="username"
              rules={[{ required: true, message: "الحقل مطلوب!" }]}
            >
              <Input placeholder="اسم المستخدم" />
            </Form.Item>
          </Col>
        </Row>
        <div className="flex justify-start gap-4 my-4 border-t pt-4">
          <Button type="primary" htmlType="submit">
            حفظ
          </Button>
          <Button
            onClick={() => {
              setShowModal(false), setRecord(null);
            }}
          >
            اغلاق
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
