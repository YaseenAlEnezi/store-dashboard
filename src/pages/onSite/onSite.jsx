import React, { useState } from "react";
import { Container } from "../../components/Container";
import { Button, Form, Input } from "antd";
import { IoSearchOutline } from "react-icons/io5";

export const OnSite = () => {
  const [search, setSearch] = useState(null);

  return (
    <Container>
      <div className="mb-4 flex justify-between">
        <h1 className="text-3xl font-bold">قائمة</h1>
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
            }}
          >
            اضافة
          </Button>
        </div>
      </div>
      <Form>
        
      </Form>
    </Container>
  );
};
