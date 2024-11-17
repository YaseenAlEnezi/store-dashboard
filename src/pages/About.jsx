import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function About() {
  const [value, setValue] = useState("");
  const [total, setTotal] = useState(0);
  const [list, setList] = useState([
    "Hello this is my first Todo",
    "Hello this is my second Todo.",
    "Hello this is my 3rd Todo.",
  ]);

  const addToList = () => {
    if (value.trim()) {
      setList([...list, value]);
      setValue("");
    }
  };

  const removeFromList = (index) => {
    const array = [...list];
    array.splice(index, 1);
    setList(array);
  };

  useEffect(() => {
    setTotal(list.length);
  }, [list]);

  return (
    <>
      <header className="border-b border-gray-200">
        <div className="max-w-md mx-auto flex justify-between items-center h-16 px-4">
          <img src="./ToDo.png" alt="ToDo" className="h-10 w-auto" />
          <div className="text-lg">
            <a href="#" className="text-blue-500">
              Home
            </a>
            <Link to="/about" className="ml-5 text-gray-500">
              About
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4">
        <div className="text-center my-8">
          <h1 className="text-3xl font-bold">Simple ToDo App</h1>
          <p className="text-gray-500 mt-1">
            This todo app is for testing design.
          </p>
        </div>
        <div className="flex gap-4 mt-8">
          <input
            type="text"
            className="flex-grow p-3 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Write Text here . . ."
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button
            onClick={addToList}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-gray-500 transition"
          >
            + Add New
          </button>
        </div>
        <hr className="my-6 border-gray-200" />
        <div className="flex flex-col gap-4">
          {list.map((el, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-gray-200 rounded-lg px-4 py-2 text-lg"
            >
              {el}
              <button
                onClick={() => removeFromList(index)}
                className="text-red-500 border border-red-500 rounded-md p-1 hover:scale-110 transition"
              >
                X
              </button>
            </div>
          ))}
        </div>
        <p className="mt-4 text-gray-500 text-lg">
          Total List: <span className="font-bold text-black">{total}</span>
        </p>
      </main>
    </>
  );
}

export default About;
