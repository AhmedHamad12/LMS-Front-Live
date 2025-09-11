import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Cookies } from 'react-cookie';
import { motion } from 'framer-motion';

// استيراد الأيقونات الاحترافية من Lucide
import {
    LayoutDashboard,
    BookCopy,
    BookCheck,
    Users, // أيقونة المدرسين
    ClipboardCheck,
    FileText,
    Award,
    User,
    Bot,   // أيقونة المساعد الذكي
    LogOut,
} from 'lucide-react';

// مكون فرعي لعنصر القائمة لزيادة النظافة
const NavItem = ({ to, title, icon }) => (
    <NavLink
        to={to}
        title={title}
        end={to === "/student/dashboard"}
        className={({ isActive }) =>
            `relative flex items-center justify-center lg:justify-start p-3 rounded-xl transition-all duration-300 group ${
                isActive
                    ? "bg-cyan-500/20 text-white font-bold"
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
            }`
        }
    >
        {({ isActive }) => (
            <>
                {isActive && (
                    <motion.div
                        layoutId="active-student-pill"
                        className="absolute inset-0 bg-cyan-500/10 border-r-4 border-cyan-400 rounded-xl"
                        style={{ borderRadius: 12 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                )}
                <span className="relative z-10">{icon}</span>
                <span className="relative z-10 hidden lg:mr-3 lg:block">{title}</span>
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md shadow-lg opacity-0 lg:hidden group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    {title}
                </div>
            </>
        )}
    </NavLink>
);

// المكون الرئيسي للشريط الجانبي
function StudentsSideBar() {
    const navigate = useNavigate();
    const cookies = new Cookies();

    // تعريف كل الروابط في مصفوفة واحدة
    const sidebarItems = [
        { to: "/student/dashboard", title: "لوحة التحكم", icon: <LayoutDashboard size={22} /> },
        { to: "/student/allcourses", title: "كل الكورسات", icon: <BookCopy size={22} /> },
        { to: "/student/mycourses", title: "كورساتي", icon: <BookCheck size={22} /> },
        { to: "/student/teachers", title: "المدرسون", icon: <Users size={22} /> },
        { to: "/student/mytasks", title: "الواجبات", icon: <ClipboardCheck size={22} /> },
        { to: "/student/myexams", title: "الامتحانات", icon: <FileText size={22} /> },
        { to: "/student/rewards", title: "لوحة الشرف", icon: <Award size={22} /> },
        { to: "/student/profile", title: "الملف الشخصي", icon: <User size={22} /> },
        { to: "/ai", title: "المساعد الذكي", icon: <Bot size={22} /> },
    ];

    // دالة تسجيل الخروج
    const handleLogout = () => {
        cookies.remove("token", { path: '/' });
        navigate("/login", { replace: true });
        setTimeout(() => window.location.reload(), 100);
    };

    return (
        <aside className="w-20 lg:w-64 glass-effect p-2 lg:px-4 flex flex-col justify-between transition-all duration-300 flex-shrink-0 h-screen fixed top-0 right-0 z-50">
            
            {/* الجزء العلوي (الشعار) + القائمة القابلة للتمرير */}
            <div className="flex flex-col flex-grow min-h-0">
                
                {/* الشعار */}
                <div className="my-4 text-white text-center flex-shrink-0">
                    <Link to="/student/dashboard">
                        <img src="/logo.png" alt="logo" className="w-12 lg:w-40 mx-auto transition-transform hover:scale-105" />
                    </Link>
                </div>
                
                {/* القائمة القابلة للتمرير مع التنسيق المخصص */}
                <nav className="flex-grow space-y-2 overflow-y-auto pr-1 lg:pr-2 scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-slate-800 hover:scrollbar-thumb-cyan-400">
                    {sidebarItems.map((item) => (
                        <NavItem key={item.to} {...item} />
                    ))}
                </nav>

            </div>
            
            {/* الجزء السفلي (زر تسجيل الخروج) */}
            <div className="p-2 flex-shrink-0">
                <button
                    className="w-full flex items-center justify-center lg:justify-start p-3 rounded-xl transition-all duration-300 group text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    onClick={handleLogout}
                    title="تسجيل الخروج"
                >
                    <span className="relative z-10"><LogOut size={22} /></span>
                    <span className="relative z-10 hidden lg:mr-3 lg:block font-bold">تسجيل الخروج</span>
                    
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md shadow-lg opacity-0 lg:hidden group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                        تسجيل الخروج
                    </div>
                </button>
            </div>

        </aside>
    );
}

export default StudentsSideBar;