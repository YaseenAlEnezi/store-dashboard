import { Modal, Input, Spin, message } from "antd";
import { useState, useEffect } from "react";

export const SettingsModal = ({ show, setShow, settings, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [localSettings, setLocalSettings] = useState([]);

  // Update local settings when props change
  useEffect(() => {
    if (settings && Array.isArray(settings)) {
      setLocalSettings([...settings]);
    }
  }, [settings]);

  const handleChange = (e, name) => {
    const newValue = e.target.value;
    setLocalSettings((prev) =>
      prev.map((setting) =>
        setting.name === name ? { ...setting, value: newValue } : setting
      )
    );
  };

  const handleSave = async () => {
    if (!onUpdate) return;

    setLoading(true);
    try {
      await onUpdate(localSettings);
      message.success("تم حفظ الإعدادات بنجاح");
      setShow(false);
    } catch (error) {
      message.error("فشل في حفظ الإعدادات");
      console.error("Error updating settings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!settings || !Array.isArray(settings) || settings.length === 0) {
    return (
      <Modal
        open={show}
        onCancel={() => setShow(false)}
        footer={null}
        title="الاعدادات"
      >
        <div className="flex flex-col gap-4 p-4">
          <div className="text-center text-gray-500">
            {!settings ? "جاري التحميل..." : "لا توجد إعدادات"}
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={show}
      onCancel={() => setShow(false)}
      onOk={handleSave}
      confirmLoading={loading}
      title="الاعدادات"
      okText="حفظ"
      cancelText="إلغاء"
    >
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-4">
          {localSettings.map((setting) => (
            <div key={setting.name} className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                {setting.name === "deliveryPrice"
                  ? "سعر التوصيل"
                  : setting.name === "dollarPrice"
                  ? "سعر الدولار"
                  : setting.name}
              </label>
              <Input
                value={setting.value || ""}
                onChange={(e) => handleChange(e, setting.name)}
                placeholder={`أدخل ${
                  setting.name === "deliveryPrice"
                    ? "سعر التوصيل"
                    : setting.name === "dollarPrice"
                    ? "سعر الدولار"
                    : setting.name
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
