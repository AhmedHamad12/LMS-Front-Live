import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";


// استيراد الأيقونات
import {
  LayoutDashboard,
  PlusCircle,
  FilePlus2,
  Users,
  BrainCircuit,
  LogOut,
  ClipboardCheck,
  User,
} from "lucide-react";

// --- مكون فرعي للروابط لتحسين التنظيم وإضافة الحركة ---
const NavItem = ({ to, title, icon, isExact = false }) => {
    return (
        <NavLink
            to={to}
            end={isExact}
            title={title}
            className={({ isActive }) =>
                `relative flex items-center justify-center lg:justify-start rounded-xl p-3 group transition-colors duration-200 ${
                    isActive ? "text-white" : "text-slate-400 hover:bg-white/10 hover:text-white"
                }`
            }
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <motion.div
                            layoutId="active-teacher-pill"
                            className="absolute inset-0 bg-cyan-500/10 rounded-xl"
                            style={{ borderRadius: 12 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10">{icon}</span>
                    <span className="relative z-10 hidden lg:mr-3 lg:block">{title}</span>
                </>
            )}
        </NavLink>
    );
};

export default function TeacherAside() {
  const navigate = useNavigate();
  const cookies = new Cookies();
  const token = cookies.get("token");

  const { data: teacherProfile } = useQuery({
    queryKey: ["teacherProfileData"],
    queryFn: () => axios.get(`/api/Teacher/getTeacherByid`, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    enabled: !!token,
    refetchOnWindowFocus: false,
    select: (response) => response.data,
  });
  
  // --- تعديل دالة تسجيل الخروج ---
  const handleLogout = () => {
    cookies.remove("token", { path: "/" });
    // التوجيه إلى الصفحة الرئيسية (Landing Page) كما طلبت
    navigate("/", { replace: true });
    // إعادة التحميل ضرورية لحل مشكلة الشاشة السوداء عن طريق تصفير حالة التطبيق
    setTimeout(() => window.location.reload(), 50);
  };
  
  const sidebarItems = [
    { to: "/teacher/dashboard", title: "لوحة التحكم", icon: <LayoutDashboard size={22} />, isExact: true },
    { to: "/teacher/addcourse", title: "إضافة كورس", icon: <PlusCircle size={22} /> },
    { to: "/teacher/quizzes", title: "الاختبارات", icon: <FilePlus2 size={22} /> },
    { to: "/teacher/assignments", title: "الواجبات", icon: <ClipboardCheck size={22} /> },
    { to: "/teacher/teacherstudents", title: "الطلاب", icon: <Users size={22} /> },
    { to: "/ai", title: "المساعد الذكي", icon: <BrainCircuit size={22} /> },
  ];
  
  const teacherInitial = teacherProfile?.firstName?.[0]?.toUpperCase() || <User size={20} />;

  return (
    <aside className="w-20 lg:w-64 bg-slate-900/50 backdrop-blur-xl border-l border-white/5 p-2 lg:p-4 flex flex-col transition-all duration-300 flex-shrink-0 h-screen sticky top-0">
        
        <div className="flex flex-col flex-grow min-h-0">
            {/* Logo */}
            <div className="text-center mb-10 pt-4 flex-shrink-0">
                <Link to="/teacher/dashboard">
                    <img src="/logo.png" alt="logo" className="w-12 lg:w-36 mx-auto transition-transform hover:scale-105" />
                </Link>
            </div>
            
            {/* Navigation Links - Scrollable */}
            <nav className="flex-grow space-y-2 overflow-y-auto pr-1 lg:pr-0 scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-slate-800">
                {sidebarItems.map((item) => <NavItem key={item.to} {...item} /> )}
            </nav> {/* <-- *** تم إصلاح الخطأ هنا *** */}
        </div>

      {/* Profile and Logout Section */}
      <div className="border-t border-slate-700/50 pt-4 space-y-3 flex-shrink-0">
        <Link to="/teacher/Myprofile" className="flex items-center justify-center lg:justify-start p-2 rounded-xl transition-colors duration-200 hover:bg-white/10 w-full text-left group">
          {teacherProfile?.path ? (
             <img src={teacherProfile.path} alt="صورة المستخدم" className="w-11 h-11 rounded-full border-2 border-cyan-500/50 object-cover object-top" />
          ) : (
             <div className="w-11 h-11 rounded-full border-2 border-cyan-500/50 bg-cyan-900/50 flex items-center justify-center text-cyan-300 font-bold text-xl">
                {teacherInitial}
             </div>
          )}
         
          <div className="hidden lg:block mr-3 overflow-hidden">
            <p className="font-bold text-white text-sm truncate group-hover:text-cyan-300 transition-colors">
              {teacherProfile?.firstName} {teacherProfile?.lastName}
            </p>
            <p className="text-xs text-slate-400 truncate">
              مدرس {teacherProfile?.subject}
            </p>
          </div>
        </Link>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center lg:justify-start rounded-xl p-3 text-slate-400 transition-colors duration-200 hover:bg-red-500/20 hover:text-red-400"
          title="تسجيل الخروج"
        >
          <span className=""><LogOut size={22} /></span>
          <span className="mr-3 hidden lg:inline">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
