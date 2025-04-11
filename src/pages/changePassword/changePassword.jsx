import React, { useState } from "react";
import { fetcher } from "../../utils/api";
import Logo from "../../assets/logo";
import { Button, Input } from "antd";
import { showNotification } from "../../utils/Notification";
import { Navigate } from "react-router-dom";

export const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");

  const handleChangePassword = async () => {
    if (!oldPassword || !password) {
      showNotification(
        "error",
        "ادخل البيانات اللازمة",
        "رجاءا قم بادخال جميع الحقول"
      );
      return;
    }
    if (oldPassword === password) {
      showNotification(
        "error",
        "ادخل البيانات اللازمة",
        "كلمة المرور القديمة وكلمة المرور الجديدة يجب ان تكون مختلفة"
      );
      return;
    }

    try {
      const res = await fetcher({
        pathname: "change-password",
        method: "PUT",
        data: {
          oldPassword,
          password,
        },
        auth: true,
      });
      if (res.success) {
        showNotification(
          "success",
          "تم تغيير كلمة المرور بنجاح",
          "تم تغيير كلمة المرور بنجاح"
        );
        localStorage.removeItem("token");
        Navigate("/login");
      } else {
        showNotification("error", "خطأ في تغيير كلمة المرور", res.msg);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="w-[400px] h-[450px] rounded-2xl border shadow-2xl shadow-[#FFED03] py-6 flex flex-col justify-start items-center">
        <Logo className={"w-[200px] h-[100px]"} color="#FFED03" />
        <p className="text-4xl font-bold text-center mt-4 text-gray-900">
          تغيير كلمة المرور
        </p>
        <div className="w-[70%]">
          <p className="mt-4 mb-1 ">كلمة المرور القديمة</p>
          <Input.Password
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <p className="mt-4 mb-1">كلمة المرور الجديدة</p>
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
        </div>
        <Button
          type="primary"
          className="w-[70%] mt-12 bg-[#FFED03] text-gray-900"
          onClick={handleChangePassword}
        >
          تغيير كلمة المرور
        </Button>
      </div>
    </div>
  );
};
