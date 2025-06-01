import { Form, Input, Modal } from "antd";
import React from "react";

export const EditModal = ({ open, setOpen, record, setRecord }) => {
  return (
    <Modal
      title="تعديل حالة الطلب"
      open={open}
      onOk={() => {
        setOpen(false);
      }}
      onCancel={() => {
        setOpen(false);
      }}
      width={400}
    >
      <Form
        initialValues={record}
        onFinish={(values) => {
          setRecord((prev) => ({
            ...prev,
            ...values,
          }));
          setOpen(false);
        }}
        layout="vertical"
        className="w-full"
      >
        <Form.Item
          name="quantity"
          label="الكمية"
          rules={[{ required: true, message: "حالة الطلب مطلوبة" }]}
        >
          <Input
            type="number"
            placeholder="الكمية"
            className="w-full"
            defaultValue={record?.quantity}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
