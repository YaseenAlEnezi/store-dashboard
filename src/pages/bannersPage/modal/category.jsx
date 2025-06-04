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
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import { showNotification } from "../../../utils/Notification";
import { fetcher, IMAGE_URL, URL } from "../../../utils/api";
import { IoIosClose } from "react-icons/io";

export const Category = ({
  showModal,
  setShowModal,
  getBanner,
  record,
  setRecord,
}) => {
  const [form] = Form.useForm();
  const [categoryIDs, setCategoryIDs] = useState([]);
  const [selectedCategoryID, setSelectedCategoryID] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [image, setImage] = useState();

  useEffect(() => {
    if (record) {
      setSelectedCategoryID(record.categoryIDs);
      setPreviewImage(`${IMAGE_URL + record.img}`);
      setImage(record.img);
      form.setFieldsValue({
        name: record.name,
        priority: record.priority,
        link: record.link,
      });
    }
  }, [record]);

  const handleClose = () => {
    setShowModal(false);
    setRecord(null);
    form.resetFields();
    setPreviewImage(null);
    setImage(null);
  };

  const category = async () => {
    try {
      const res = await fetcher({
        pathname: "category",
        method: "GET",
        data: null,
        auth: true,
      });
      if (res) {
        setCategoryIDs(res.data);
      }
    } catch (error) {
      console.error("Error fetching single banners:", error);
      showNotification(
        "error",
        "Failed to fetch single banners",
        error.message
      );
    }
  };

  useEffect(() => {
    category();
  }, []);

  const onFinish = async (values) => {
    const data = {
      name: values.name,
      priority: values.priority,
      categoryIDs: selectedCategoryID,
    };
    try {
      const res = await fetcher({
        pathname: `banner/${record.id}`,
        method: "PUT",
        data: data,
        auth: true,
      });

      if (res.success) {
        showNotification("success", "banner added successfully", "");
        form.resetFields();
        setShowModal(false);
        setRecord(null);
        getBanner();
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
      onCancel={handleClose}
      width={600}
      title={record ? "تعديل الواجهة" : "اضافة الواجهة"}
    >
      <Form
        className="mt-4 -mb-5"
        form={form}
        onFinish={onFinish}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="اسم الواجهة"
              rules={[{ required: true, message: "ادخل اسم الواجهة" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="priority"
              label="ترتيب الواجهة"
              rules={[{ required: true, message: "ادخل ترتيب الواجهة" }]}
            >
              <InputNumber className="w-full" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="اختيار الاقسام">
              <Select
                mode="multiple"
                allowClear
                placeholder="اختيار الاقسام"
                value={selectedCategoryID}
                onChange={(value) => {
                  setSelectedCategoryID(value);
                }}
                options={categoryIDs.map((banner) => ({
                  label: banner.name,
                  value: banner.id,
                }))}
              />

              {selectedCategoryID?.length > 0 && (
                <div className="flex flex-col mt-2">
                  {selectedCategoryID.map((id) => {
                    const banner = categoryIDs.find((b) => b.id === id);
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between gap-3 mb-2 border-b p-2"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              banner?.img
                                ? IMAGE_URL + banner.img
                                : "/fallback.jpg"
                            }
                            alt={banner?.name || "غير معروف"}
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                          <span className="text-sm font-medium text-gray-800">
                            {banner?.name || "غير معروف"}
                          </span>
                        </div>
                        <button>
                          <IoIosClose
                            className="text-2xl text-red-500"
                            onClick={() => {
                              setSelectedCategoryID(
                                selectedCategoryID.filter((b) => b !== id)
                              );
                            }}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end my-4">
          <Button type="primary" htmlType="submit">
            {"تعديل الواجهة"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
