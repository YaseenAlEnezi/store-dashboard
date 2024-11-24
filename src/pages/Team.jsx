import React, { useEffect, useState } from "react";
import { Container } from "../components/Container";
import { Button, Table, Input, Modal, Upload, Popconfirm } from "antd";
import {
  DeleteOutlined,
  SearchOutlined,
  UserSwitchOutlined,
  RetweetOutlined,
  CloseOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { NumericFormat } from "react-number-format";
import { showNotification } from "../utils/Notification";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export const Team = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState([]);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };
  const handleChange = ({ file, fileList: newFileList }) => {
    setFileList(newFileList);
    if (file.status === "done") {
      // Set the preview image to the uploaded file's URL from the server response
      const uploadedPath = file.response?.path;
      if (uploadedPath) {
        setPreviewImage(uploadedPath);
      }
    }
  };
  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );

  const handelAddUser = async () => {
    if (!name || !username || !password || !walletBalance) {
      showNotification("warning", "تحذير", "يجب تعبئة جميع الحقول");
      return;
    }
    try {
      const response = await fetch(
        "https://api.car5x.com/api/v1/dashboard/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            username,
            password,
            walletBalance,
            image: previewImage, // Send the correct image path
          }),
        }
      );

      const res = await response.json();
      if (res.success) {
        showNotification("success", "User added successfully", "");
        setFileList([]);
        setPreviewImage("");
        setName("");
        setUsername("");
        setPassword("");
        setWalletBalance(0);
        setShowModal(false);
        getUsers(); // Refresh user list
      } else {
        showNotification("error", "Failed to add user", res.message || "");
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const getUsers = async () => {
    try {
      const response = await fetch(
        "https://api.car5x.com/api/v1/dashboard/admins"
      );
      const data = await response.json(); // Convert the response to JSON
      console.log(data);

      if (data.success) {
        showNotification("success", "تم جلب البيانات بنجاح", "");
        setUsers(data.data); // Update the state with the users data
      }
    } catch (error) {
      console.log(error); // Log any errors that occur
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(
        `https://api.car5x.com/api/v1/dashboard/admins/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json(); // Convert the response to JSON
      getUsers();
      console.log(data);
    } catch (error) {
      console.log(error); // Log any errors that occur
    }
  };

  useEffect(() => {
    console.log(users);
  }, [users]);

  useEffect(() => {
    getUsers();
  }, []);

  const columns = [
    {
      title: "ت",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "ألاسم",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "أسم المستخدم",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "الحساب",
      dataIndex: "walletbalance",
      key: "walletbalance",
      render: (text, record) => (
        <NumericFormat
          value={record.walletbalance}
          displayType="text"
          thousandSeparator=","
          prefix="د.ع"
        />
      ),
    },
    {
      title: "حذف",
      dataIndex: "delete",
      key: "delete",
      render: (text, record) => (
        <Popconfirm
          title="هل أنت متأكد؟"
          description="هل أنت متأكد من حذف الحساب؟"
          onConfirm={() => deleteUser(record.id)}
          okText="حذف"
          cancelText="ألغاء"
        >
          <DeleteOutlined className="text-red-500 text-xl cursor-pointer" />
        </Popconfirm>
      ),
    },
    {
      title: "تعديل",
      dataIndex: "edit",
      key: "edit",
      render: (text, record) => (
        <UserSwitchOutlined className="text-blue-500 text-xl cursor-pointer" />
      ),
    },
    {
      title: "ارجاع كلمة المرور",
      dataIndex: "reset",
      key: "reset",
      render: (text, record) => (
        <RetweetOutlined className="text-blue-500 text-xl cursor-pointer" />
      ),
    },
  ];

  const totalWalletBalance = users.reduce(
    (total, user) => total + parseInt(user.walletbalance),
    0
  );
  return (
    <div>
      <Container>
        <div className="mb-4 flex justify-between">
          <h1 className="text-3xl font-bold">المستخدمين</h1>
          <div className="flex justify-end items-end w-1/4 gap-4">
            <Input
              placeholder="بحث عن مستخدم"
              type="text"
              prefix={<SearchOutlined className="text-xl" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              type="primary"
              onClick={() => {
                setShowModal(true);
              }}
            >
              اضافة
            </Button>
          </div>
        </div>
        <Table columns={columns} dataSource={users} pagination={false} />
        <div className="text-xl font-bold bg-[#F5F6FB] p-4">
          مجموع حسابات المستخدمين:{" "}
          <NumericFormat
            value={totalWalletBalance}
            displayType="text"
            thousandSeparator=","
            prefix="د.ع"
          />
        </div>
        <Modal open={showModal} footer={null} header={null} closable={false}>
          <Container>
            <div>
              <h1 className="text-3xl font-bold">اضافة مستخدم</h1>
              <button>
                <CloseOutlined
                  className="text-2xl cursor-pointer"
                  onClick={() => setShowModal(false)}
                />
              </button>
            </div>
            <div className="border-t " />
            <div className="flex flex-col gap-1 w-[70%] my-4">
              <p>أسم المستخدم</p>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p>ألاسم</p>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
              <p>كلمة المرور</p>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />
              <p>الحساب</p>
              <Input
                value={walletBalance}
                onChange={(e) => setWalletBalance(e.target.value)}
              />
            </div>
            <p className="mb-4">صورة المستخدم</p>
            <Upload
              action="https://api.car5x.com/upload"
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              maxCount={1} // Restrict to one image
              beforeUpload={(file) => {
                const isImage = file.type.startsWith("image/");
                if (!isImage) {
                  showNotification("error", "يجب تحميل صورة فقط", "");
                  return Upload.LIST_IGNORE;
                }
                const isSmallEnough = file.size / 1024 / 1024 < 5; // 5MB limit
                if (!isSmallEnough) {
                  showNotification(
                    "error",
                    "يجب أن يكون حجم الصورة أقل من 5 ميجابايت",
                    ""
                  );
                  return Upload.LIST_IGNORE;
                }
                return true;
              }}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
            {previewImage && (
              <Modal
                open={previewOpen}
                footer={null}
                onCancel={() => setPreviewOpen(false)}
              >
                <img
                  alt="Preview"
                  style={{ width: "100%" }}
                  src={previewImage}
                  onChange={() => console.log("change")}
                />
              </Modal>
            )}
            <div className="flex justify-start gap-4 mt-4 border-t pt-4">
              <Button
                type="primary"
                onClick={() => {
                  handelAddUser();
                }}
              >
                حفظ
              </Button>
              <Button onClick={() => setShowModal(false)}>اغلاق</Button>
            </div>
          </Container>
        </Modal>
      </Container>
    </div>
  );
};
