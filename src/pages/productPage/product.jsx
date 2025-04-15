import React, { useState } from "react";
import { Container } from "../../components/Container";
import {
  Button,
  Table,
  Input,
  Popconfirm,
  Typography,
  Pagination,
  Avatar,
  Spin,
} from "antd";
import { useQuery, useMutation } from "@tanstack/react-query";
import { showNotification } from "../../utils/Notification";
import { fetcher, IMAGE_URL } from "../../utils/api";
import { ModalForm } from "./modal/modal";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { ImagesModal } from "./modal/imageModal";
import { AiOutlinePlus } from "react-icons/ai";

export const ProductPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [record, setRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showModalImages, setShowModalImages] = useState(false);

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

  const {
    data: productsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["products", page, pageSize, search],
    queryFn: async () => {
      const res = await fetcher({
        pathname: `product?page=${page}&pageSize=${pageSize}&search=${search}`,
        method: "GET",
        auth: true,
      });
      if (!res.success) throw new Error("Failed to fetch products");
      return res;
    },
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) =>
      await fetcher({
        pathname: `product/${id}`,
        method: "DELETE",
        auth: true,
      }),
    onSuccess: () => {
      refetch();
    },
    onError: (err) => {
      showNotification("error", "فشل الحذف", err.message);
    },
  });

  const product = productsResponse?.data || [];
  const total = productsResponse?.total || 0;

  const columns = [
    {
      title: "ت",
      dataIndex: "index",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "ألاسم",
      dataIndex: "name",
      key: "name",
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: "الوصف",
      dataIndex: "shortDescription",
      key: "shortDescription",
      render: (text) => (
        <Typography.Text className="text-gray-500">{text}</Typography.Text>
      ),
    },
    {
      title: "الكمية",
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => (
        <Typography.Text className="text-gray-700" strong>
          {text}
        </Typography.Text>
      ),
    },
    {
      title: "الشراء",
      dataIndex: "buyingPrice",
      key: "buyingPrice",
      render: (text) => (
        <Typography.Text className="text-gray-700" strong>
          {text.toLocaleString("en")} د.ع
        </Typography.Text>
      ),
    },
    {
      title: "البيع",
      dataIndex: "SellingPrice",
      key: "SellingPrice",
      render: (text) => (
        <Typography.Text className="text-gray-700" strong>
          {text.toLocaleString("en")} د.ع
        </Typography.Text>
      ),
    },
    {
      title: "الصور",
      dataIndex: "images",
      key: "images",
      render: (_, record) => (
        <div className="grid grid-cols-9 w-full max-w-[250px]">
          {record?.images?.map((image, index) => (
            <Avatar
              key={index}
              src={IMAGE_URL + image}
              size="small"
              className="w-6 h-6 object-cover my-1 border border-gray-200 cursor-pointer rounded"
            />
          ))}
          <Avatar
            size="small"
            onClick={() => {
              setShowModalImages(true);
              setRecord(record);
            }}
            className="w-6 h-6 object-cover my-1 rounded cursor-pointer"
          >
            <AiOutlinePlus className="text-lg" />
          </Avatar>
        </div>
      ),
    },
    {
      title: "تعديل",
      dataIndex: "edit",
      key: "edit",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Popconfirm
            title="هل أنت متأكد؟"
            description="هل أنت متأكد من حذف الحساب؟"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="حذف"
            cancelText="ألغاء"
          >
            <MdDeleteOutline className="text-red-500 text-xl cursor-pointer" />
          </Popconfirm>
          <FaRegEdit
            onClick={() => {
              setShowModal(true);
              setRecord(record);
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
          <h1 className="text-3xl font-bold">المنتجات</h1>
          <div className="flex justify-end items-end w-1/4 gap-4">
            <Input
              placeholder="بحث عن منتج"
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
          dataSource={product}
          loading={isLoading}
          pagination={false}
          rowKey="id"
        />
        <Pagination
          current={page}
          total={total}
          onChange={setPage}
          showSizeChanger={false}
          itemRender={itemRender}
          className="mt-4"
        />

        <ModalForm
          showModal={showModal}
          setShowModal={setShowModal}
          getProducts={refetch}
          record={record}
          setRecord={setRecord}
        />

        <ImagesModal
          showModal={showModalImages}
          setShowModal={setShowModalImages}
          getProducts={refetch}
          record={record}
          setRecord={setRecord}
        />
      </Container>
    </div>
  );
};
