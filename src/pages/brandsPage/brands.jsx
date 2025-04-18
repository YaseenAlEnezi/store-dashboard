import React, { useEffect, useState } from "react";
import { Container } from "../../components/Container";
import { Button, Table, Input, Popconfirm, Typography, Pagination } from "antd";
import { showNotification } from "../../utils/Notification";
import { fetcher } from "../../utils/api";
import { ModalForm } from "./modal/modal";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export const BrandPage = () => {
  const [brand, setBrand] = useState([]);
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

  const getBrand = async () => {
    try {
      const response = await fetcher({
        pathname: `brand?page=${page}&pageSize=${pageSize}&search=${search}`,
        method: "GET",
        data: null,
        auth: true,
      });
      if (response.success) {
        setBrand(response.data);
        setTotal(response.total);
      }
    } catch (error) {
      showNotification("error", "Failed to fetch brand", "");
      console.log(error);
    }
  };

  const deleteBrand = async (id) => {
    try {
      const response = await fetcher({
        pathname: `brand/${id}`,
        method: "DELETE",
        data: null,
        auth: true,
      });
      getBrand();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getBrand();
  }, [page, pageSize, search]);

  const columns = [
    {
      title: "الصوره",
      dataIndex: "image",
      key: "image",
      render: (text, record) => (
        <img
          className="w-12 h-12 object-cover rounded"
          src={record.image}
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
            onConfirm={() => deleteBrand(record.id)}
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
          <h1 className="text-3xl font-bold">العلامات التجارية</h1>
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
          dataSource={brand}
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
          getBrand={getBrand}
          record={record}
          setRecord={setRecord}
        />
      </Container>
    </div>
  );
};
