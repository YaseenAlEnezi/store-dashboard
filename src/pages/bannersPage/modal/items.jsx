import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import { showNotification } from "../../../utils/Notification";
import { fetcher, IMAGE_URL, URL } from "../../../utils/api";
import { IoIosClose } from "react-icons/io";
import { Image } from "lucide-react";

export const Items = ({
  showModal,
  setShowModal,
  getBanner,
  record,
  setRecord,
}) => {
  const [form] = Form.useForm();
  const [itemsIDs, setItemsIDs] = useState([]);
  const [selectedItemsIDs, setSelectedItemsIDs] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [image, setImage] = useState();

  useEffect(() => {
    if (record) {
      setSelectedItemsIDs(record.productIDs || []);
      setSelectedProducts(record.products || []);
      setPreviewImage(
        record.img ? `${IMAGE_URL + record.img}` : "/fallback.jpg"
      );
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

  const items = async () => {
    try {
      const res = await fetcher({
        pathname: `product?search=${search}&page=1&pageSize=10`,
        method: "GET",
        data: null,
        auth: true,
      });
      if (res) {
        setItemsIDs(res.data);
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
    items();
  }, [search]);

  const onFinish = async (values) => {
    const data = {
      name: values.name,
      priority: values.priority,
      productIDs: selectedItemsIDs,
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
            <Form.Item label="اختيار العلامة التجارية">
              <Select
                mode="multiple"
                allowClear
                placeholder="اختيار العلامة التجارية"
                value={selectedItemsIDs}
                onSearch={setSearch}
                onChange={(value) => {
                  setSelectedItemsIDs(value);
                  const selected = itemsIDs.filter((p) => value.includes(p.id));
                  setSelectedProducts(selected);
                }}
                options={itemsIDs.map((banner) => ({
                  label: banner.name,
                  value: banner.id,
                }))}
              />

              {selectedItemsIDs?.length > 0 && (
                <div className="flex flex-col mt-2">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-3 mb-2 border-b p-2"
                    >
                      <div className="flex items-center gap-2">
                        {product?.images?.length > 0 ? (
                          <img
                            src={IMAGE_URL + product.images[0]}
                            alt={product.name}
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-md">
                            <Image className="w-8 h-8 text-gray-400 object-cover" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-800">
                          {product.name}
                        </span>
                      </div>
                      <button>
                        <IoIosClose
                          className="text-2xl text-red-500"
                          onClick={() => {
                            const filtered = selectedItemsIDs.filter(
                              (id) => id !== product.id
                            );
                            setSelectedItemsIDs(filtered);
                            setSelectedProducts(
                              selectedProducts.filter(
                                (p) => p.id !== product.id
                              )
                            );
                          }}
                        />
                      </button>
                    </div>
                  ))}
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
