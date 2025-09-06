import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as THREE from "three";

import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import toast from "react-hot-toast";

const AddChapter = () => {

  const location = useLocation();
  const courseId = location.state?.courseId;


  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseUnitImage, setCourseUnitImage] = useState(null);
  const [durationInMinutes, setDurationInMinutes] = useState(60);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const starFieldsRef = useRef([]);

  const uploadChapter = async () => {
    const cookies = new Cookies();
    const token = cookies.get("token");

    if (!title || !description) {
      throw new Error(
        "Please fill in all required fields: title, description, and study year."
      );
    }

    const formData = new FormData();
    formData.append("CourseId", +courseId);
    formData.append("Title", title);
    formData.append("Description", description);
    formData.append("DurationInMinutes", +durationInMinutes);

    // Only add image if it exists
    if (courseUnitImage) {
      formData.append("CourseUnitImage", courseUnitImage);
    }

    return axios
      .post("/api/CourseUnit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        // console.log("API Response:", response);
        
        return response;
      })
      .catch((error) => {
        console.error("API Error:", error);
        console.error("Error response:", error.response?.data);

        // Log the specific validation errors if they exist
        if (error.response?.data?.errors) {
          console.error("Validation errors:", error.response.data.errors);
          console.error(
            "Full validation error object:",
            JSON.stringify(error.response.data.errors, null, 2)
          );
        }

        // Also log the request data that was sent
        console.error("Request data that was sent:", {
          formDataEntries: Array.from(formData.entries()),
        });

        throw error;
      });
  };
  const navigate = useNavigate();

  const { data: dataCourse } = useQuery({
    queryKey: ["add-course"],
    queryFn: uploadChapter,
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await uploadChapter();


      if (result.data) {
        setResult(result)
        toast.success("تم اضافة الفصل بنجاح!");
      }
    } catch (error) {
      console.error("Course unit submission error:", error);
      toast.error(`Error creating course unit: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen text-gray-100 overflow-hidden relative">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      <div className="relative z-10 flex h-screen">
        {/* Main Content */}
        <form
          onSubmit={handleSubmit}
          ref={mainContentRef}
          className="flex-1 flex flex-col p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-transparent"
        >
          <header className="flex-shrink-0 flex justify-between items-center mb-6">
            <div>
              <p className="text-4xl font-black text-white text-cyan-400 drop-shadow-lg">
                إضافة فصل جديد
              </p>
              <p className="text-gray-400 text-lg mt-2">
                أضف فصول جديدة للكورس الخاص بك.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg bg-green-500 text-white font-bold hover:bg-green-400 transition-colors shadow-lg hover:shadow-green-500/25 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "جارى التحميل..." : "إضافة الفصل"}
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
            {/* Content Editor */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                <label className="block text-lg font-bold text-white mb-3">
                  عنوان الفصل
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="أدخل عنوان الفصل"
                  className="w-full p-3 rounded-lg text-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                <label className="block text-lg font-bold text-white mb-3">
                  وصف الفصل
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="أدخل وصف الفصل"
                  rows={4}
                  className="w-full p-3 rounded-lg text-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">
                  ارفق صورة للفصل
                </h3>
                <label className="mt-1 cursor-pointer flex justify-center px-6 pt-10 pb-10 border-2 border-dashed border-gray-600 rounded-lg hover:border-cyan-500 transition-colors">
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
                </label>
              </div>

              <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
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
                  className="w-full p-3 rounded-lg text-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Course Structure */}
            <div className="lg:col-span-1 space-y-4">
              {result && (
                <button
                  onClick={() =>
                    navigate(`/teacher/addlesson`, {
                      state: { courseId: courseId, chapterId: result?.data?.id },
                    })
                  }
                  className={`flex cursor-pointer justify-center rounded-lg border border-transparent bg-[#00BFFF] px-4 py-3 text-sm font-bold text-black shadow-sm shadow-[rgba(0,191,255,0.4)] transition-all duration-300 ease-in-out hover:translate-y-[2px] hover:shadow-[0_0_25px_rgb(0_191_255_/_0.7)]`}
                >
                  إضافة باب جديد +
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChapter;
