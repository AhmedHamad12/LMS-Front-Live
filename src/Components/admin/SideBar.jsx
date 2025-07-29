import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";
import { Cookies } from "react-cookie";

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  const cookies = new Cookies
  const navigate = useNavigate()
  const handleLogout = ()=>{
    cookies.remove('token')
    

    navigate("/")
  }

  const navLinks = [
    {
      name: "الرئيسية",
      path: "/admin/dashboard",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z
               M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z
               M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z
               M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: "المستخدمون",
      path: "/admin/users",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857
               M17 20H7
               m10 0v-2c0-.656-.126-1.283-.356-1.857
               M7 20H2v-2a3 3 0 015.356-1.857
               M7 20v-2c0-.656.126-1.283.356-1.857
               m0 0a5.002 5.002 0 019.288 0
               M15 7a3 3 0 11-6 0 3 3 0 016 0z
               M21 10a2 2 0 11-4 0 2 2 0 014 0z
               M7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: "الكورسات",
      path: "/admin/courses",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 6.253v13
               m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13
               C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253
               m0-13C13.168 5.477 14.754 5 16.5 5
               c1.747 0 3.332.477 4.5 1.253v13
               C19.832 18.477 18.246 18 16.5 18
               c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      name: "التقارير",
      path: "/admin/reports",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M13 7h8
               m0 0v8
               m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="h-[100vh] w-20 lg:w-64 glass-effect p-2 lg:p-6 flex flex-col justify-between transition-all duration-300 flex-shrink-0">
      <div>
        {/* Brand / Title */}
        <div className="text-3xl font-black text-center mb-12 text-white title-glow">
          <NavLink to="/admin/dashboard">
            <span className="hidden lg:inline">المجرّة [Admin]</span>
            <span className="lg:hidden">🚀</span>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="space-y-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              title={link.name}
              className={({ isActive }) =>
                `flex items-center justify-center lg:justify-start p-3 rounded-lg font-bold transition-colors ${
                  isActive
                    ? "bg-cyan-500/20 text-white"
                    : "text-gray-300 hover:bg-white/10"
                }`
              }
            >
              {link.icon}
              <span className="hidden lg:inline mr-3">{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Profile & Logout Dropdown */}
      <div className="relative">
        <div
          onClick={() => setOpen(!open)}
          className="glass-effect p-2 lg:p-3 rounded-lg flex items-center justify-center lg:justify-start cursor-pointer"
        >
          <img
            src="https://placehold.co/40x40/00BFFF/000000?text=A"
            alt="صورة المدير"
            className="w-10 h-10 rounded-full border-2 border-cyan-400"
          />
          <div className="hidden lg:block mr-3">
            <p className="font-bold text-white">Admin</p>
            <p className="text-xs text-gray-400">المدير العام</p>
          </div>
        </div>

        {open && (
          <div
            className="absolute bottom-full mb-2 w-full glass-effect rounded-lg overflow-hidden"
            onMouseLeave={() => setOpen(false)}
          >
            <button onClick={handleLogout} className="block w-full text-right px-4 py-3 text-sm text-red-400 hover:bg-red-500/20">
              تسجيل الخروج
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
