import { Link } from "react-router";

function AsideBar() {
  const sidebarItems = [
    { href: "/dashboard", icon: "📊", label: "لوحة التحكم" },
    { href: "/my-courses", icon: "📚", label: "كورساتي" },
    { href: "#", icon: "📝", label: "الواجبات" },
    { href: "#", icon: "📄", label: "الامتحانات" },
    { href: "/prize", icon: "🏆", label: "لوحة الشرف" },
    { href: "#", icon: "🎁", label: "المكافآت" },
  ];

  return (
    <aside className="flex w-20 flex-shrink-0 flex-col justify-between border-r border-white/5 bg-gradient-to-br from-blue-900/20 to-purple-900/30 p-2 backdrop-blur-md transition-all duration-300 lg:w-64 lg:p-6">
      <div>
        <div className="mb-12 text-center text-3xl font-black text-white">
          <a
            href="#"
            className="transition-colors hover:text-cyan-400"
            style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
          >
            <Link to="/home" className="hidden lg:inline">
              المجرّة.
            </Link>
            <span className="lg:hidden">🚀</span>
          </a>
        </div>
        <nav className="space-y-4">
          {sidebarItems.map((item, index) => (
            <Link
              to={item.href}
              key={index}
              className={`flex items-center justify-center rounded-lg p-3 text-gray-300 transition-colors hover:bg-white/10 lg:justify-start ${
                item.href === window.location.pathname
                  ? "bg-cyan-500/20 font-bold text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`}
              title={item.label}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="mr-3 hidden lg:inline">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div>
        <Link
          to="/profile"
          className={`flex items-center justify-center rounded-lg p-3 text-gray-300 transition-colors hover:bg-white/10 lg:justify-start ${
            window.location.pathname === "/profile"
              ? "bg-cyan-500/20 font-bold text-white"
              : ""
          }`}
        >
          <span className="text-xl">👤</span>
          <span className="mr-3 hidden lg:inline">الملف الشخصي</span>
        </Link>
      </div>
    </aside>
  );
}

export default AsideBar;
