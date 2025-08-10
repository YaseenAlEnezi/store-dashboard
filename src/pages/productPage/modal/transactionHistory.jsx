import React, { useState, useEffect } from "react";
import { Modal, Table, Tag, Typography, Pagination } from "antd";
import { fetcher } from "../../../utils/api";
import { showNotification } from "../../../utils/Notification";

export const TransactionHistoryModal = ({
  visible,
  onCancel,
  productId,
  productName,
}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const getTransactions = async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const response = await fetcher({
        pathname: `product/${productId}/transactions?page=${page}&pageSize=${pageSize}`,
        method: "GET",
        auth: true,
      });

      if (response.success) {
        setTransactions(response.data);
        setTotal(response.total);
      }
    } catch (error) {
      showNotification("error", "فشل في جلب تاريخ المعاملات", "");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && productId) {
      getTransactions();
    }
  }, [visible, productId, page, pageSize]);

  const columns = [
    {
      title: "التاريخ",
      dataIndex: "date",
      key: "date",
      render: (text) => (
        <Typography.Text>
          {new Date(text).toLocaleDateString("ar-EG")}
        </Typography.Text>
      ),
    },
    {
      title: "النوع",
      dataIndex: "type",
      key: "type",
      render: (text) => (
        <Tag
          color={
            text === "purchase" ? "green" : text === "sale" ? "red" : "blue"
          }
          className="text-[14px] font-semibold"
        >
          {text === "purchase" ? "شراء" : text === "sale" ? "بيع" : text}
        </Tag>
      ),
    },
    {
      title: "الكمية",
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: "التكلفة/الوحدة",
      dataIndex: "cost",
      key: "cost",
      render: (text) => (
        <Typography.Text className="text-gray-600">
          {text ? `${text.toLocaleString("en")} د.ع` : "غير محدد"}
        </Typography.Text>
      ),
    },
    {
      title: "إجمالي التكلفة",
      dataIndex: "totalCost",
      key: "totalCost",
      render: (text) => (
        <Typography.Text className="text-green-600" strong>
          {text ? `${text.toLocaleString("en")} د.ع` : "غير محدد"}
        </Typography.Text>
      ),
    },
    {
      title: "ملاحظات",
      dataIndex: "notes",
      key: "notes",
      render: (text) => (
        <Typography.Text className="text-gray-500">
          {text || "لا توجد ملاحظات"}
        </Typography.Text>
      ),
    },
  ];

  return (
    <Modal
      title={`تاريخ معاملات المنتج: ${productName}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      destroyOnClose
    >
      <div className="mt-4">
        <Table
          columns={columns}
          dataSource={transactions}
          loading={loading}
          pagination={false}
          rowKey="id"
        />

        <div className="mt-4 flex justify-center">
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            onChange={(page) => setPage(page)}
            showSizeChanger={false}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} من ${total} معاملة`
            }
          />
        </div>
      </div>
    </Modal>
  );
};
