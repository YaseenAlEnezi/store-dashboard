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
  Upload,
} from "antd";
import React, { useEffect, useState } from "react";
import { fetcher } from "../../../utils/api";
import { showNotification } from "../../../utils/Notification";

export const ModalForm = ({
  showModal,
  setShowModal,
  getBrand,
  record,
  setRecord,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (record) {
      form.setFieldsValue(record);
    }
  });
  const onFinish = async (values) => {
    try {
      const res = await fetcher({
        pathname: record ? `brand/${record.id}` : "brand",
        method: record ? "PUT" : "POST",
        data: values,
        auth: true,
      });

      if (res.success) {
        showNotification(
          "success",
          record ? "brand updated successfully" : "brand added successfully",
          ""
        );
        form.resetFields();
        setShowModal(false);
        setRecord(null);
        getBrand();
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
      centered
      onCancel={() => {
        setShowModal(false), setRecord(null), form.resetFields();
      }}
      width={600}
      title={record ? "تعديل العلامة التجارية" : "اضافة العلامة التجارية"}
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
              label="اسم العلامة التجارية"
              rules={[{ required: true, message: "ادخل اسم العلامة التجارية" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item>
              <Upload.Dragger
                maxCount={1}
                listType="picture"
                beforeUpload={() => false}
              >
                <div className="flex items-center justify-center">
                  <img
                    src={record?.image}
                    alt=""
                    className="w-[100px] h-[100px] object-cover"
                  />
                </div>
              </Upload.Dragger>
            </Form.Item>
          </Col>
        </Row>
        <div className="flex justify-end my-4">
          <Button type="primary" htmlType="submit">
            {record ? "تعديل العلامة التجارية" : "اضافة العلامة التجارية"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
