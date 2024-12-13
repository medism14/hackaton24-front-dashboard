/** @format */

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "../index";
import { useSelector } from "react-redux";
import Loader from "../../commons/Loader";

const DefaultLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);


  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated && (
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}
      <div
        className={`min-h-screen flex flex-col ${
          isAuthenticated ? "pt-[135px]" : ""
        } pb-8`}
      >
        <main className="flex-grow mx-auto w-full flex flex-col max-w-[80%]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
