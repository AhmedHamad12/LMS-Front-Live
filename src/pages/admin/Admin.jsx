import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../Components/admin/SideBar";

const Admin = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 ml-20 lg:ml-64">
        <Outlet />
      </div>
    </div>
  );
};
 
export default Admin;
