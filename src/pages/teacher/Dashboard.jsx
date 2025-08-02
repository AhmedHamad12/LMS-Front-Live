import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useRef } from "react";
import { Cookies } from "react-cookie";
import { Link } from "react-router-dom";
import * as THREE from "three";

const TeacherDashboard = () => {
  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const starFieldsRef = useRef([]);

  const cookies = new Cookies();
  const token = cookies.get("token");

  //*************************************************** */
  const fetchUser = () => {
    return axios
      .get("http://lms278.runasp.net/api/Account/GetCurrentUser", {
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.error("User data fetch error:", error);
      });
  };

  const fetchCourses = (teacherID) => {
    return axios
      .get(`http://lms278.runasp.net/api/Course/${teacherID}`, {
        headers: {
          accept: "/",
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.error("User data fetch error:", error);
      });
  };

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });

  const teacherID = user?.data?.teacherId;

  const { data: courses } = useQuery({
    queryKey: ["courses", teacherID],
    queryFn: () => fetchCourses(teacherID),
    enabled: !!teacherID, // only after the teacherID has been retrieved fetch the details
  });

  const fetchAllData = () => {
    return axios
      .get(
        `http://lms278.runasp.net/api/Teacher/getTeacherByid/${user.data.teacherId}`,
        {
          headers: {
            accept: "text/plain",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .catch((error) => {
        console.error("User data fetch error:", error);
      });
  };

  const { data: allData } = useQuery({
    queryKey: ["all-data"],
    queryFn: fetchAllData,
  });

  
  console.log(allData);
  console.log(user);
  console.log(courses);

  //*************************************************** */

  // Three.js initialization
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

    // Create starfield function
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

    starFieldsRef.current = [starsFar, starsMid, starsClose];

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

    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener("scroll", handleScroll);
      return () => mainContent.removeEventListener("scroll", handleScroll);
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
            برج مراقبة المدرس
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            أهلاً بك يا قائد، إليك تقرير شامل عن أدائك في المجرّة.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            <div className="glass-effect rounded-2xl p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <svg
                    className="w-8 h-8 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"
                    />
                  </svg>
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-400">
                    إجمالي الأرباح (هذا الشهر)
                  </p>
                  <p className="text-2xl font-black text-white">12,500 جنيه</p>
                </div>
              </div>
            </div>
            <div className="glass-effect rounded-2xl p-6">
              <div className="flex items-center">
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <svg
                    className="w-8 h-8 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-400">إجمالي الطلاب</p>
                  <p className="text-2xl font-black text-white">1,345 طالب</p>
                </div>
              </div>
            </div>
            <div className="glass-effect rounded-2xl p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <svg
                    className="w-8 h-8 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <div className="mr-4">
                  <p className="text-sm text-gray-400">متوسط التقييم</p>
                  <p className="text-2xl font-black text-white">4.8 / 5</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* My Courses */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold mb-6">إدارة الكورسات</h2>
              <div className="space-y-4">
                {courses?.data?.map((course) => (
                  <div
                    key={course.id}
                    className="glass-effect rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-white">{course.title}</h3>
                      <p className="text-xs text-gray-400">250 طالب مشترك</p>
                    </div>
                    <Link
                      to={`/teacher/course/mange/${course.id}`}
                      className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      إدارة
                    </Link>
                  </div>
                ))}
                <Link
                  to="/teacher/addcourse"
                  className="block text-center p-4 rounded-2xl border-2 border-dashed border-gray-600 hover:border-cyan-400 hover:text-cyan-400 transition-all text-gray-400"
                >
                  + إضافة كورس جديد
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">البيانات الشخصية</h2>
              <div className="glass-effect rounded-2xl p-4 space-y-3">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500/20 rounded-full h-fit">
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <div className="mr-3">
                    <p className="text-sm">
                      <span className="font-bold text-white">
                        {user?.data?.email}
                      </span>
                    </p>
                    {/* <p className="text-xs text-gray-500">منذ 15 دقيقة</p> */}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="p-2 bg-cyan-500/20 rounded-full h-fit">
                    <svg
                      className="w-5 h-5 text-cyan-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                  </div>
                  <div className="mr-3">
                    <p className="text-sm">
                      <span className="font-bold text-white">
                        {allData?.data?.phone}
                      </span>
                    </p>
                    {/* <p className="text-xs text-gray-500">منذ 45 دقيقة</p> */}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500/20 rounded-full h-fit">
                    <svg
                      className="w-5 h-5 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div className="mr-3">
                    <p className="text-sm">
                      <span className="font-bold text-white">
                        سنين الخبرة {" : "}
                        {allData?.data?.experienceYears}
                      </span>
                    </p>
                    {/* <p className="text-xs text-gray-500">منذ ساعتين</p> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
