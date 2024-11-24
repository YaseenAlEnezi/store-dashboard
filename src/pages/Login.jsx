import React, { useEffect, useState } from "react";
import Logo from "../assets/logo";
import { Button, Input } from "antd";
import { showNotification } from "../utils/Notification";
import { useStore } from "../utils/stores";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setUser, user } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    console.log(user);
  }, [user]);
  const handleLogin = async () => {
    if (!username || !password) {
      showNotification(
        "error",
        "أدخل البيانات اللازمة",
        "رجاءا قم بادخال جميع الحقول"
      );
      return;
    }
    try {
      const response = await fetch(
        "https://api.car5x.com/api/v1/dashboard/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );
      let res = await response.json();
      if (res.success) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        setUser({
          username: res.user.username,
          name: res.user.name,
          image: res.user.image,
          id: res.user.id,
        });
        showNotification("success", "تم تسجيل الدخول بنجاح", res.msg);
        navigate("/home");
      } else {
        showNotification("error", "خطأ في تسجيل الدخول", res.msg);
      }
    } catch (error) {
      console.log(error);
      showNotification(
        "error",
        "خطأ في تسجيل الدخول",
        "يرجى التحقق من البيانات المدخلة"
      );
    }
  };
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="w-[400px] h-[450px] rounded-2xl border shadow-2xl shadow-[#3730A3] py-6 flex flex-col justify-start items-center">
        <Logo className={"w-[200px] h-[100px]"} color="#3730A3" />
        <p className="text-4xl font-bold text-center mt-4 text-gray-900">
          تسجيل الدخول
        </p>
        <div className="w-[70%]">
          <p className="mt-4 mb-1 ">أدخل أسم المستخدم</p>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <p className="mt-4 mb-1">أدخل كلمة المرور</p>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
        </div>
        <Button type="primary" className="w-[70%] mt-12" onClick={handleLogin}>
          تسجيل الدخول
        </Button>
      </div>
    </div>
  );
};
