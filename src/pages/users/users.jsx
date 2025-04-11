import React, { useEffect, useState } from "react";
import { Container } from "../../components/Container";
import { Button, Table, Input, Popconfirm } from "antd";
import {
  DeleteOutlined,
  SearchOutlined,
  UserSwitchOutlined,
  RetweetOutlined,
} from "@ant-design/icons";
import { showNotification } from "../../utils/Notification";
import { fetcher } from "../../utils/api";
import { ModalForm } from "./modal/modal";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [record, setRecord] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const getUsers = async () => {
    try {
      const response = await fetcher({
        pathname: "admins",
        method: "GET",
        data: null,
        auth: true,
      });
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      showNotification("error", "Failed to fetch users", "");
      console.log(error);
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetcher({
        pathname: `admins/${id}`,
        method: "DELETE",
        data: null,
        auth: true,
      });
      getUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const resetPassword = async (id) => {
    try {
      const response = await fetcher({
        pathname: `reset-password/${id}`,
        method: "PUT",
        data: null,
        auth: true,
      });
      getUsers();
    } catch (error) {
      console.log(error);
    }
  };

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
        <UserSwitchOutlined
          onClick={() => {
            setShowModal(true), setRecord(record);
          }}
          className="text-blue-500 text-xl cursor-pointer"
        />
      ),
    },
    {
      title: "ارجاع كلمة المرور",
      dataIndex: "reset",
      key: "reset",
      render: (text, record) => (
        <Popconfirm
          title="هل أنت متأكد؟"
          description="هل أنت متأكد من ارجاع كلمة المرور؟"
          onConfirm={() => resetPassword(record.id)}
          okText="ارجاع"
          cancelText="اغلاق"
        >
          <RetweetOutlined className="text-blue-500 text-xl cursor-pointer" />
        </Popconfirm>
      ),
    },
  ];

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
                setRecord(null);
              }}
            >
              اضافة
            </Button>
          </div>
        </div>
        <Table columns={columns} dataSource={users} pagination={false} />
        <ModalForm
          showModal={showModal}
          setShowModal={setShowModal}
          getUsers={getUsers}
          record={record}
          setRecord={setRecord}
        />
      </Container>
    </div>
  );
};
