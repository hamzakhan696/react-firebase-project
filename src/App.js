import Login from "./components/auth/login";
import Register from "./components/auth/register";

import Header from "./components/header";
import Home from "./components/home";
import Product from "./components/product";
import ProductDetailComponent from "./components/product-detail";
import OrderHistoryComponent from "./components/order-history";

import { AuthProvider } from "./contexts/authContext";
import { useRoutes } from "react-router-dom";
import React from "react";

function App() {
  const routesArray = [
    {
      path: "*",
      element: <Login />,
    },

    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/order-history",
      element: <OrderHistoryComponent />,
    },
    {
      path: "/product",
      element: <Product />,
    },
    {
      path: "/product/:productId",
      element: <ProductDetailComponent />,
    },
  ];
  let routesElement = useRoutes(routesArray);
  return (
    <AuthProvider>
      <Header />
      <div className="fixed inset-0 flex justify-center items-center opacity-40 text-9xl font-bold text-gray-300 pointer-events-none z-0 uppercase">
        Solenteshop
      </div>
      <div className="w-full h-screen flex flex-col">{routesElement}</div>
    </AuthProvider>
  );
}

export default App;
