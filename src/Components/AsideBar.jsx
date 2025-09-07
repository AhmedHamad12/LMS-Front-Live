import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Cookies } from 'react-cookie';

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
    Rocket
} from 'lucide-react';

function AsideBar() {
  const navigate = useNavigate();
  const cookies = new Cookies();

  const sidebarItems = [
    { href: "/dashboard", icon: <LayoutDashboard size={24} />, label: "لوحة التحكم" },
    { href: "/my-courses", icon: <BookCopy size={24} />, label: "كورساتي" },
    { href: "#", icon: <ClipboardCheck size={24} />, label: "الواجبات" },
    { href: "#", icon: <FileText size={24} />, label: "الامتحانات" },
    { href: "/prize", icon: <Trophy size={24} />, label: "لوحة الشرف" },
    { href: "#", icon: <Gift size={24} />, label: "المكافآت" },
  ];
  
  // دالة تسجيل الخروج
  const handleLogout = () => {
    // قم بإزالة التوكن من الكوكيز
    cookies.remove('token', { path: '/' }); 
    
    // أعد توجيه المستخدم لصفحة تسجيل الدخول
    // استخدام replace: true يمنع المستخدم من العودة للصفحة السابقة بزر "back" في المتصفح
    navigate('/login', { replace: true }); 
  };
  
  // دالة لتحديد تنسيق الرابط النشط وغير النشط
  const getNavLinkClass = ({ isActive }) => {
    const baseClasses = "flex items-center justify-center lg:justify-start rounded-lg p-3 transition-colors duration-200";
    const inactiveClasses = "text-slate-400 hover:bg-white/10 hover:text-white";
    const activeClasses = "bg-cyan-500/20 text-white font-bold border-r-4 border-cyan-400 shadow-inner shadow-cyan-500/10";
    
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <aside className="flex w-20 flex-shrink-0 flex-col justify-between border-l border-white/5 bg-slate-900/50 p-2 backdrop-blur-xl transition-all duration-300 lg:w-64 lg:p-4">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="mb-12 text-center">
          <Link 
            to="/home" 
            className="text-3xl font-black text-white transition-colors hover:text-cyan-400 hidden lg:inline"
            style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
          >
            المحاضرة.
          </Link>
          <Link to="/home" className="lg:hidden text-cyan-400">
            <Rocket size={32} />
          </Link>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-grow space-y-3">
          {sidebarItems.map((item, index) => (
            <NavLink
              to={item.href}
              key={index}
              className={getNavLinkClass}
              end={item.href === "/dashboard"} // Ensures only dashboard is active on exact path
              title={item.label}
            >
              <span className="text-xl lg:ml-3">{item.icon}</span>
              <span className="mr-3 hidden lg:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Profile and Logout Section */}
      <div className="border-t border-slate-700/50 pt-4 space-y-3">
        <NavLink to="/profile" className={getNavLinkClass} title="الملف الشخصي">
          <span className="text-xl lg:ml-3"><User size={24} /></span>
          <span className="mr-3 hidden lg:inline">الملف الشخصي</span>
        </NavLink>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center lg:justify-start rounded-lg p-3 text-slate-400 transition-colors duration-200 hover:bg-red-500/20 hover:text-red-400"
          title="تسجيل الخروج"
        >
          <span className="text-xl lg:ml-3"><LogOut size={24} /></span>
          <span className="mr-3 hidden lg:inline">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}

export default AsideBar;