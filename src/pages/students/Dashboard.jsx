import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import { useQuery } from "@tanstack/react-query";
import BackgroundAnimation from "../../Components/BackgroundAnimation";
import * as THREE from "three";
import Loading from "../../Components/Loading";

export default function Dashboard() {
  const [userPoints, setUserPoints] = useState(150);
  const [openCourse, setOpenCourse] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState("12:34:56");

  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const starsRef = useRef({ far: null, mid: null, close: null });

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

  const cookies = new Cookies();
  const token = cookies.get("token");

  const getUserScore = async () => {
    return await axios.get("/api/Student/GetStudentRankAndScore", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const { data: userScore } = useQuery({
    queryKey: ["user-score"],
    queryFn: getUserScore,
    refetchOnWindowFocus: false
  });

  const getAssignments = async () => {
    return await axios.get(
      `/api/Assignment/GetAssignmentsForStudent?category=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  const { data: userAssignments, isLoading: assignmentLoading } = useQuery({
    queryKey: ["user-assignments"],
    queryFn: getAssignments,
    refetchOnWindowFocus: false
  });

  const getNotifications = async (id) => {
    return await axios.get(
      `/api/Notification/student/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  const userId = userScore?.data.id;

  const { data: notifications } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => getNotifications(userId),
    enabled: !!userId,
  });

  const getEnrollCoursesData = async () => {
    return await axios.get(`/api/StudentCourse/MyCoursesWithUnits`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const { data: enrollCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ["enroll-courses-data"],
    queryFn: getEnrollCoursesData,
  });

  // const date = new Date();
  const formatted = (newDate) => {
    const date = new Date(newDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", // or "short" or "2-digit"
      day: "2-digit",
    });
  };

  if (coursesLoading || assignmentLoading) {
    return <Loading />
  }

  return (
    <div
      className="min-h-screen  text-gray-100"
      style={{ fontFamily: "Cairo, sans-serif" }}
    >
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10"
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

        <h2 className="mb-2 text-2xl sm:text-3xl lg:text-4xl font-black text-white title-glow">
          أهلاً بعودتك يا رائد الفضاء!
        </h2>
        <p className="mb-6 sm:mb-8 text-base sm:text-lg text-gray-400">
          مهمتك التالية في انتظارك. استعد للانطلاق.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
          {/* Left Column (Main Content) */}
          <div className="space-y-6 sm:space-y-8 lg:col-span-2">
            <div>
              <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold text-white title-glow">
                مهماتك الحالية (الكورسات)
              </h2>
              {enrollCourses?.data.map((course, index) => (
                <div key={course.id} className="overflow-hidden rounded-2xl glass-effect my-2">
                  <button
                    onClick={() =>
                      setOpenCourse(openCourse === index ? null : index)
                    }
                    className="flex w-full items-center justify-between p-4 sm:p-6 text-right transition-colors hover:bg-white/5"
                  >
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {formatted(course.enrolledAt)}
                      </p>
                    </div>
                    <svg
                      className={`h-6 w-6 transform text-cyan-400 transition-transform duration-300 ${
                        openCourse === index ? "rotate-180" : ""
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
                  {openCourse === index && (
                    <div className="animate-in slide-in-from-top-2 space-y-4 border-t border-white/10 px-4 sm:px-6 pb-4 sm:pb-6 duration-300">
                      {course.units.map((unit) => (
                        <div key={unit.id}>
                          <p className="font-bold text-white">{unit.title}</p>
                          <p className="text-sm text-green-400">
                            {unit.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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
                  {userScore?.data.rank}
                </p>
                <div className="my-4 h-px bg-white/10"></div>
                <p className="text-center text-sm text-gray-300">
                  نقاطك الحالية:{" "}
                  <span
                    className={`font-bold ${
                      userPoints < 200 ? "text-red-400" : "text-white"
                    }`}
                  >
                    {userScore?.data.score}
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
              {userAssignments?.data?.map((item) => (
                <div key={item.id} className="space-y-3 rounded-2xl border mb-2 border-white/5 bg-gradient-to-br from-blue-900/40 to-gray-900/50 p-4 backdrop-blur-md">
                  <a
                    href={item.files}
                    className="block rounded-lg bg-yellow-500/10 p-3 transition-colors hover:bg-yellow-500/20"
                  >
                    <div className="mb-1  sm:items-center justify-between gap-2 sm:gap-0">
                      <p className="text-sm font-bold text-yellow-300">
                        {item.courseName}
                      </p>
                      <p className="rounded-full bg-yellow-900/50 px-2 py-1 font-mono text-xs text-yellow-300 my-2">
                        ينتهي خلال {formatted(item.dueDate)}
                      </p>
                    </div>
                    <p className="text-xs text-yellow-400/80 break-all">
                      {item.assignmentDescription}
                    </p>
                  </a>
                </div>
              ))}
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
                <div className="h-22 overflow-y-auto">
                  {/* <div className="flex items-start"> */}
                  {/* <div className="h-fit rounded-full bg-cyan-500/20 p-2">
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
                    </div> */}
                  {/* <div className="mr-3">
                      <p className="text-sm font-bold text-white">
                        تم رفع الدرس الثالث في{" "}
                        <span className="text-cyan-400">الرياضيات</span>.
                      </p>
                      <p className="text-xs text-gray-400">منذ 3 ساعات</p>
                    </div> */}
                  {/* </div> */}
                  {/* <div className="flex items-start">
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
                  </div> */}
                  {notifications?.data.map((item) => (
                    <div key={item.id} className="flex items-start">
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
                          {item.title} 
                        </p>
                        <p className="text-xs text-gray-400 my-2">
                          {item.timeAgo} 
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.message} 
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* <div className="mt-3 border-t border-white/10 pt-3">
                  <Link
                    to="#"
                    className="block text-center text-sm font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    عرض كل البيانات
                  </Link>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
