import React from "react";
import StackUp from "../assets/StackUp1.svg";
import StackDown from "../assets/StackDown.svg";
export default function Home() {
  return (
    <div className="bg-[#F5F6FB] w-lvw h-lvh flex justify-center items-start">
      <div className="flex justify-between items-center mt-4 w-[80%] bg-white rounded-[20px] p-6">
        <div className="flex justify-center items-center">
          <div className="flex flex-col justify-start items-start p-4 ">
            <p className="text-xl font-light text-gray-400">Total Income</p>
            <p className="text-3xl font-bold text-gray-900">$1200</p>
            <p className="text-xl font-bold text-[#26CE83]">45%</p>
          </div>
          <div>
            <img className="w-[80px] h-[100px]" src={StackUp} />
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div className="flex flex-col justify-start items-start p-4 ">
            <p className="text-xl font-light text-gray-400">Total Expense</p>
            <p className="text-3xl font-bold text-gray-900">4000K</p>
            <p className="text-xl font-bold text-[#FF8D4E]">45%</p>
          </div>
          <div>
            <img className="w-[80px] h-[100px]" src={StackDown} />
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div className="flex flex-col justify-start items-start p-4 ">
            <p className="text-xl font-light text-gray-400">Total Income</p>
            <p className="text-3xl font-bold text-gray-900">$1200</p>
            <p className="text-xl font-bold text-[#26CE83]">45%</p>
          </div>
          <div>
            <img className="w-[80px] h-[100px]" src={StackUp} />
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div className="flex flex-col justify-start items-start p-4 ">
            <p className="text-xl font-light text-gray-400">Total Income</p>
            <p className="text-3xl font-bold text-gray-900">$1200</p>
            <p className="text-xl font-bold text-[#26CE83]">45%</p>
          </div>
          <div>
            <img className="w-[80px] h-[100px]" src={StackUp} />
          </div>
        </div>
      </div>
    </div>
  );
}
