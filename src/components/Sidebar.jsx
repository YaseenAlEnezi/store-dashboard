import React from "react";
import { IoHomeOutline, IoDocumentTextOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="flex flex-col items-center justify-start h-lvh bg-[#F5F6FB] w-fit p-4 gap-4">
      <Link
        to="/home"
        className="w-full flex justify-between p-4 gap-4 hover:text-[#26CE83] "
      >
        <IoHomeOutline className="w-6 h-6" />
      </Link>

      <Link
        to="/about"
        className="w-full flex justify-between p-4 gap-4 hover:text-[#26CE83] "
      >
        <IoDocumentTextOutline className="w-6 h-6" />
      </Link>
    </div>
  );
}
