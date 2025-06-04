import React, { useEffect, useState } from "react";
import { Container } from "../../components/Container";
import {
  Button,
  Table,
  Input,
  Popconfirm,
  Typography,
  Pagination,
  Tag,
} from "antd";
import { showNotification } from "../../utils/Notification";
import { fetcher } from "../../utils/api";
import { IoSearchOutline } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { MdFindInPage } from "react-icons/md";
import { useNavigate } from "react-router-dom";
export const OrderPage = () => {
  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const Navigate = useNavigate();

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

  const getOrder = async () => {
    setLoading(true);
    try {
      const response = await fetcher({
        pathname: `order?page=${page}&pageSize=${pageSize}&search=${search}`,
        method: "GET",
        data: null,
        auth: true,
      });
      if (response.success) {
        setOrder(response.data);
        setTotal(response.total);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showNotification("error", "Failed to fetch order", "");
      console.log(error);
    }
  };

  const deleteOrder = async (id) => {
    try {
      const response = await fetcher({
        pathname: `order/${id}`,
        method: "DELETE",
        data: null,
        auth: true,
      });
      getOrder();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getOrder();
  }, [page, pageSize, search]);

  const columns = [
    {
      title: "ت.",
      dataIndex: "id",
      key: "id",
      render: (text, record) => <div className="">{text}</div>,
    },
    {
      title: "الزبون",
      dataIndex: "user",
      key: "user",
      render: (text, record) => (
        <div className="flex flex-col items-start gap-2">
          <Typography.Text strong>{record.user.name}</Typography.Text>
          <Typography.Text>{record.address}</Typography.Text>
        </div>
      ),
    },
    {
      title: "التواصل",
      dataIndex: "phone",
      key: "phone",
      render: (text, record) => (
        <Typography.Text className="text-[14px] font-semibold">
          {record.user.phone}
        </Typography.Text>
      ),
    },
    {
      title: "الحالة",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        <Tag
          className="text-[14px] font-semibold"
          color={
            record.status === "created"
              ? "orange"
              : record.status === "accepted"
              ? "green"
              : record.status === "shipping"
              ? "blue"
              : record.status === "delivered"
              ? "purple"
              : record.status === "cancelled"
              ? "volcano"
              : "red"
          }
        >
          {record.status}
        </Tag>
      ),
    },
    {
      title: "نوع الطلب",
      dataIndex: "orderType",
      key: "orderType",
      render: (text, record) => (
        <Tag
          className="text-[14px] font-semibold"
          color={record.orderType ? "blue" : "green"}
        >
          {record.orderType}
        </Tag>
      ),
    },
    {
      title: "تعديل",
      dataIndex: "edit",
      key: "edit",
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <MdFindInPage
            onClick={() => {
              Navigate(`/orderTracking/${record.id}`);
            }}
            className="text-xl cursor-pointer"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Container>
        <div className="mb-4 flex justify-between">
          <h1 className="text-3xl font-bold">الطلبات</h1>
          <div className="flex justify-end items-end w-1/4 gap-4">
            <Input
              placeholder="بحث عن مستخدم"
              type="text"
              prefix={<IoSearchOutline className="text-xl" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <Table
          className="mt-4"
          columns={columns}
          dataSource={order}
          loading={loading}
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
      </Container>
    </div>
  );
};
