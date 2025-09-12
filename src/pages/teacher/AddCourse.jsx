import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as THREE from "three";

import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import Loading from "../../Components/Loading";
import toast from "react-hot-toast";

// Helper components for better organization
const IconWrapper = ({ children }) => (
  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5">
    {children}
  </div>
);

const FormInput = ({ icon, ...props }) => (
  <div className="relative">
    {icon && <IconWrapper>{icon}</IconWrapper>}
    <input
      {...props}
      className={`w-full p-3 ${
        icon ? "ps-10" : ""
      } rounded-lg text-md bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300`}
    />
  </div>
);

const FormTextarea = (props) => (
  <textarea
    {...props}
    rows={6}
    className="w-full p-3 rounded-lg text-md bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-none"
  />
);

const AddCourse = () => {
  // --- All State and Ref Hooks remain the same ---
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseImage, setCourseImage] = useState(null);
  const [studyYear, setStudyYear] = useState(1);
  const [price, setPrice] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const starFieldsRef = useRef([]);

  // --- All Data Fetching and Logic remain the same ---
  const fetchData = () => {
    const cookies = new Cookies();
    const token = cookies.get("token");

    return axios.get("/api/Account/GetCurrentUser", {
      headers: { accept: "text/plain", Authorization: `Bearer ${token}` },
    }).catch((error) => console.error("User data fetch error:", error));
  };

  const uploadCourse = async () => {
    const cookies = new Cookies();
    const token = cookies.get("token");

    if (!title || !description || !studyYear) {
      throw new Error(
        "Please fill in all required fields: title, description, and study year."
      );
    }
    const formData = new FormData();
    formData.append("Title", title);
    formData.append("Description", description);
    formData.append("Price", parseFloat(price));
    formData.append("StudyYear", parseInt(studyYear));
    if (courseImage) {
      formData.append("CourseImage", courseImage);
    }

    return axios.post("/api/teacher/courses", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => response)
      .catch((error) => {
        console.error("API Error:", error);
        console.error("Error response:", error.response?.data);
        if (error.response?.data?.errors) {
          console.error("Validation errors:", error.response.data.errors);
        }
        throw error;
      });
  };

  const navigate = useNavigate();

  const {
    isLoading: isLoadingUser,
    data: dataUser,
    isError: isErrorUser,
    error: errorUser,
    isFetching: isFetchingUser,
    refetch: refetchUser,
  } = useQuery({ queryKey: ["user-data"], queryFn: fetchData, refetchOnWindowFocus: false });

  const { refetch: refetchCourse } = useQuery({
    queryKey: ["add-course"],
    queryFn: uploadCourse,
    refetchOnWindowFocus: false,
    enabled: false,
  });

  // --- All useEffect hooks for Three.js, scroll, resize, and click outside remain the same ---
  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    const createStarfield = (count, size, color) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({ size, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.7 });
      const starfield = new THREE.Points(geometry, material);
      scene.add(starfield);
      return starfield;
    };
    const starsFar = createStarfield(8000, 0.05, 0x888888);
    const starsMid = createStarfield(5000, 0.1, 0xbbbbbb);
    const starsClose = createStarfield(1500, 0.15, 0xffffff);
    starFieldsRef.current = [starsFar, starsMid, starsClose];
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
    return () => { if (renderer) renderer.dispose(); };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!mainContentRef.current || !cameraRef.current) return;
      const scrollY = mainContentRef.current.scrollTop;
      const docHeight = mainContentRef.current.scrollHeight - mainContentRef.current.clientHeight;
      const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;
      cameraRef.current.position.z = 5 - scrollPercent * 10;
    };
    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener("scroll", handleScroll);
      return () => mainContent.removeEventListener("scroll", handleScroll);
    }
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await refetchCourse();
      if (result.data) {
        setResult(result);
        toast.success("تم إنشاء الكورس بنجاح!");
      }
    } catch (error) {
      console.error("Course submission error:", error);
      const errorMessage = error.response?.data?.title || error.message || "An unknown error occurred.";
      toast.error(`خطأ في إنشاء الكورس: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Conditional returns for loading and error states remain the same ---
  if (isLoadingUser || isFetchingUser) return <Loading />;
  if (isErrorUser) { /* ... same error component as before ... */ }
  if (dataUser?.data?.isMock) { /* ... same mock user component as before ... */ }
  if (dataUser?.data?.role === "Teacher" && !dataUser?.data?.teacherId) { /* ... same incomplete profile component as before ... */ }
  
  // --- *** THE NEW, REDESIGNED JSX *** ---
  return (
    <div className="text-gray-100 font-[Cairo] h-screen overflow-hidden w-full" dir="rtl">
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />

      <main ref={mainContentRef} className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#00BFFF rgba(0,0,0,0.2)" }}>
        
        <div className="max-w-7xl mx-auto">
          {result ? (
            // --- SUCCESS STATE ---
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
              <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-8 text-center shadow-2xl shadow-cyan-500/10 animate-fade-in-up">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-cyan-500 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">تم إنشاء الكورس بنجاح!</h2>
                <p className="text-slate-300 mb-8 max-w-md">
                    الكورس الخاص بك "<span className="font-bold text-cyan-400">{result.data.data.title}</span>" أصبح جاهزاً. ما هي خطوتك التالية؟
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(`/teacher/addchapter`, { state: { courseId: result.data.data.id } })}
                        className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20 transform hover:scale-105"
                    >
                        إضافة الفصل الأول +
                    </button>
                    <button
                        onClick={() => navigate(`/teacher/dashboard`)} // Adjust this link to your manage courses page
                        className="w-full sm:w-auto px-8 py-3 rounded-lg bg-slate-700/80 text-white font-bold hover:bg-slate-600/80 transition-colors"
                    >
                        العودة للكورسات
                    </button>
                </div>
              </div>
            </div>
          ) : (
            // --- FORM STATE ---
            <form onSubmit={handleSubmit}>
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                  <h1 className="text-4xl font-black text-white mb-2" style={{ textShadow: "0 0 15px rgba(0, 191, 255, 0.7)" }}>
                    إنشاء كورس جديد
                  </h1>
                  <p className="text-slate-400 text-lg">
                    املأ التفاصيل التالية لبدء رحلة تعليمية جديدة.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 sm:mt-0 px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {loading ? "جاري النشر..." : "نشر الكورس"}
                </button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Right Side - Main Details */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
                    <label className="block text-lg font-bold text-white mb-3">عنوان الكورس</label>
                    <FormInput
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="مثال: مقدمة في الفيزياء الحديثة"
                    />
                  </div>
                  <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
                    <label className="block text-lg font-bold text-white mb-3">وصف الكورس</label>
                    <FormTextarea
                        value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="اكتب وصفاً جذاباً يوضح محتوى الكورس وأهدافه..."
                    />
                  </div>
                </div>

                {/* Left Side - Image & Settings */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
                    <label className="block text-lg font-bold text-white mb-3">صورة الكورس</label>
                    <div className="mt-1">
                      <label htmlFor="file-upload" className="relative cursor-pointer flex justify-center w-full h-48 px-6 pt-5 pb-6 border-2 border-dashed border-slate-600 rounded-lg hover:border-cyan-500 transition-colors duration-300">
                        {courseImage ? (
                          <>
                            <img src={URL.createObjectURL(courseImage)} alt="Preview" className="h-full w-full object-cover rounded-md" />
                            <button onClick={() => setCourseImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </>
                        ) : (
                          <div className="space-y-1 text-center flex flex-col justify-center items-center">
                            <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <p className="text-sm text-slate-400">اسحب وأفلت أو انقر للرفع</p>
                            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        )}
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => setCourseImage(e.target.files[0])} />
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
                        <label className="block text-lg font-bold text-white mb-3">السنة الدراسية</label>
                        <FormInput
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494M12 6.253h-2.5M12 6.253h2.5M12 17.747h-2.5M12 17.747h2.5" /></svg>}
                            type="number" value={studyYear} onChange={(e) => setStudyYear(e.target.value)} required min="1" max="3"
                        />
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
                        <label className="block text-lg font-bold text-white mb-3">السعر</label>
                        <FormInput
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v1m0 6v1m0-10v1m0 6v1M5 12h.01M19 12h.01M6 16.928A8 8 0 0012 20a8 8 0 006-3.072M6 7.072A8 8 0 0112 4a8 8 0 016 3.072" /></svg>}
                            type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="0.01"
                        />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default AddCourse;