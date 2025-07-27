import { Link, useLocation } from "react-router-dom";

function StudentsSideBar() {
  const location = useLocation();

  return (
    <aside className="w-20 lg:w-64 glass-effect p-2 lg:p-6 flex flex-col justify-between transition-all duration-300 flex-shrink-0">
      <div>
        <div className="text-3xl font-black text-center mb-12 text-white">
          <Link
            to="/"
            className="hover:text-cyan-400 transition-colors title-glow"
          >
            <span className="hidden lg:inline">المجرّة.</span>
            <span className="lg:hidden">🚀</span>
          </Link>
        </div>
        <nav className="space-y-4">
          {[
            {
              to: "/students/dashboard",
              title: "لوحة التحكم",
              icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z",
            },
            {
              to: "/students/mycourses",
              title: "كورساتي",
              icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
            },
            {
              to: "/students/mytasks",
              title: "الواجبات",
              icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
            },
            {
              to: "/students/myexams",
              title: "الامتحانات",
              icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
            },
            {
              to: "/students/rewards",
              title: "لوحة الشرف",
              icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
            },
            {
              to: "/students/prize",
              title: "المكافآت",
              icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1",
            },
            {
              to: "/students/profile",
              title: "الملف الشخصي",
              icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
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
                    isActive
                      ? "text-cyan-400"
                      : "group-hover:text-cyan-400"
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
                <span className={`hidden lg:ml-3 lg:block transition-colors ${
                  isActive
                    ? "text-cyan-400 font-semibold"
                    : "group-hover:text-cyan-400"
                }`}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="hidden lg:block">
        <div className="text-center text-gray-400 text-sm">
          <p>المجرّة التعليمية</p>
          <p className="text-xs">© 2024</p>
        </div>
      </div>
    </aside>
  );
}

export default StudentsSideBar;
