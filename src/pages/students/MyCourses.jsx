import React, { useState, useEffect, useRef } from "react";
import { Cookies } from "react-cookie";
import * as THREE from "three";
import axios from "../../api/axios";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

export default function MyCourses() {
  const [filter, setFilter] = useState("all");
  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const starsRef = useRef({ far: null, mid: null, close: null });
  const clockRef = useRef(new THREE.Clock());

  // Three.js initialization
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
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
        new THREE.BufferAttribute(positions, 3),
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
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  // Scroll animation
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

  const courses = [
    {
      id: 1,
      title: "الفيزياء الكونية للمرحلة الثانوية",
      teacher: "أ. خالد صقر",
      image: "https://placehold.co/600x400/003366/00BFFF?text=الفيزياء+الكونية",
      status: "in-progress",
      completedChapters: 1,
      totalChapters: 4,
      nextTask: "الدرس الثالث - توصيل المقاومات",
    },
    {
      id: 2,
      title: "رياضيات الفضاء المتقدمة",
      teacher: "أ. منى علي",
      image: "https://placehold.co/600x400/2F004F/00BFFF?text=رياضيات+الفضاء",
      status: "in-progress",
      completedChapters: 2,
      totalChapters: 5,
      nextTask: "الدرس الأول - تطبيقات التكامل",
    },
    {
      id: 3,
      title: "الكيمياء الفلكية",
      teacher: "أ. أحمد السيد",
      image: "https://placehold.co/600x400/004c4c/00BFFF?text=الكيمياء+الفلكية",
      status: "completed",
      completedChapters: 4,
      totalChapters: 4,
      nextTask: null,
    },
  ];

  const filteredCourses = courses.filter((course) => {
    if (filter === "all") return true;
    return course.status === filter;
  });

  const cookies = new Cookies();
  const token = cookies.get("token");

  const fetchMyCourses = () => {
    return axios
      .get("/api/StudentCourse/MyCourses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.error("User data fetch error:", error);
      });
  };

  const { data: myCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchMyCourses,
  });

  console.log(myCourses)

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 -z-10 h-full w-full"
      />

      <main
        ref={mainContentRef}
        className="flex-1 overflow-y-auto p-8"
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

        <h1 className="mb-2 text-4xl font-black text-white title-glow">
          أسطول كورساتك
        </h1>
        <p className="mb-8 text-lg text-gray-400">
          جميع الرحلات المعرفية التي انطلقت بها في مجرّتنا.
        </p>

        {/* Filter Buttons */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              filter === "all"
                ? "bg-cyan-500 text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter("in-progress")}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              filter === "in-progress"
                ? "bg-cyan-500 text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            قيد التقدم
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              filter === "completed"
                ? "bg-cyan-500 text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            مكتملة
          </button>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {myCourses?.data.map((course) => (
            <div
              key={course.id}
              className="group flex flex-col overflow-hidden rounded-2xl glass-effect transition-all duration-300 hover:border-cyan-400/30"
            >
              <div className="relative">
                <img
                  src={course.courseImage}
                  alt={course.title}
                  className="h-48 w-full object-cover"
                />
                {course.status === "completed" && (
                  <>
                    <div className="absolute inset-0 bg-green-900/40"></div>
                    <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      مكتمل
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-grow flex-col p-6">
                <h3 className="mb-2 text-xl font-bold text-white">
                  {course.title}
                </h3>
                <p className="mb-4 text-sm text-gray-400">{course.description}</p>

                {course.status === "in-progress" ? (
                  <div className="mb-6 space-y-2 text-sm text-gray-300">
                    <p>
                      الأبواب المكتملة:{" "}
                      <span className="font-bold text-cyan-400">
                        {course.completedChapters} / {course.totalChapters}
                      </span>
                    </p>
                    <p>
                      المهمة التالية:{" "}
                      <span className="font-bold text-white">
                        {course.nextTask}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="mb-6 space-y-2 text-sm text-green-300">
                    <p>
                      حالة المهمة:{" "}
                      <span className="font-bold text-white">
                        منجزة بالكامل
                      </span>
                    </p>
                    <p>
                      الأبواب المكتملة:{" "}
                      <span className="font-bold text-white">
                        {course.completedChapters} / {course.totalChapters}
                      </span>
                    </p>
                  </div>
                )}

                <Link
                  to={`/course/${course.id}`}
                  className={`mt-auto w-full rounded-lg p-3 text-center font-bold transition-colors ${
                    course.status === "completed"
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-cyan-500 text-black hover:bg-cyan-400"
                  }`}
                >
                  {course.status === "completed"
                    ? "عرض الشهادة"
                    : "أكمل الرحلة"}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Discover More */}
        <div className="mt-16 text-center">
          <h2 className="mb-4 text-2xl font-bold">هل أنت مستعد لرحلة جديدة؟</h2>
          <p className="mx-auto mb-6 max-w-lg text-gray-400">
            هناك دائمًا المزيد من الكواكب المعرفية في انتظار من يستكشفها. انطلق
            في مغامرتك التالية.
          </p>
          <Link to="/student/allcourses" className="inline-block rounded-lg bg-purple-600 px-8 py-3 font-bold text-white transition-colors hover:bg-purple-500">
            اكتشف كورسات أخرى
          </Link>
        </div>
      </main>
    </>
  );
};