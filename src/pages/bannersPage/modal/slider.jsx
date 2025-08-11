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
import { safeJsonParse } from "../../../utils/jsonParser";
import { IoIosClose } from "react-icons/io";

export const Slider = ({
  showModal,
  setShowModal,
  getBanner,
  record,
  setRecord,
}) => {
  const [form] = Form.useForm();
  const [bannerIDs, setBannerIDs] = useState([]);
  const [selectedBannerID, setSelectedBannerID] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [image, setImage] = useState();

  useEffect(() => {
    if (record) {
      // Parse bannerIDs JSON string to array using utility function
      const bannerIDsArray = safeJsonParse(record.bannerIDs, []);
      setSelectedBannerID(bannerIDsArray);
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

  const singleBanners = async () => {
    try {
      const res = await fetcher({
        pathname: "banner/singles",
        method: "GET",
        data: null,
        auth: true,
      });
      if (res) {
        setBannerIDs(res.data);
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
    singleBanners();
  }, []);

  const onFinish = async (values) => {
    const data = {
      name: values.name,
      priority: values.priority,
      bannerIDs: selectedBannerID,
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
  const beforeUpload = (file) => {
    const isUnder500KB = file.size / 1024 / 1024 < 0.5;
    if (!isUnder500KB) {
      message.error("الصورة يجب أن تكون أقل من 500 كيلوبايت");
    }
    return isUnder500KB || Upload.LIST_IGNORE;
  };
  const handleUpload = (info) => {
    const { status, response } = info.file;

    if (status === "done") {
      const filename = response?.filename || response?.filenames?.[0];
      if (filename) {
        setImage(filename);
        setPreviewImage(response.url);
        message.success(`${info.file.name} تم رفع الصورة بنجاح`);
      }
    } else if (status === "error") {
      message.error(`${info.file.name} فشل رفع الصورة`);
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
            <Form.Item label="اختيار واجهة">
              <Select
                mode="multiple"
                allowClear
                placeholder="اختر واجهات"
                value={selectedBannerID}
                onChange={(value) => {
                  setSelectedBannerID(value);
                }}
                options={bannerIDs.map((banner) => ({
                  label: banner.name,
                  value: banner.id,
                }))}
              />

              {selectedBannerID?.length > 0 && (
                <div className="flex flex-col mt-2">
                  {selectedBannerID.map((id) => {
                    const banner = bannerIDs.find((b) => b.id === id);
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
                        <IoIosClose
                          className="text-2xl text-red-500"
                          onClick={() => {
                            setSelectedBannerID(
                              selectedBannerID.filter((b) => b !== id)
                            );
                          }}
                        />
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
