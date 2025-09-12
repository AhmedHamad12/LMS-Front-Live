import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Cookies } from 'react-cookie';
import { motion } from 'framer-motion';


// استيراد الأيقونات الاحترافية
import { 
    LayoutDashboard, 
    BookCopy, 
    ClipboardCheck, 
    FileText, 
    Trophy, 
    Gift, 
    User, 
    LogOut,
    Rocket,
    Users // <--- الخطوة 1: استيراد أيقونة جديدة للمدرسين
} from 'lucide-react';

export default function AsideBar() {
    const navigate = useNavigate();
    
    const cookies = new Cookies();

    // دمج كل الروابط في مصفوفة واحدة لسهولة التعديل
    const sidebarItems = [
        { href: "/student/dashboard", icon: <LayoutDashboard size={22} />, label: "لوحة التحكم" },
        { href: "/student/my-courses", icon: <BookCopy size={22} />, label: "كورساتي" },
        // --- الخطوة 2: إضافة الرابط الجديد هنا ---
        { href: "/student/teachers", icon: <Users size={22} />, label: "المدرسون" },
        { href: "/student/mytasks", icon: <ClipboardCheck size={22} />, label: "الواجبات" },
        { href: "/student/myexams", icon: <FileText size={22} />, label: "الامتحانات" },
        { href: "/student/leaderboard", icon: <Trophy size={22} />, label: "لوحة الشرف" },
        { href: "/student/rewards", icon: <Gift size={22} />, label: "المكافآت" },
    ];
    
    const profileLink = { href: "/student/profile", icon: <User size={22} />, label: "الملف الشخصي" };

    // --- الخطوة 3: تعديل دالة تسجيل الخروج ---
    const handleLogout = () => {
        // هذه الدالة تحاول مسح الكوكي من جهة العميل (المتصفح)
        // إذا لم تنجح، فالسبب غالباً موضح في الشرح بالأسفل
        cookies.remove('token', { path: '/' });

        // لإعادة التوجيه إلى الصفحة الرئيسية واستبدال التاريخ (history)
        navigate('/', { replace: true });

        // يمكنك أيضاً إعادة تحميل الصفحة للتأكد من تطبيق كل التغييرات
        window.location.reload();
    };
    
    // -- Component for Navigation Links for cleaner code --
    const NavItem = ({ item }) => (
        <NavLink
            to={item.href}
            end={item.href.endsWith("dashboard")} // Ensures only dashboard is active on exact path
            title={item.label}
            className="relative flex items-center justify-center lg:justify-start rounded-lg p-3 group"
        >
            {({ isActive }) => (
                <>
                    {/* The animated pill for active state */}
                    {isActive && (
                        <motion.div
                            layoutId="active-sidebar-pill"
                            className="absolute inset-0 bg-cyan-500/20 border-r-4 border-cyan-400 rounded-lg"
                            style={{ borderRadius: 8 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    )}
                    
                    <span className={`relative z-10 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                        {item.icon}
                    </span>
                    <span className={`relative z-10 mr-3 hidden lg:inline transition-colors ${isActive ? 'text-white font-bold' : 'text-slate-400 group-hover:text-white'}`}>
                        {item.label}
                    </span>

                    {/* Tooltip for collapsed sidebar */}
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md shadow-lg opacity-0 lg:hidden group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.label}
                    </div>
                </>
            )}
        </NavLink>
    );

    return (
        <aside className="h-screen flex w-20 flex-shrink-0 flex-col justify-between border-l border-white/5 bg-slate-900/50 p-2 backdrop-blur-xl transition-all duration-300 lg:w-64 lg:p-4">
            
            {/* Top Section: Logo and Navigation */}
            <div className="flex flex-col flex-grow min-h-0">
                {/* Logo */}
                <div className="mb-12 text-center flex-shrink-0">
                    <Link to="/student/dashboard" className="text-3xl font-black text-white transition-colors hover:text-cyan-400 hidden lg:inline" style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}>
                        المحاضرة.
                    </Link>
                    <Link to="/student/dashboard" className="lg:hidden text-cyan-400">
                        <Rocket size={32} />
                    </Link>
                </div>
                
                {/* Navigation Links (Scrollable Area) */}
                <nav className="flex-grow space-y-2 overflow-y-auto pr-1">
                    {sidebarItems.map((item) => (
                        <NavItem key={item.href} item={item} />
                    ))}
                </nav>
            </div>

            {/* Bottom Section: Profile and Logout */}
            <div className="border-t border-slate-700/50 pt-4 space-y-2 flex-shrink-0">
                <NavItem item={profileLink} />
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center lg:justify-start rounded-lg p-3 text-slate-400 transition-colors duration-200 hover:bg-red-500/20 hover:text-red-400 group relative"
                    title="تسجيل الخروج"
                >
                    <span className="text-xl"><LogOut size={22} /></span>
                    <span className="mr-3 hidden lg:inline">تسجيل الخروج</span>
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md shadow-lg opacity-0 lg:hidden group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        تسجيل الخروج
                    </div>
                </button>
            </div>
        </aside>
    );
}
