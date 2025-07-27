import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";

const Earn = () => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const starsRef = useRef({ far: null, mid: null, close: null });

  // Three.js setup
  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Store references
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Starfield creation
    const createStarfield = (count, size, color) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      }
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      const material = new THREE.PointsMaterial({
        size: size,
        color: color,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.7,
      });
      const starfield = new THREE.Points(geometry, material);
      scene.add(starfield);
      return starfield;
    };

    const starsFar = createStarfield(8000, 0.05, 0x888888);
    const starsMid = createStarfield(5000, 0.1, 0xbbbbbb);
    const starsClose = createStarfield(1500, 0.15, 0xffffff);

    starsRef.current = { far: starsFar, mid: starsMid, close: starsClose };

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      starsFar.rotation.y = elapsedTime * 0.01;
      starsMid.rotation.y = elapsedTime * 0.02;
      starsClose.rotation.y = elapsedTime * 0.03;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
    };

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Scroll-based animation
  useEffect(() => {
    const handleScroll = () => {
      if (!mainContentRef.current || !cameraRef.current) return;
      const scrollY = mainContentRef.current.scrollTop;
      const docHeight =
        mainContentRef.current.scrollHeight -
        mainContentRef.current.clientHeight;
      const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;

      cameraRef.current.position.z = 5 - scrollPercent * 10;
    };

    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener("scroll", handleScroll);
      return () => mainContent.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const navigationItems = [
    {
      title: "لوحة التحكم",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
      active: false,
    },
    {
      title: "كورساتي",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      active: false,
    },
    {
      title: "الطلاب",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      active: false,
    },
    {
      title: "الأرباح",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      active: true,
    },
  ];

  const transactions = [
    {
      description: "اشتراك شهري من الطالب",
      student: "خالد علي",
      amount: "+ 15.00 جنيه",
      positive: true,
    },
    {
      description: 'بيع "الباب الثاني - فيزياء" للطالبة',
      student: "سارة القحطاني",
      amount: "+ 40.00 جنيه",
      positive: true,
    },
    {
      description: "اشتراك شهري من الطالب",
      student: "يوسف الأحمد",
      amount: "+ 15.00 جنيه",
      positive: true,
    },
    {
      description: "سحب أرباح",
      student: "",
      amount: "- 5000.00 جنيه",
      positive: false,
    },
  ];

  return (
    <div
      className="bg-black text-gray-100 h-screen overflow-hidden"
      dir="rtl"
      style={{ fontFamily: "Cairo, sans-serif" }}
    >
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10"
      />

      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-20 lg:w-64 bg-gradient-to-br from-slate-800/40 to-slate-900/50 backdrop-blur-sm border border-white/5 p-2 lg:p-6 flex flex-col justify-between transition-all duration-300 flex-shrink-0">
          <div>
            {/* Logo */}
            <div
              className="text-3xl font-black text-center mb-12 text-white"
              style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
            >
              <Link to="/home" className="block">
                <span className="hidden lg:inline">المجرّة.</span>
                <span className="lg:hidden">🚀</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="space-y-4">
              {navigationItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.title === "لوحة التحكم" ? "/teacher/dashboard" : 
                      item.title === "كورساتي" ? "/teacher/courses" :
                      item.title === "الطلاب" ? "/teacher/students" :
                      item.title === "الأرباح" ? "/teacher/earn" : "#"}
                  className={`flex items-center justify-center lg:justify-start p-3 rounded-lg transition-colors ${
                    item.active
                      ? "bg-cyan-500/20 text-white font-bold"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                  title={item.title}
                >
                  {item.icon}
                  <span className="hidden lg:inline mr-3">{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <div
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="bg-gradient-to-br from-slate-800/40 to-slate-900/50 backdrop-blur-sm border border-white/5 p-2 lg:p-3 rounded-lg flex items-center justify-center lg:justify-start cursor-pointer"
            >
              <img
                src="https://placehold.co/40x40/000000/ffffff?text=أ.خ"
                alt="صورة المستخدم"
                className="w-10 h-10 rounded-full border-2 border-cyan-400"
              />
              <div className="hidden lg:block mr-3">
                <p className="font-bold text-white">أ. خالد صقر</p>
                <p className="text-xs text-gray-400">مدرس فيزياء</p>
              </div>
            </div>

            {profileMenuOpen && (
              <div className="absolute bottom-full mb-2 w-full bg-gradient-to-br from-slate-800/40 to-slate-900/50 backdrop-blur-sm border border-white/5 rounded-lg overflow-hidden">
                <Link
                  to="/teacher/profile"
                  className="block px-4 py-3 text-right text-sm text-gray-200 hover:bg-white/10"
                >
                  الملف الشخصي
                </Link>
                <Link
                  to="/logout"
                  className="block px-4 py-3 text-right text-sm text-red-400 hover:bg-red-500/20"
                >
                  تسجيل الخروج
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main
          ref={mainContentRef}
          className="flex-1 p-8 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#00BFFF rgba(0,0,0,0.2)",
          }}
        >
          <style jsx>{`
            main::-webkit-scrollbar {
              width: 6px;
            }
            main::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.2);
            }
            main::-webkit-scrollbar-thumb {
              background: #00bfff;
              border-radius: 10px;
            }
            main::-webkit-scrollbar-thumb:hover {
              background: #009acd;
            }
          `}</style>

          {/* Header */}
          <h1
            className="text-4xl font-black text-white mb-2"
            style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
          >
            خزنة الأرباح
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            تابع نتائج استثماراتك المعرفية بدقة وشفافية.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
              <p className="text-sm text-gray-400">الرصيد القابل للسحب</p>
              <p className="text-3xl font-black text-green-400">
                18,750 <span className="text-base">جنيه</span>
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
              <p className="text-sm text-gray-400">أرباح هذا الشهر</p>
              <p className="text-3xl font-black text-white">
                12,500 <span className="text-base">جنيه</span>
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
              <p className="text-sm text-gray-400">الاشتراكات النشطة</p>
              <p className="text-3xl font-black text-white">
                350 <span className="text-base">طالب</span>
              </p>
            </div>

            <div className="flex items-center justify-center">
              <button className="w-full h-full p-6 rounded-2xl bg-cyan-500 text-black font-bold text-lg hover:bg-cyan-400 transition-colors">
                طلب سحب الأرباح
              </button>
            </div>
          </div>

          {/* Transaction History and Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Transaction History */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">سجل المعاملات الأخير</h2>
              <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-4">
                <div className="space-y-2">
                  {transactions.map((transaction, index) => (
                    <div
                      key={index}
                      className="p-3 flex justify-between items-center hover:bg-white/5 rounded-lg"
                    >
                      <p className="text-sm">
                        {transaction.description}
                        {transaction.student && (
                          <span className="font-bold text-white">
                            {" "}
                            {transaction.student}
                          </span>
                        )}
                      </p>
                      <p
                        className={`font-bold ${
                          transaction.positive
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {transaction.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reports */}
            <div>
              <h2 className="text-2xl font-bold mb-6">تقارير الأرباح</h2>
              <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 space-y-4">
                <div>
                  <label
                    htmlFor="report_month"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    عرض تقرير شهر
                  </label>
                  <select
                    id="report_month"
                    className="w-full p-2 rounded-lg bg-black/20 border border-white/10 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none text-white"
                  >
                    <option>يونيو 2024</option>
                    <option>مايو 2024</option>
                    <option>أبريل 2024</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="report_course"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    عرض تقرير كورس
                  </label>
                  <select
                    id="report_course"
                    className="w-full p-2 rounded-lg bg-black/20 border border-white/10 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none text-white"
                  >
                    <option>كل الكورسات</option>
                    <option>الفيزياء الكونية</option>
                    <option>الفيزياء الحديثة</option>
                  </select>
                </div>

                <button className="w-full p-3 mt-2 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition-colors">
                  تحميل التقرير (PDF)
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Earn;
