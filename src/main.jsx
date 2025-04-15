import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import About from "./pages/About.jsx";
import Home from "./pages/Home.jsx";
import { Login } from "./pages/Login.jsx";
import { ChangePassword } from "./pages/changePassword/changePassword.jsx";
import { Signout } from "./utils/Signout.js";
import { ConfigProvider, theme } from "antd";
import { Users } from "./pages/users/users.jsx";
import { ProductPage } from "./pages/productPage/product.jsx";
import { CategoryPage } from "./pages/categoryPage/category.jsx";
import { BrandPage } from "./pages/brandsPage/brands.jsx";
import { BannerPage } from "./pages/bannersPage/banners.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/home",
        element: <ProductPage />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/users",
        element: <Users />,
      },
      {
        path: "/product",
        element: <ProductPage />,
      },
      {
        path: "/category",
        element: <CategoryPage />,
      },
      {
        path: "/brand",
        element: <BrandPage />,
      },
      {
        path: "/banner",
        element: <BannerPage />,
      },
    ],
  },
  {
    path: "/change-password",
    element: <ChangePassword />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  // {
  //   path: "/signout",
  //   element: <Signout />,
  // },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#000000",
          colorPrimaryHover: "#E6D900",
        },
        components: {
          Button: {
            colorPrimary: "#FFED03",
            colorPrimaryHover: "#E6D900",
            colorTextLightSolid: "#000000",
          },
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  </QueryClientProvider>
);
