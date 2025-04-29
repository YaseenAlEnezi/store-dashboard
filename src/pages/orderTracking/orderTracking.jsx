import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { showNotification } from "../../utils/Notification";
import { fetcher } from "../../utils/api";

export const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(false);

  const getOrderById = async () => {
    setLoading(true);
    try {
      const response = await fetcher({
        pathname: `order/${id}`,
        method: "GET",
        data: null,
        auth: true,
      });
      if (response.success) {
        setOrder(response.data);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showNotification("error", "Failed to fetch order", "");
      console.log(error);
    }
  };

  useEffect(() => {
    getOrderById();
  }, []);
  return <div>{id}</div>;
};
