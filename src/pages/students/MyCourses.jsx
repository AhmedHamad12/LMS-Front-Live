import React, { useState, useEffect, useRef } from "react";
import { Cookies } from "react-cookie";
import * as THREE from "three";
import axios from "../../api/axios";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../../Components/Loading";

export default function MyCourses() {
  const [filter, setFilter] = useState("all");
  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const starsRef = useRef({ far: null, mid: null, close: null });
  const clockRef = useRef(new THREE.Clock());
  const navigate = useNavigate();

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

  const { data: myCourses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchMyCourses,
  });


  const getFilteredCourses = () => {
    if (!myCourses?.data) return [];

    return myCourses.data.filter((course) => {
      const progress = course.progress || 0;
      
      switch (filter) {
        case "completed":
          return progress >= 100; // 100% completed
        case "in-progress":
          return progress > 0 && progress < 100; // Started but not finished
        case "all":
        default:
          return true; // Show all courses
      }
    });
  };

  // Get course status based on progress
  const getCourseStatus = (progress) => {
    if (progress >= 100) return "completed";
    if (progress > 0) return "in-progress";
    return "not-started";
  };

  // Get course button text based on status
  const getButtonText = (progress) => {
    if (progress >= 100) return "عرض الشهادة";
    if (progress > 0) return "أكمل الرحلة";
    return "ابدأ الرحلة";
  };

  // Get course button styling based on status
  const getButtonStyle = (progress) => {
    if (progress >= 100) {
      return "bg-green-600 text-white hover:bg-green-500";
    }
    return "bg-cyan-500 text-black hover:bg-cyan-400";
  };

  // Get counts for filter buttons
  const getCounts = () => {
    if (!myCourses?.data) return { all: 0, inProgress: 0, completed: 0 };

    const courses = myCourses.data;
    return {
      all: courses.length,
      inProgress: courses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100).length,
      completed: courses.filter(c => (c.progress || 0) >= 100).length,
    };
  };

  const filteredCourses = getFilteredCourses();
  const counts = getCounts();


  if (isLoading) {
    return <Loading />;
  }

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
          جميع الكورسات المعرفية التي انطلقت بها في المنصة.
        </p>

        {/* Filter Buttons with counts */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              filter === "all"
                ? "bg-cyan-500 text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            الكل ({counts.all})
          </button>
          <button
            onClick={() => setFilter("in-progress")}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              filter === "in-progress"
                ? "bg-cyan-500 text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            قيد التقدم ({counts.inProgress})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              filter === "completed"
                ? "bg-cyan-500 text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            مكتملة ({counts.completed})
          </button>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-lg">
                {filter === "completed" && "لا توجد كورسات مكتملة"}
                {filter === "in-progress" && "لا توجد كورسات قيد التقدم"}
                {filter === "all" && "لا توجد كورسات"}
              </div>
            </div>
          ) : (
            filteredCourses.map((course) => {
              const courseProgress = course?.progress || 0;
              const courseStatus = getCourseStatus(courseProgress);
              
              return (
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
                    
                    {/* Progress overlay for completed courses */}
                    {courseStatus === "completed" && (
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

                    {/* Progress overlay for in-progress courses */}
                    {courseStatus === "in-progress" && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-cyan-500 px-3 py-1 text-xs font-bold text-black">
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v2h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2H7a1 1 0 110-2h2V7z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        {Math.round(courseProgress)}%
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-grow flex-col p-6">
                    <h3 className="mb-2 text-xl font-bold text-white">
                      {course.title}
                    </h3>
                    <p className="mb-4 text-sm text-gray-400">{course.description}</p>

                    {/* Progress information */}
                    <div className="mb-6 space-y-2 text-sm">
                      {courseStatus === "completed" ? (
                        <div className="text-green-300">
                          <p>
                            حالة المهمة:{" "}
                            <span className="font-bold text-white">
                              منجزة بالكامل
                            </span>
                          </p>
                          <p>
                            التقدم:{" "}
                            <span className="font-bold text-white">
                              {Math.round(courseProgress)}%
                            </span>
                          </p>
                        </div>
                      ) : courseStatus === "in-progress" ? (
                        <div className="text-cyan-300">
                          <p>
                            التقدم:{" "}
                            <span className="font-bold text-white">
                              {Math.round(courseProgress)}%
                            </span>
                          </p>
                          <p>
                            حالة المهمة:{" "}
                            <span className="font-bold text-white">
                              قيد التقدم
                            </span>
                          </p>
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          <p>
                            حالة المهمة:{" "}
                            <span className="font-bold text-white">
                              لم تبدأ بعد
                            </span>
                          </p>
                          <p>
                            التقدم:{" "}
                            <span className="font-bold text-white">
                              0%
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Progress bar */}
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            courseStatus === "completed"
                              ? "bg-green-500"
                              : courseStatus === "in-progress"
                              ? "bg-cyan-500"
                              : "bg-gray-600"
                          }`}
                          style={{ width: `${Math.min(courseProgress, 100)}%`}}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("/course", {state: {courseId: course.id}})}
                      className={`mt-auto w-full rounded-lg p-3 text-center font-bold transition-colors ${getButtonStyle(courseProgress)}`}
                    >
                      {getButtonText(courseProgress)}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Show message when no courses match filter */}
        {filteredCourses.length === 0 && myCourses?.data?.length > 0 && (
          <div className="mt-12 text-center">
            <div className="text-gray-400 text-lg mb-4">
              {filter === "completed" && "لا توجد كورسات مكتملة حالياً"}
              {filter === "in-progress" && "لا توجد كورسات قيد التقدم حالياً"}
            </div>
            <button
              onClick={() => setFilter("all")}
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              عرض جميع الكورسات
            </button>
          </div>
        )}

        {/* Discover More */}
        <div className="mt-16 text-center">
          <h2 className="mb-4 text-2xl font-bold">هل أنت مستعد لرحلة جديدة؟</h2>
          <p className="mx-auto mb-6 max-w-lg text-gray-400">
           هناك دائمًا المزيد من الكورسات المعرفية. انطلق
          </p>
          <Link 
            to="/student/allcourses" 
            className="inline-block rounded-lg bg-purple-600 px-8 py-3 font-bold text-white transition-colors hover:bg-purple-500"
          >
            اكتشف كورسات أخرى
          </Link>
        </div>
      </main>
    </>
  );


}