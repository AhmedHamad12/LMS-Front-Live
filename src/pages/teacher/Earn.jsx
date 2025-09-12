import React, { useEffect, useRef } from "react";
import { Cookies } from "react-cookie";
import { Link } from "react-router-dom";
import * as THREE from "three";
import axios from "../../api/axios";
import { useQuery } from "@tanstack/react-query";

const Earn = () => {
  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const starsRef = useRef({ far: null, mid: null, close: null });

  const cookies = new Cookies();
  const token = cookies.get("token");

  const getTeacherReport = async () => {
    return await axios
      .get(`/api/reports/teacher`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.error("User data fetch error:", error);
      });
  };

  const { data: report } = useQuery({
    queryKey: ["report"],
    queryFn: getTeacherReport,
  });

  // console.log(report);

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
      className="text-gray-100 font-[Cairo] h-screen overflow-hidden w-full"
      dir="rtl"
    >
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10"
      />

      <div className="flex h-screen">
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
          <p
            className="text-4xl font-black text-white mb-2"
            style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
          >
            خزنة الأرباح
          </p>
          <p className="text-gray-400 text-lg mb-8">
            تابع نتائج استثماراتك المعرفية بدقة وشفافية.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            <div className="glass-effect rounded-2xl p-6">
              <p className="text-sm text-gray-400">الرصيد القابل للسحب</p>
              <p className="text-3xl font-black text-green-400">
                {report?.data?.totals?.teacherEarnings}{" "}
                <span className="text-base">جنيه</span>
              </p>
            </div>

            <div className="glass-effect rounded-2xl p-6">
              <p className="text-sm text-gray-400">أرباح هذا الشهر</p>
              <p className="text-3xl font-black text-white">
                {
                  report?.data?.monthlySeries[
                    report?.data?.monthlySeries?.length - 1
                  ]?.teacherEarnings
                }{" "}
                <span className="text-base">جنيه</span>
              </p>
            </div>

            <div className="glass-effect rounded-2xl p-6">
              <p className="text-sm text-gray-400">الاشتراكات النشطة</p>
              <p className="text-3xl font-black text-white">
                {report?.data?.totals?.totalSubscriptions}{" "}
                <span className="text-base">طالب</span>
              </p>
            </div>

            <div className="flex items-center justify-center">
              <button className="w-full h-full p-6 rounded-2xl bg-cyan-500 text-black font-bold text-lg hover:bg-cyan-400 transition-colors">
                طلب سحب الأرباح
              </button>
            </div>
          </div>

          {/* Transaction History and Reports */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">سجل المعاملات الأخير</h2>
              <div className="glass-effect rounded-2xl p-4">
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

            <div>
              <h2 className="text-2xl font-bold mb-6">تقارير الأرباح</h2>
              <div className="glass-effect rounded-2xl p-6 space-y-4">
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
          </div> */}
        </main>
      </div>
    </div>
  );
};

export default Earn;
