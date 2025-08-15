import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";

import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import { useParams } from "react-router-dom";

const CourseData = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { courseId } = useParams();

  const cookies = new Cookies();
  const token = cookies.get("token");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseUnitImage, setCourseUnitImage] = useState(null);
  const [durationInMinutes, setDurationInMinutes] = useState(60);

  const fetchCourse = () => {
    return axios
      .get(`/api/teacher/courses/${courseId}/full`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // const fetchCourses = (teacherID) => {
  //   return axios
  //     .get(`http://lms278.runasp.net/api/Course/${teacherID}`, {
  //       headers: {
  //         accept: "/",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .catch((error) => {
  //       console.error("User data fetch error:", error);
  //     });
  // };

  const { data: courses } = useQuery({
    queryKey: ["get-courses"],
    queryFn: fetchCourse,
  });

  // const teacherID = user?.data?.teacherId;

  // const { data: courses } = useQuery({
  //   queryKey: ["courses", teacherID],
  //   queryFn: () => fetchCourses(teacherID),
  //   enabled: !!teacherID, // only after the teacherID has been retrieved fetch the details
  // });

  // const fetchUser = () => {
  //   return axios
  //     .get("http://lms278.runasp.net/api/Account/GetCurrentUser", {
  //       headers: {
  //         accept: "text/plain",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .catch((error) => {
  //       console.error("User data fetch error:", error);
  //     });
  // };

  // const { data: user } = useQuery({
  //   queryKey: ["user"],
  //   queryFn: fetchUser,
  // });

  // console.log(user);
  // console.log(user);
  console.log(courses);

  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const starFieldsRef = useRef([]);
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
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Store refs
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

    // Create starfields
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

    // Cleanup
    return () => {
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  // Handle scroll for camera movement
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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuOpen && !e.target.closest(".user-menu")) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [userMenuOpen]);

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
          <main>
            <header className="flex justify-between items-center mb-6">
              <div>
                <h1
                  className="text-4xl font-black text-white mb-2"
                  style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
                >
                  إضافة فصل جديد
                </h1>
                <p className="text-gray-400 text-lg">
                  أضف فصول جديدة للكورس الخاص بك.
                </p>
              </div>
            </header>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-900/40 to-slate-800/50 backdrop-blur-2xl border border-white/5 rounded-2xl p-6">
                <label className="block text-lg font-bold text-white mb-3">
                  عنوان الفصل
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="أدخل عنوان الفصل"
                  className="w-full p-3 rounded-lg text-lg bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:bg-black/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all"
                />
              </div>

              <div className="bg-gradient-to-r from-slate-900/40 to-slate-800/50 backdrop-blur-2xl border border-white/5 rounded-2xl p-6">
                <label className="block text-lg font-bold text-white mb-3">
                  وصف الفصل
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="أدخل وصف الفصل"
                  rows={4}
                  className="w-full p-3 rounded-lg text-lg bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:bg-black/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all"
                />
              </div>

              <div className="bg-gradient-to-r from-slate-900/40 to-slate-800/50 backdrop-blur-2xl border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  ارفق صورة للفصل
                </h3>
                <div className="mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-dashed border-gray-600 rounded-lg hover:border-cyan-500 transition-colors">
                  <div className="space-y-2 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-500"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-400 justify-center">
                      <label className="relative cursor-pointer bg-gray-800/50 rounded-md px-3 py-1 font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setCourseUnitImage(e.target.files[0])
                          }
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-900/40 to-slate-800/50 backdrop-blur-2xl border border-white/5 rounded-2xl p-6">
                <label className="block text-lg font-bold text-white mb-3">
                  مدة الفصل (بالدقائق)
                </label>
                <input
                  type="number"
                  value={durationInMinutes}
                  onChange={(e) => setDurationInMinutes(e.target.value)}
                  required
                  min="1"
                  max="480"
                  placeholder="أدخل مدة الفصل بالدقائق"
                  className="w-full p-3 rounded-lg text-lg bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:bg-black/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all"
                />
              </div>
            </div>
          </main>
        </main>
      </div>
    </div>
  );
};

export default CourseData;
