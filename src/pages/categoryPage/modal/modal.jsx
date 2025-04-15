import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  Upload,
} from "antd";
import React, { useEffect, useState } from "react";
import { fetcher, IMAGE_URL, URL } from "../../../utils/api";
import { showNotification } from "../../../utils/Notification";
import { RiCloseLine, RiImageAddLine } from "react-icons/ri";

export const ModalForm = ({
  showModal,
  setShowModal,
  getCategory,
  record,
  setRecord,
}) => {
  const [form] = Form.useForm();
  const [image, setImage] = useState(null);

  const createImgProps = () => ({
    name: "file",
    multiple: false,
    maxCount: 1,
    action: `${URL}upload`, // Fixed string interpolation
    beforeUpload: (file) => {
      const isUnder500KB = file.size / 1024 / 1024 < 0.5;
      if (!isUnder500KB) {
        message.error("الصورة يجب أن تكون أقل من 500 كيلوبايت");
      }
      return isUnder500KB || Upload.LIST_IGNORE;
    },
    onRemove: async () => {
      setImage(null);
    },
    onChange(info) {
      const { status, response } = info.file;
      if (status === "done" && response?.filename) {
        setImage(response.filename); // Save uploaded image URL
        message.success(`${response.filename} تم رفع الصورة بنجاح`);
      } else if (status === "error") {
        message.error(`${info.file.name} فشل رفع الصورة`);
      }
    },
  });

  useEffect(() => {
    if (record) {
      setImage(record.img);
      form.setFieldsValue(record);
    }
  }, [record]); // Added dependency to prevent infinite loop

  const onFinish = async (values) => {
    values.img = image;
    try {
      const res = await fetcher({
        pathname: record ? `category/${record.id}` : "category", // Ensure record.id exists
        method: record ? "PUT" : "POST",
        data: values,
        auth: true,
      });

      if (res.success) {
        showNotification(
          "success",
          record ? "category updated successfully" : "category added successfully",
          ""
        );
        form.resetFields();
        setShowModal(false);
        setImage(null);
        setRecord(null);
        getCategory();
      } else {
        showNotification("error", "Failed to add user", res.message || "");
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const modalTitle = record
    ? "تعديل القسم"
    : "اضافة القسم"; // Improved readability

  return (
    <Modal
      open={showModal}
      footer={null}
      destroyOnClose
      centered
      onCancel={() => {
        setShowModal(false);
        setImage(null);
        setRecord(null);
        form.resetFields();
      }}
      width={600}
      title={modalTitle} // Used variable for title
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
              label="اسم القسم"
              rules={[{ required: true, message: "ادخل اسم القسم" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item>
              {image ? (
                <div className="w-full rounded-[12px] border border-gray-400 relative overflow-hidden">
                  <img
                    src={IMAGE_URL + image}
                    className="object-cover w-full h-full"
                  />

                  <RiCloseLine
                    onClick={() => setImage(null)}
                    className="absolute top-1 right-1 w-[30px] h-[30px] bg-[#FFED03] rounded-lg border border-gray-400 flex items-center justify-center"
                  />
                </div>
              ) : (
                <Upload.Dragger
                  key="logo"
                  {...createImgProps()}
                  height={100}
                  width={100}
                  className="rounded-[12px] border border-[#000] relative"
                >
                  <RiImageAddLine className="text-[#000] text-[30px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </Upload.Dragger>
              )}
            </Form.Item>
          </Col>
        </Row>
        <div className="flex justify-end my-4">
          <Button type="primary" htmlType="submit">
            {record ? "تعديل القسم" : "اضافة القسم"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
