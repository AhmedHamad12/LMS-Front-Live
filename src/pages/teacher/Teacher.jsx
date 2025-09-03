import React from "react";
import TeacherAside from "../../Components/teacher/TeacherAside";
import { Outlet } from "react-router-dom";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import { useQuery } from "@tanstack/react-query";
import UnauthorizedPage from "../../Components/UnAuthorized";

export default function Teacher() {
  const cookies = new Cookies();
  const token = cookies.get("token");

  const fetchUser = async () => {
    return await axios
      .get("/api/Account/GetCurrentUser", {
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.error("User data fetch error:", error);
      });
  };

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    refetchOnWindowFocus: false,
  });
//final

  return (
    <>
      {user?.data?.role === "Teacher" ? (
        <div className="flex m-0">
          <TeacherAside />
          <div className="flex-1 overflow-auto h-screen">
            <Outlet />
          </div>
        </div>
      ) : (
        !isLoading && <UnauthorizedPage />
      )}
    </>
  );
}
