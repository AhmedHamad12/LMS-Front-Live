import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  FilePlus2,
  Users,
  BrainCircuit,
  LogOut,
  ClipboardCheck, // 1. تم استيراد أيقونة الواجبات
} from "lucide-react";

export default function TeacherAside() {
  const navigate = useNavigate();
  const cookies = new Cookies();
  const token = cookies.get("token");

  // --- Data Fetching Logic (Unaltered) ---
  const fetchUser = () => {
    return axios.get("/api/Account/GetCurrentUser", { headers: { accept: "text/plain", Authorization: `Bearer ${token}` } })
      .catch((error) => console.error("User data fetch error:", error));
  };
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: fetchUser, refetchOnWindowFocus: false });

  const fetchAllData = () => {
    return axios.get(`/api/Teacher/getTeacherByid`, { headers: { accept: "text/plain", Authorization: `Bearer ${token}` } })
      .catch((error) => console.error("User data fetch error:", error));
  };
  const { data: allData } = useQuery({ queryKey: ["all-data"], queryFn: fetchAllData, refetchOnWindowFocus: false });
  
  // --- Updated Logout Handler ---
  const handleLogout = () => {
    cookies.remove("token", { path: "/" });
    navigate("/login", { replace: true });
  };
  
  // --- Navigation Items ---
  const sidebarItems = [
    { to: "/teacher/dashboard", title: "لوحة التحكم", icon: <LayoutDashboard size={22} /> },
    { to: "/teacher/addcourse", title: "إضافة كورس", icon: <PlusCircle size={22} /> },
    { to: "/teacher/quizzes", title: "الاختبارات", icon: <FilePlus2 size={22} /> },
    // --== 2. تمت إضافة زر الواجبات هنا ==--
    { to: "/teacher/assignments", title: "الواجبات", icon: <ClipboardCheck size={22} /> },
    { to: "/teacher/teacherstudents", title: "الطلاب", icon: <Users size={22} /> },
    { to: "/ai", title: "المساعد الذكي", icon: <BrainCircuit size={22} /> },
  ];
  
  // --- NavLink Styling Function ---
  const getNavLinkClass = ({ isActive }) => {
    const baseClasses = "flex items-center justify-center lg:justify-start rounded-lg p-3 transition-colors duration-200";
    const inactiveClasses = "text-slate-400 hover:bg-white/10 hover:text-white";
    const activeClasses = "bg-cyan-500/10 text-cyan-300 font-bold border-r-4 border-cyan-400 shadow-inner shadow-cyan-500/10";
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <aside className="w-20 lg:w-64 bg-slate-900/50 backdrop-blur-xl border-l border-white/5 p-2 lg:p-4 flex flex-col justify-between transition-all duration-300 flex-shrink-0 h-screen sticky top-0">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="text-center mb-10 pt-4">
          <Link to="/teacher/dashboard">
            <img src="/logo.png" alt="logo" className="w-12 lg:w-36 mx-auto transition-all duration-300" />
          </Link>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-grow space-y-3">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={getNavLinkClass}
              end={item.to === "/teacher/dashboard"}
              title={item.title}
            >
              <span className="lg:ml-3">{item.icon}</span>
              <span className="mr-3 hidden lg:inline">{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Profile and Logout Section */}
      <div className="border-t border-slate-700/50 pt-4 space-y-3">
        <Link to="/teacher/profile" className="flex items-center justify-center lg:justify-start p-2 rounded-lg transition-colors duration-200 hover:bg-white/10 w-full text-left">
          <img
            src={allData?.data?.path || 'https://placehold.co/40x40/0ea5e9/ffffff?text=T'}
            alt="صورة المستخدم"
            className="w-10 h-10 rounded-full border-2 border-cyan-400"
          />
          <div className="hidden lg:block mr-3 overflow-hidden">
            <p className="font-bold text-white text-sm truncate">
              {`${allData?.data?.firstName || ''} ${allData?.data?.lastName || ''}`}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {allData?.data?.subject ? `مدرس ${allData.data.subject}` : 'مدرس'}
            </p>
          </div>
        </Link>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center lg:justify-start rounded-lg p-3 text-slate-400 transition-colors duration-200 hover:bg-red-500/20 hover:text-red-400"
          title="تسجيل الخروج"
        >
          <span className="lg:ml-3"><LogOut size={22} /></span>
          <span className="mr-3 hidden lg:inline">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
