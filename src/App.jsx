import { useEffect, useState } from "react";
import "./App.css";
import { Outlet } from "react-router-dom";
import { useStore } from "./utils/stores";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";

function App() {
  const navigate = useNavigate();
  const { user, setUser } = useStore();
  useEffect(() => {
    console.log(user);
    if (!user) setUser({});
    if (!localStorage.getItem("token")) navigate("/login", { replace: true });
  }, [user]);
  return (
    <div>
      <Navbar />
      <div className="w-full h-4" />
      <Outlet />
    </div>
  );
}

export default App;
