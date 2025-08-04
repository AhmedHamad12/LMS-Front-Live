import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [userPoints, setUserPoints] = useState(150);
  const [openCourse, setOpenCourse] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState("12:34:56");

  // Simulate countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const target = new Date(
        now.getTime() + 12 * 60 * 60 * 1000 + 34 * 60 * 1000 + 56 * 1000
      );
      const diff = target - now;

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Background canvas effect
  useEffect(() => {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return; // Exit if canvas is not found

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // Exit if context is not available

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles = [];
    const particleCount = 100;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }

    const animate = () => {
      // Check if context is still available
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient background
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, "#000011");
      gradient.addColorStop(0.5, "#000033");
      gradient.addColorStop(1, "#000000");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 191, 255, ${particle.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const handleAnswerClick = (answer) => {
    if (answer === "الأمبير") {
      setUserPoints((prev) => prev + 25);
      alert("إجابة صحيحة! لقد حصلت على 25 نقطة إضافية!");
    } else {
      alert("إجابة خاطئة. حاول مرة أخرى!");
    }
  };

  return (
    <div
      className="min-h-screen bg-black text-gray-100"
      style={{ fontFamily: "Cairo, sans-serif" }}
    >
      {/* Background Canvas */}
      <canvas
        id="bg-canvas"
        className="fixed top-0 left-0 -z-10 h-full w-full"
      />

      {/* Main Content */}
      <main
        className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
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

        <h1 className="mb-2 text-2xl sm:text-3xl lg:text-4xl font-black text-white title-glow">
          أهلاً بعودتك يا رائد الفضاء!
        </h1>
        <p className="mb-6 sm:mb-8 text-base sm:text-lg text-gray-400">
          مهمتك التالية في انتظارك. استعد للانطلاق.
        </p>

        {/* Low Points Warning */}
        {userPoints < 200 && (
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 rounded-2xl border-2 border-yellow-500/50 glass-effect p-4 sm:p-6">
            <div className="flex items-center">
              <svg
                className="ml-2 sm:ml-4 h-8 sm:h-12 w-8 sm:w-12 flex-shrink-0 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  تحذير: رصيد نقاطك منخفض!
                </h3>
                <p className="text-xs sm:text-sm text-gray-400">
                  تم تجميد بعض الميزات مثل تحدي اليوم ولوحة الشرف. أكمل المهام
                  القادمة لاستعادة رصيدك ومكانتك.
                </p>
              </div>
            </div>
            <button
              onClick={() => setUserPoints(250)}
              className="rounded-lg bg-yellow-400 px-4 sm:px-5 py-2 text-sm font-bold whitespace-nowrap text-black transition-colors hover:bg-yellow-300"
            >
              ابدأ مهمة استعادة
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
          {/* Left Column (Main Content) */}
          <div className="space-y-6 sm:space-y-8 lg:col-span-2">
            <div>
              <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold text-white title-glow">
                مهماتك الحالية (الكورسات)
              </h2>
              <div className="space-y-4">
                {/* Course Accordion 1 */}
                <div className="overflow-hidden rounded-2xl glass-effect">
                  <button
                    onClick={() => setOpenCourse(openCourse === 1 ? null : 1)}
                    className="flex w-full items-center justify-between p-4 sm:p-6 text-right transition-colors hover:bg-white/5"
                  >
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        الفيزياء الكونية للمرحلة الثانوية
                      </h3>
                      <p className="text-sm text-gray-400">مع أ. خالد صقر</p>
                    </div>
                    <svg
                      className={`h-6 w-6 transform text-cyan-400 transition-transform duration-300 ${
                        openCourse === 1 ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>
                  {openCourse === 1 && (
                    <div className="animate-in slide-in-from-top-2 space-y-4 border-t border-white/10 px-4 sm:px-6 pb-4 sm:pb-6 duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 gap-2 sm:gap-0">
                        <div>
                          <p className="font-bold text-white">
                            الباب الأول: الكهربية التياريه
                          </p>
                          <p className="text-sm text-green-400">
                            مكتمل (8/8 دروس)
                          </p>
                        </div>
                        <div className="rounded-full bg-green-500/20 p-2">
                          <svg
                            className="h-5 w-5 text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/5 pt-4 gap-2 sm:gap-0">
                        <div>
                          <p className="font-bold text-white">
                            الباب الثاني: التأثير المغناطيسي
                          </p>
                          <p className="text-sm text-cyan-400">
                            متاح (3/10 دروس)
                          </p>
                        </div>
                        <Link
                          to="#"
                          className="rounded-full bg-cyan-500 px-4 py-1 text-sm font-bold text-black transition-colors hover:bg-cyan-400"
                        >
                          أكمل
                        </Link>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/5 pt-4 opacity-50 gap-2 sm:gap-0">
                        <div>
                          <p className="font-bold text-white">
                            الباب الثالث: الحث الكهرومغناطيسي
                          </p>
                          <p className="text-sm text-gray-400">قريباً</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Course Accordion 2 */}
                <div className="overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-blue-900/40 to-gray-900/50 backdrop-blur-md">
                  <button
                    onClick={() => setOpenCourse(openCourse === 2 ? null : 2)}
                    className="flex w-full items-center justify-between p-4 sm:p-6 text-right transition-colors hover:bg-white/5"
                  >
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        رياضيات الفضاء المتقدمة
                      </h3>
                      <p className="text-sm text-gray-400">مع أ. منى علي</p>
                    </div>
                    <svg
                      className={`h-6 w-6 transform text-cyan-400 transition-transform duration-300 ${
                        openCourse === 2 ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>
                  {openCourse === 2 && (
                    <div className="animate-in slide-in-from-top-2 space-y-4 border-t border-white/10 px-4 sm:px-6 pb-4 sm:pb-6 duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 gap-2 sm:gap-0">
                        <div>
                          <p className="font-bold text-white">
                            الوحدة الأولى: التفاضل والتكامل
                          </p>
                          <p className="text-sm text-cyan-400">
                            متاح (5/12 دروس)
                          </p>
                        </div>
                        <Link
                          to="#"
                          className="rounded-full bg-cyan-500 px-4 py-1 text-sm font-bold text-black transition-colors hover:bg-cyan-400"
                        >
                          أكمل
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Daily Challenge */}
            <div>
              <h2
                className="mt-6 sm:mt-8 mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold text-white"
                style={{ textShadow: "0 0 8px rgba(0, 191, 255, 0.5)" }}
              >
                تحدي اليوم الذكي
              </h2>
              <div
                className={`relative rounded-2xl border border-white/5 bg-gradient-to-br from-purple-900/40 to-gray-900/50 p-4 sm:p-6 backdrop-blur-md ${
                  userPoints < 200 ? "opacity-40" : ""
                }`}
              >
                {userPoints < 200 && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
                    <div className="rounded-full bg-red-900/50 p-2">
                      <svg
                        className="h-6 sm:h-8 w-6 sm:w-8 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-start">
                  <div className="mr-0 sm:mr-4 mb-4 sm:mb-0 h-fit rounded-full bg-purple-500/20 p-2">
                    <svg
                      className="h-6 w-6 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      ></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-purple-300">
                      من كوكب الفيزياء
                    </p>
                    <p className="text-base sm:text-lg font-bold text-white">
                      ما هي وحدة قياس شدة التيار الكهربي؟
                    </p>
                    <p className="mb-4 text-sm text-gray-400">
                      أجب على السؤال واحصل على 25 نقطة إضافية!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <button
                        onClick={() => handleAnswerClick("الأوم")}
                        className="flex-1 rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20"
                        disabled={userPoints < 200}
                      >
                        الأوم
                      </button>
                      <button
                        onClick={() => handleAnswerClick("الأمبير")}
                        className="flex-1 rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20"
                        disabled={userPoints < 200}
                      >
                        الأمبير
                      </button>
                      <button
                        onClick={() => handleAnswerClick("الفولت")}
                        className="flex-1 rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20"
                        disabled={userPoints < 200}
                      >
                        الفولت
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar Content) */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2
                className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold text-white"
                style={{ textShadow: "0 0 8px rgba(0, 191, 255, 0.5)" }}
              >
                مركز القيادة
              </h2>
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-blue-900/40 to-gray-900/50 p-4 sm:p-6 text-center backdrop-blur-md">
                <p className="text-gray-400">ترتيبك على المجرّة</p>
                <p
                  className={`text-4xl sm:text-6xl font-black ${
                    userPoints < 200 ? "text-red-400" : "text-cyan-400"
                  }`}
                  style={
                    userPoints >= 200
                      ? { textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }
                      : {}
                  }
                >
                  7
                </p>
                <div className="my-4 h-px bg-white/10"></div>
                <p className="text-center text-sm text-gray-300">
                  نقاطك الحالية:{" "}
                  <span
                    className={`font-bold ${
                      userPoints < 200 ? "text-red-400" : "text-white"
                    }`}
                  >
                    {userPoints}
                  </span>
                </p>
              </div>
            </div>

            {/* Priority Missions */}
            <div>
              <h2
                className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold text-white"
                style={{ textShadow: "0 0 8px rgba(0, 191, 255, 0.5)" }}
              >
                مهام ذات أولوية
              </h2>
              <div className="space-y-3 rounded-2xl border border-white/5 bg-gradient-to-br from-blue-900/40 to-gray-900/50 p-4 backdrop-blur-md">
                <Link
                  to="#"
                  className="block rounded-lg bg-yellow-500/10 p-3 transition-colors hover:bg-yellow-500/20"
                >
                  <div className="mb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                    <p className="text-sm font-bold text-yellow-300">
                      واجب الفيزياء - الفصل الثاني
                    </p>
                    <span className="rounded-full bg-yellow-900/50 px-2 py-1 font-mono text-xs text-yellow-300">
                      ينتهي خلال {timeRemaining}
                    </span>
                  </div>
                  <p className="text-xs text-yellow-400/80">
                    أكمله الآن واحصل على وسام السرعة + 50 نقطة!
                  </p>
                </Link>
              </div>
            </div>

            {/* Incoming Data */}
            <div>
              <h2
                className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold text-white"
                style={{ textShadow: "0 0 8px rgba(0, 191, 255, 0.5)" }}
              >
                البيانات الواردة
              </h2>
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-blue-900/40 to-gray-900/50 p-4 backdrop-blur-md">
                <div className="max-h-48 space-y-3 overflow-y-auto pr-2">
                  <div className="flex items-start">
                    <div className="h-fit rounded-full bg-cyan-500/20 p-2">
                      <svg
                        className="h-5 w-5 text-cyan-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        ></path>
                      </svg>
                    </div>
                    <div className="mr-3">
                      <p className="text-sm font-bold text-white">
                        تم رفع الدرس الثالث في{" "}
                        <span className="text-cyan-400">الرياضيات</span>.
                      </p>
                      <p className="text-xs text-gray-400">منذ 3 ساعات</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-fit rounded-full bg-green-500/20 p-2">
                      <svg
                        className="h-5 w-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 6l-3.5-7L9 12l-4 8 4-4 2 2 4-4z"
                        ></path>
                      </svg>
                    </div>
                    <div className="mr-3">
                      <p className="text-sm font-bold text-white">
                        لقد صعدت للمركز السابع!
                      </p>
                      <p className="text-xs text-gray-400">بالأمس</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-fit rounded-full bg-purple-500/20 p-2">
                      <svg
                        className="h-5 w-5 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                    <div className="mr-3">
                      <p className="text-sm font-bold text-white">
                        تذكير: البث المباشر للمراجعة غداً.
                      </p>
                      <p className="text-xs text-gray-400">منذ يومين</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 border-t border-white/10 pt-3">
                  <Link
                    to="#"
                    className="block text-center text-sm font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    عرض كل البيانات
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
