import React, { useEffect, useState } from "react";
import { Button, Modal, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { URL, IMAGE_URL, fetcher } from "../../../utils/api";
import { RiCloseLine } from "react-icons/ri";

export const ImagesModal = ({
  showModal,
  setShowModal,
  getProducts,
  record,
}) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (record?.images) {
      setImages(record.images);
    }
  }, [record]);

  const handleUpload = (info) => {
    const { status, response } = info.file;

    if (status === "done") {
      const filename = response?.filename || response?.filenames?.[0];
      if (filename) {
        setImages((prev) => [...prev, filename]);
        message.success(`${info.file.name} تم رفع الصورة بنجاح`);
      }
    } else if (status === "error") {
      message.error(`${info.file.name} فشل رفع الصورة`);
    }
  };

  const handleRemove = (file) => {
    setImages((prev) => prev.filter((img) => img !== file.name));
  };

  const beforeUpload = (file) => {
    const isUnder500KB = file.size / 1024 / 1024 < 0.5;
    if (!isUnder500KB) {
      message.error("الصورة يجب أن تكون أقل من 500 كيلوبايت");
    }
    return isUnder500KB || Upload.LIST_IGNORE;
  };

  const onOk = async () => {
    if (!record?.id) {
      message.error("لا يمكن تحديث المنتج بدون معرف صالح");
      return;
    }

    const updatedImages = Array.from(
      new Set([...(record.images || []), ...images])
    );

    const payload = {
      ...record,
      images: updatedImages,
    };

    try {
      const res = await fetcher({
        pathname: `product/${record.id}`,
        method: "PUT",
        data: payload,
        auth: true,
      });

      if (res?.success) {
        message.success("تم تحديث الصور بنجاح");
        getProducts();
        setShowModal(false);
      } else {
        message.error("فشل تحديث الصور");
      }
    } catch (err) {
      console.error(err);
      message.error("حدث خطأ أثناء تحديث المنتج");
    }
  };

  const handleCancel = () => {
    setImages([]);
    setShowModal(false);
  };

  useEffect(() => {
    console.log(images);
  }, [images]);

  return (
    <Modal
      open={showModal}
      title="أضف الصور"
      onCancel={handleCancel}
      width={600}
      onOk={onOk}
    >
      <div
        className="images"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "16px",
        }}
      >
        {images.map((img) => (
          <div className="relative">
            <img
              src={`${IMAGE_URL}${img}`}
              alt={img}
              key={img}
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #eee",
              }}
            />

            <RiCloseLine
              className="absolute top-0 right-0 text-lg bg-white rounded-lg border cursor-pointer"
              onClick={() => handleRemove(img)}
            />
          </div>
        ))}
        <Upload.Dragger
          listType="text"
          action={`${URL}upload`}
          beforeUpload={beforeUpload}
          onChange={handleUpload}
          onRemove={handleRemove}
          className="w-[100px] h-[100px]"
          showUploadList={false}
        >
          <div>
            <InboxOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload.Dragger>
      </div>
    </Modal>
  );
};
