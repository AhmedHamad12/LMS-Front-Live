import React from "react";
import TeacherAside from "../../Components/teacher/TeacherAside";
import { Outlet } from "react-router-dom";

export default function Teacher() {
  return (
    <div className="flex m-0">
      <TeacherAside />
      <div className="flex-1 overflow-auto h-screen">
        <Outlet />
      </div>
    </div>
  );
}
