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
import { useWatch } from "antd/es/form/Form";
import { ImageIcon } from "lucide-react";

export const AddModal = ({
  showModal,
  setShowModal,
  getBanner,
  record,
  setRecord,
}) => {
  const [form] = Form.useForm();
  const [previewImage, setPreviewImage] = useState(null);
  const [image, setImage] = useState(null);
  const watchedBannerType = useWatch("BannerType", form);

  useEffect(() => {
    setImage(null);
    if (record) {
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

  const bannerType = [
    {
      label: "single",
      value: "single",
    },
    {
      label: "twoSides",
      value: "twoSides",
    },
    {
      label: "slider",
      value: "slider",
    },
    {
      label: "category",
      value: "category",
    },
    {
      label: "items",
      value: "items",
    },
    {
      label: "brand",
      value: "brand",
    },
  ];

  const onFinish = async (values) => {
    const data = {
      name: values.name,
      priority: values.priority,
      link: values.link,
      img: image,
      bannerType: values.BannerType,
    };
    try {
      const res = await fetcher({
        pathname: record ? `banner/${record.id}` : "banner",
        method: record ? "PUT" : "POST",
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

        {!record && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="BannerType"
                label="نوع الواجهة"
                rules={[{ required: true, message: "ادخل نوع الواجهة" }]}
              >
                <Select options={bannerType} />
              </Form.Item>
            </Col>
          </Row>
        )}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="link" label="رابط الواجهة">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="صورة الواجهة">
              <Upload.Dragger
                listType="text"
                action={`${URL}upload`}
                beforeUpload={beforeUpload}
                onChange={handleUpload}
                className="w-[100px] h-[100px]"
                showUploadList={false}
                disabled={watchedBannerType !== "single"}
              >
                <div className="flex items-center justify-center">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-500 flex items-center justify-center h-full gap-2">
                      اسحب صورة هنا أو انقر للتحميل <ImageIcon />
                    </div>
                  )}
                </div>
              </Upload.Dragger>
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end my-4">
          <Button type="primary" htmlType="submit">
            {record ? "تعديل الواجهة" : "اضافة الواجهة"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
