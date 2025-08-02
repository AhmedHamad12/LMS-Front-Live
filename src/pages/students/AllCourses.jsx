import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { Cookies } from "react-cookie";
import { Link } from "react-router-dom";
import * as THREE from "three";

const AllCourses = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const starsRef = useRef({ far: null, mid: null, close: null });

  const cookies = new Cookies();
  const token = cookies.get("token");

  const fetchCourses = () => {
    return axios
      .get("http://lms278.runasp.net/api/Course/GetAllCourses", {
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.error("User data fetch error:", error);
      });
  };

  const { data: allCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });

  console.log(allCourses?.data);

  const filteredCourses = allCourses?.data.filter(
    (course) =>
      // (filter === "all" || course.subject === filter) &&
      (search === "" ||
        course.title.includes(search) ||
        course.teacher.firstName.includes(search))
  );

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
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      if (starsRef.current.far)
        starsRef.current.far.rotation.y = elapsedTime * 0.01;
      if (starsRef.current.mid)
        starsRef.current.mid.rotation.y = elapsedTime * 0.02;
      if (starsRef.current.close)
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
    const handleScroll = () => {
      if (!mainContentRef.current || !cameraRef.current) return;
      const scrollY = mainContentRef.current.scrollTop;
      const docHeight =
        mainContentRef.current.scrollHeight -
        mainContentRef.current.clientHeight;
      const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;

      cameraRef.current.position.z = 5 - scrollPercent * 10;
    };

    if (mainContentRef.current) {
      mainContentRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (mainContentRef.current) {
        mainContentRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const filterButtons = [
    { key: "all", label: "الكل" },
    { key: "physics", label: "فيزياء" },
    { key: "chemistry", label: "كيمياء" },
    { key: "math", label: "رياضيات" },
    { key: "biology", label: "أحياء" },
    { key: "other", label: "أخرى" },
  ];

  console.log(filteredCourses);

  return (
    <div
      className=" text-gray-100 font-[Cairo] h-screen overflow-hidden w-full"
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
          <h1
            className="text-4xl font-black text-white mb-2"
            style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
          >
            اكتشف كواكب المعرفة
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            ابحث عن رحلتك التعليمية التالية في مجرّتنا الواسعة.
          </p>

          {/* Search and Filter */}
          <div className="bg-gradient-to-r from-slate-900/40 to-slate-800/50 backdrop-blur-2xl border border-white/5 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن كورس أو مدرس..."
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pr-10 focus:outline-none focus:bg-black/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all text-white placeholder-gray-400"
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
              {filterButtons.map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setFilter(btn.key)}
                  className={`px-3 py-2 rounded-lg font-bold text-xs transition-colors ${
                    filter === btn.key
                      ? "bg-cyan-500 text-black"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCourses?.map((course, index) => (
              <div
                key={index}
                className="bg-gradient-to-b from-slate-900/40 to-slate-800/50 backdrop-blur-2xl border border-white/5 rounded-2xl overflow-hidden group flex flex-col transform hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,191,255,0.2)]"
              >
                <img
                  src={course.courseImage}
                  alt="صورة كورس"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">{`مع ${`${course.teacher.firstName} ${course.teacher.lastName}`}`}</p>
                  <div className="flex-grow"></div>
                  <Link
                    to={`/students/course/data/${course.id}`}
                    className="w-full mt-auto text-center block p-3 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors transform hover:scale-105"
                  >
                    عرض التفاصيل
                  </Link>
                </div>
              </div>
            ))}

            {/* No results message */}
            {filteredCourses?.length === 0 && (
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
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-bold text-white">
                  لا توجد نتائج تطابق بحثك
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

export default AllCourses;
