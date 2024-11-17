import React, { useState } from "react";
import { IoHomeOutline, IoSearchOutline, IoPerson } from "react-icons/io5";
import Logo from "../assets/logo.jsx";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
export default function Header() {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <>
      <div className=" bg-[#F5F6FB] w-full flex justify-between p-4 gap-4">
        <div className="flex justify-start  items-center h-full w-full">
          <div className="flex items-center gap-4 w-full h-full">
            <Logo
              className="w-[100px] h-[100px]"
              color={isHovered ? "#26CE83" : "black"}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            />

            <p className="text-3xl drop-shadow-lg font-bold text-black">
              Dashboard
            </p>
          </div>
          <div className="flex bg-white items-center gap-2 p-2 rounded-full">
            <button>
              <IoSearchOutline />
            </button>
            <input
              type="text"
              className="focus:outline-none"
              placeholder="Search..."
            />
          </div>
        </div>
      </div>
      <div className="flex">
        <Sidebar />
        <Outlet />
      </div>
    </>
  );
}
