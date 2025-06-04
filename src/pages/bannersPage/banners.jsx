import React, { useEffect, useState } from "react";
import { Container } from "../../components/Container";
import { Button, Table, Input, Popconfirm, Typography, Pagination } from "antd";
import { showNotification } from "../../utils/Notification";
import { fetcher, IMAGE_URL } from "../../utils/api";
import { AddModal } from "./modal/modal";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { TwoSides } from "./modal/twoSides";
import { Category } from "./modal/category";
import { Image } from "lucide-react";
import { Brand } from "./modal/brand";
import { Slider } from "./modal/slider";
import { Items } from "./modal/items";

export const BannerPage = () => {
  const [banner, setBanner] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [record, setRecord] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showTwoSidesModal, setShowTwoSidesModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSliderModal, setShowSliderModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);

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

  const getBanner = async () => {
    try {
      const response = await fetcher({
        pathname: `banner?page=${page}&pageSize=${pageSize}&search=${search}`,
        method: "GET",
        data: null,
        auth: true,
      });
      if (response) {
        setBanner(response.data);
        setTotal(response.total);
        console.log(response.data);

        showNotification("success", "Banner fetched successfully", "");
      } else {
        showNotification("error", "ter", "");
      }
    } catch (error) {
      showNotification("error", "Failed to fetch banner", "");
      console.log(error);
    }
  };

  const deleteBanner = async (id) => {
    try {
      const response = await fetcher({
        pathname: `banner/${id}`,
        method: "DELETE",
        data: null,
        auth: true,
      });
      getBanner();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getBanner();
  }, [page, pageSize, search]);

  const showEditModal = (record) => {
    const type = record.bannerType;
    setRecord(record);
    switch (type) {
      case "single":
        setShowModal(true);
        break;
      case "twoSides":
        setShowTwoSidesModal(true);
        break;
      case "slider":
        setShowSliderModal(true);
        break;
      case "category":
        setShowCategoryModal(true);
        break;
      case "items":
        setShowItemsModal(true);
        break;
      case "brand":
        setShowBrandModal(true);
        break;
      default:
        break;
    }
  };

  const columns = [
    {
      title: "الصورة",
      dataIndex: "img",
      key: "img",
      render: (text, record) =>
        text ? (
          <img
            src={`${IMAGE_URL}${text}`}
            alt={record.name}
            className="w-10 h-10 rounded-md object-cover"
          />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-md">
            <Image className="w-8 h-8 text-gray-400 object-cover" />
          </div>
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
      title: "النوع",
      dataIndex: "bannerType",
      key: "bannerType",
      render: (text, record) => (
        <Typography.Text strong>{text}</Typography.Text>
      ),
    },
    {
      title: "الترتيب",
      dataIndex: "priority",
      key: "priority",
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
            onConfirm={() => deleteBanner(record.id)}
            okText="حذف"
            cancelText="ألغاء"
          >
            <MdDeleteOutline className="text-red-500 text-xl cursor-pointer" />
          </Popconfirm>
          <FaRegEdit
            onClick={() => {
              showEditModal(record);
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
          <h1 className="text-3xl font-bold">واجهات العرض</h1>
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
          dataSource={banner}
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
        <AddModal
          showModal={showModal}
          setShowModal={setShowModal}
          getBanner={getBanner}
          record={record}
          setRecord={setRecord}
        />
        <TwoSides
          showModal={showTwoSidesModal}
          setShowModal={setShowTwoSidesModal}
          getBanner={getBanner}
          record={record}
          setRecord={setRecord}
        />
        <Category
          showModal={showCategoryModal}
          setShowModal={setShowCategoryModal}
          getBanner={getBanner}
          record={record}
          setRecord={setRecord}
        />
        <Slider
          showModal={showSliderModal}
          setShowModal={setShowSliderModal}
          getBanner={getBanner}
          record={record}
          setRecord={setRecord}
        />
        <Items
          showModal={showItemsModal}
          setShowModal={setShowItemsModal}
          getBanner={getBanner}
          record={record}
          setRecord={setRecord}
        />
        <Brand
          showModal={showBrandModal}
          setShowModal={setShowBrandModal}
          getBanner={getBanner}
          record={record}
          setRecord={setRecord}
        />
      </Container>
    </div>
  );
};
