import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import React, { useState } from "react";
import { Cookies } from "react-cookie";
import { Link, useLocation } from "react-router-dom";

export default function TeacherAside() {
  const [profileOpen, setProfileOpen] = useState(false);

  const location = useLocation();

  const cookies = new Cookies();
  const token = cookies.get("token");

  const handleLogout = () => {
    // Clear the token from local storage
    cookies.remove("token");
    // Redirect to the login page
    window.location.href = "/login";
  };

  const fetchUser = () => {
    return axios
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

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });

  const fetchAllData = () => {
    return axios
      .get(`/api/Teacher/getTeacherByid`, {
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.error("User data fetch error:", error);
      });
  };

  const { data: allData } = useQuery({
    queryKey: ["all-data"],
    queryFn: fetchAllData,
  });

  console.log(user);
  console.log(allData);

  return (
    <aside className="w-20 lg:w-64 glass-effect p-2 lg:p-6 flex flex-col justify-between transition-all duration-300 flex-shrink-0 h-screen z-50">
      <div>
        <div className="text-3xl font-black text-center mb-12 text-white">
          <Link
            to="/home"
            className="hover:text-cyan-400 transition-colors title-glow"
          >
            <span className="hidden lg:inline">المجرّة.</span>
            <span className="lg:hidden">🚀</span>
          </Link>
        </div>
        <nav className="space-y-4">
          {[
            {
              to: "/teacher/dashboard",
              title: "لوحة التحكم",
              icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
            },
            {
              to: "/teacher/addcourse",
              title: "اضافة كورس",
              icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
            },
            {
              to: "/teacher/quizzes",
              title: "اضافة امتحان",
              icon: "M9 2a1 1 0 011-1h4a1 1 0 011 1h2a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2h2zm1 4h4m-4 4h4m-4 4h4m-5-4l-1 1-2-2m3 4l-1 1-2-2",
            },
            
            {
              to: "/teacher/teacherstudents",
              title: "الطلاب",
              icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
            },
            {
              to: "/teacher/earn",
              title: "الأرباح",
              icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
            },
          ].map((item, index) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={index}
                to={item.to}
                className={`flex items-center justify-center lg:justify-start p-3 rounded-lg transition-all duration-300 group ${
                  isActive
                    ? "bg-white/10 border border-cyan-400/30 text-cyan-400 shadow-lg shadow-cyan-400/20"
                    : "text-gray-300 hover:bg-white/5 hover:text-cyan-400"
                }`}
                title={item.title}
              >
                <svg
                  className={`w-6 h-6 transition-colors ${
                    isActive ? "text-cyan-400" : "group-hover:text-cyan-400"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={item.icon}
                  />
                </svg>
                <span
                  className={`hidden lg:ml-3 lg:block transition-colors ${
                    isActive
                      ? "text-cyan-400 font-semibold"
                      : "group-hover:text-cyan-400"
                  }`}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="relative">
        <div
          onClick={() => setProfileOpen(!profileOpen)}
          className="glass-effect p-2 lg:p-3 rounded-lg flex items-center justify-center lg:justify-start cursor-pointer"
        >
          <img
            src={allData?.data?.path}
            alt="صورة المستخدم"
            className="w-10 h-10 rounded-full border-2 border-cyan-400"
          />
          <div className="hidden lg:block mr-3">
            <p className="font-bold text-white">
              {`${allData?.data?.firstName} ${allData?.data?.lastName}`}
            </p>
            <p className="text-xs text-gray-400">
              مدرس {allData?.data?.subject}
            </p>
          </div>
        </div>
        {profileOpen && (
          <div
            className="absolute bottom-full mb-2 w-full glass-effect rounded-lg overflow-hidden"
            onClick={() => setProfileOpen(false)}
          >
            <button className="block px-4 py-3 text-right text-sm text-red-400 hover:bg-red-500/20 w-full cursor-pointer" onClick={handleLogout}>
              تسجيل الخروج
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
