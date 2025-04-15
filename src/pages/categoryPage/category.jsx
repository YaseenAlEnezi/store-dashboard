import React, { useEffect, useState } from "react";
import { Container } from "../../components/Container";
import { Button, Table, Input, Popconfirm, Typography, Pagination } from "antd";
import { showNotification } from "../../utils/Notification";
import { fetcher, IMAGE_URL } from "../../utils/api";
import { ModalForm } from "./modal/modal";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export const CategoryPage = () => {
  const [category, setCategory] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [record, setRecord] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const itemRender = (_, type, originalElement) => {
    if (type === "prev") {
      return (
        <div className="flex w-full h-full items-center justify-center">
          <IoIosArrowForward className="text-2xl" />
        </div>
      );
    }
    if (type === "next") {
      return (
        <div className="flex w-full h-full items-center justify-center">
          <IoIosArrowBack className="text-2xl" />
        </div>
      );
    }
    return originalElement;
  };

  const getCategory = async () => {
    try {
      const response = await fetcher({
        pathname: `category?page=${page}&pageSize=${pageSize}&search=${search}`,
        method: "GET",
        data: null,
        auth: true,
      });
      if (response.success) {
        setCategory(response.data);
        setTotal(response.total);
      }
    } catch (error) {
      showNotification("error", "Failed to fetch category", "");
      console.log(error);
    }
  };

  const deleteCategory = async (id) => {
    try {
      const response = await fetcher({
        pathname: `category/${id}`,
        method: "DELETE",
        data: null,
        auth: true,
      });
      getCategory();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCategory();
  }, [page, pageSize, search]);

  const columns = [
    {
      title: "الصوره",
      dataIndex: "image",
      key: "image",
      render: (text, record) =>
        !record?.img ? (
          <div className="w-12 h-12 object-cover rounded-md bg-gray-200"></div>
        ) : (
          <img
            className="w-12 h-12 object-cover border border-gray-400 rounded-md"
            src={IMAGE_URL + record.img}
            alt=""
          />
        ),
    },
    {
      title: "ألاسم",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Typography.Text strong>{text}</Typography.Text>
      ),
    },
    {
      title: "تعديل",
      dataIndex: "edit",
      key: "edit",
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <Popconfirm
            title="هل أنت متأكد؟"
            description="هل أنت متأكد من حذف الحساب؟"
            onConfirm={() => deleteCategory(record.id)}
            okText="حذف"
            cancelText="ألغاء"
          >
            <MdDeleteOutline className="text-red-500 text-xl cursor-pointer" />
          </Popconfirm>
          <FaRegEdit
            onClick={() => {
              setShowModal(true), setRecord(record);
            }}
            className="text-blue-500 text-xl cursor-pointer"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Container>
        <div className="mb-4 flex justify-between">
          <h1 className="text-3xl font-bold">ألاقسام</h1>
          <div className="flex justify-end items-end w-1/4 gap-4">
            <Input
              placeholder="بحث عن مستخدم"
              type="text"
              prefix={<IoSearchOutline className="text-xl" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              type="primary"
              className="bg-[#FFED03] hover:bg-[#FFED03] text-black"
              onClick={() => {
                setShowModal(true);
                setRecord(null);
              }}
            >
              اضافة
            </Button>
          </div>
        </div>
        <Table
          className="mt-4"
          columns={columns}
          dataSource={category}
          pagination={false}
        />
        <Pagination
          defaultCurrent={1}
          total={total}
          onChange={(e) => setPage(e)}
          showSizeChanger={false}
          itemRender={itemRender}
          className="mt-4"
        />
        <ModalForm
          showModal={showModal}
          setShowModal={setShowModal}
          getCategory={getCategory}
          record={record}
          setRecord={setRecord}
        />
      </Container>
    </div>
  );
};
