import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";

const TeacherStudents = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [studentForChallenge, setStudentForChallenge] = useState(null);
  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const starsRef = useRef({ far: null, mid: null, close: null });
  const clockRef = useRef(new THREE.Clock());

  const students = [
    {
      id: 1,
      name: "خالد علي",
      avatar: "https://placehold.co/60x60/ffffff/000000?text=خ",
      joined: "2024-05-10",
      courses: ["الفيزياء الكونية", "الفيزياء الحديثة"],
      rank: 128,
      performance: "struggling",
    },
    {
      id: 2,
      name: "سارة القحطاني",
      avatar: "https://placehold.co/60x60/ffffff/000000?text=س",
      joined: "2024-03-22",
      courses: ["الفيزياء الكونية"],
      rank: 4,
      performance: "excellent",
    },
    {
      id: 3,
      name: "يوسف الأحمد",
      avatar: "https://placehold.co/60x60/ffffff/000000?text=ي",
      joined: "2024-06-01",
      courses: ["الفيزياء الحديثة"],
      rank: 25,
      performance: "good",
    },
    {
      id: 4,
      name: "مريم ياسر",
      avatar: "https://placehold.co/60x60/ffffff/000000?text=م",
      joined: "2024-02-15",
      courses: ["الفيزياء الكونية"],
      rank: 89,
      performance: "average",
    },
  ];

  const filteredStudents = students.filter(
    (student) =>
      (filter === "all" || student.courses.includes(filter)) &&
      (search === "" ||
        student.name.toLowerCase().includes(search.toLowerCase()))
  );

  const openChallengeModal = (student) => {
    setStudentForChallenge(student);
    setShowChallengeModal(true);
  };

  // Three.js setup
  useEffect(() => {
    if (!canvasRef.current) return;

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

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Create starfield
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

    starsRef.current.far = createStarfield(8000, 0.05, 0x888888);
    starsRef.current.mid = createStarfield(5000, 0.1, 0xbbbbbb);
    starsRef.current.close = createStarfield(1500, 0.15, 0xffffff);

    // Animation loop
    const animate = () => {
      const elapsedTime = clockRef.current.getElapsedTime();
      starsRef.current.far.rotation.y = elapsedTime * 0.01;
      starsRef.current.mid.rotation.y = elapsedTime * 0.02;
      starsRef.current.close.rotation.y = elapsedTime * 0.03;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Scroll-based animation
  useEffect(() => {
    const moveCameraAndStars = () => {
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
      mainContent.addEventListener("scroll", moveCameraAndStars);
      return () =>
        mainContent.removeEventListener("scroll", moveCameraAndStars);
    }
  }, []);

  return (
    <div
      className="text-gray-100 font-[Cairo] h-screen overflow-hidden w-full"
      dir="rtl"
    >
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10"
      />

      {/* Challenge Modal */}
      {showChallengeModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 opacity-100 transition-opacity">
          <div
            className="glass-effect border border-yellow-500/20 rounded-2xl w-full max-w-lg shadow-2xl shadow-yellow-500/10 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="p-4 border-b border-white/10 flex-shrink-0">
              <h2 className="text-2xl font-bold text-white">تعيين تحدي خاص</h2>
              <p className="text-sm text-yellow-300">
                للطالب: {studentForChallenge?.name}
              </p>
            </header>
            <div className="p-6 flex-grow space-y-4">
              <div>
                <label
                  htmlFor="challenge_question"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  نص السؤال
                </label>
                <textarea
                  id="challenge_question"
                  rows="4"
                  className="w-full p-2 rounded-lg bg-black/20 border border-white/10 text-white focus:bg-black/40 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] outline-none transition-all duration-300"
                  placeholder="اكتب سؤالاً صعبًا لتحفيز الطالب..."
                />
              </div>
              <div>
                <label
                  htmlFor="challenge_points"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  النقاط المكتسبة عند الإجابة الصحيحة
                </label>
                <input
                  type="number"
                  id="challenge_points"
                  defaultValue="100"
                  max="200"
                  className="w-full p-2 rounded-lg bg-black/20 border border-white/10 text-white focus:bg-black/40 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] outline-none transition-all duration-300"
                />
                <p className="text-xs text-gray-500 mt-1">
                  الحد الأقصى للنقاط هو 200 نقطة.
                </p>
              </div>
            </div>
            <footer className="p-4 border-t border-white/10 flex-shrink-0 flex justify-end gap-4">
              <button
                onClick={() => setShowChallengeModal(false)}
                className="px-5 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors text-sm font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={() => setShowChallengeModal(false)}
                className="px-6 py-2 rounded-lg bg-yellow-400 text-black hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-500/20 text-sm font-bold"
              >
                إرسال التحدي
              </button>
            </footer>
          </div>
        </div>
      )}

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
          <h1
            className="text-4xl font-black text-white mb-2"
            style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
          >
            قائمة طاقم المجرّة
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            تابع رواد الفضاء المسجلين في رحلاتك المعرفية.
          </p>

          {/* Search and Filter */}
          <div className="glass-effect rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن طالب..."
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pr-10 text-white focus:bg-black/40 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] outline-none transition-all duration-300"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-400 ml-2">
                فلترة حسب الكورس:
              </span>
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-2 rounded-lg font-bold text-xs transition-colors ${
                  filter === "all"
                    ? "bg-cyan-500 text-black"
                    : "bg-white/10 text-white"
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilter("الفيزياء الكونية")}
                className={`px-3 py-2 rounded-lg font-bold text-xs transition-colors ${
                  filter === "الفيزياء الكونية"
                    ? "bg-cyan-500 text-black"
                    : "bg-white/10 text-white"
                }`}
              >
                الفيزياء الكونية
              </button>
              <button
                onClick={() => setFilter("الفيزياء الحديثة")}
                className={`px-3 py-2 rounded-lg font-bold text-xs transition-colors ${
                  filter === "الفيزياء الحديثة"
                    ? "bg-cyan-500 text-black"
                    : "bg-white/10 text-white"
                }`}
              >
                الفيزياء الحديثة
              </button>
            </div>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className={`glass-effect rounded-2xl p-6 text-center transform hover:-translate-y-2 transition-transform duration-300 ${
                  student.performance === "struggling"
                    ? "border-2 border-red-500/50"
                    : ""
                }`}
              >
                <div className="relative inline-block">
                  <img
                    src={student.avatar}
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-cyan-400/30"
                    alt={student.name}
                  />
                  <span className="absolute bottom-4 -right-1 bg-gray-900 px-2 py-1 text-xs font-bold rounded-md border border-white/10">
                    #{student.rank}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{student.name}</h3>
                <p className="text-sm text-gray-400 mb-4">
                  انضم في: {student.joined}
                </p>
                <div className="text-xs text-center text-cyan-300 mb-6">
                  مشترك في{" "}
                  <span className="font-bold">{student.courses.length}</span>{" "}
                  كورسات
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    to="#"
                    className="w-full text-center block p-3 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition-colors text-sm"
                  >
                    عرض الملف
                  </Link>
                  {student.performance === "struggling" && (
                    <button
                      onClick={() => openChallengeModal(student)}
                      className="w-full text-center block p-3 rounded-lg bg-yellow-500/20 text-yellow-300 font-bold hover:bg-yellow-500/30 transition-colors text-sm"
                    >
                      تعيين تحدي خاص
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* No results message */}
            {filteredStudents.length === 0 && (
              <div className="md:col-span-2 xl:col-span-3 text-center py-16">
                <svg
                  className="w-16 h-16 mx-auto text-gray-600 mb-4"
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
                <h3 className="text-xl font-bold text-white">
                  لا يوجد طلاب يطابقون بحثك
                </h3>
                <p className="text-gray-400">
                  حاول تغيير كلمات البحث أو الفلتر.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherStudents;
