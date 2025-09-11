import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as THREE from "three";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import toast from "react-hot-toast";

// Helper components for consistent styling (can be moved to a separate file)
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

const AddChapter = () => {
  const location = useLocation();
  const courseId = location.state?.courseId;
  const navigate = useNavigate();

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

  // --- Data Fetching and Logic ---
  const uploadChapter = async () => {
    if (!courseId) {
      toast.error("لم يتم العثور على معرّف الكورس!");
      throw new Error("Course ID is missing.");
    }
    if (!title || !description) {
      throw new Error("يرجى ملء حقلي العنوان والوصف.");
    }

    const cookies = new Cookies();
    const token = cookies.get("token");
    const formData = new FormData();
    formData.append("CourseId", +courseId);
    formData.append("Title", title);
    formData.append("Description", description);
    formData.append("DurationInMinutes", +durationInMinutes);

    if (courseUnitImage) {
      formData.append("CourseUnitImage", courseUnitImage);
    }

    return axios.post("/api/CourseUnit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const { refetch: refetchChapter } = useQuery({
    queryKey: ["add-chapter", courseId],
    queryFn: uploadChapter,
    enabled: false, // Important: This query will only run when we manually call refetch
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await refetchChapter();
      if (response.data) {
        setResult(response.data); // Store the entire response
        toast.success("تم إضافة الفصل بنجاح!");
      }
    } catch (error) {
      console.error("Chapter submission error:", error);
      const errorMessage = error.response?.data?.title || error.message || "حدث خطأ غير معروف.";
      toast.error(`خطأ في إضافة الفصل: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddAnother = () => {
    // Reset form fields to add another chapter
    setTitle("");
    setDescription("");
    setCourseUnitImage(null);
    setDurationInMinutes(60);
    setResult(null);
  };

  // --- useEffect hooks for Three.js, scroll, resize ---
  useEffect(() => {
    // Redirect if courseId is not available
    if (!courseId) {
      toast.error("لا يوجد كورس محدد، يتم الآن إعادة توجيهك.");
      navigate("/teacher/courses"); // Or wherever your courses list is
    }

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
  }, [courseId, navigate]);

  useEffect(() => {
    const mainContent = mainContentRef.current;
    if (!mainContent) return;
    const handleScroll = () => {
      if (!cameraRef.current) return;
      const scrollY = mainContent.scrollTop;
      const docHeight = mainContent.scrollHeight - mainContent.clientHeight;
      const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;
      cameraRef.current.position.z = 5 - scrollPercent * 10;
    };
    mainContent.addEventListener("scroll", handleScroll);
    return () => mainContent.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
                <h2 className="text-3xl font-bold text-white mb-2">تم إنشاء الفصل بنجاح!</h2>
                <p className="text-slate-300 mb-8 max-w-md">
                    الفصل "<span className="font-bold text-cyan-400">{result.data.title}</span>" أصبح جاهزاً. ما هي خطوتك التالية؟
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(`/teacher/addlesson`, { state: { courseId: courseId, chapterId: result?.data?.id } })}
                        className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20 transform hover:scale-105"
                    >
                        إضافة الدرس الأول +
                    </button>
                     <button
                        onClick={handleAddAnother}
                        className="w-full sm:w-auto px-8 py-3 rounded-lg bg-slate-700/80 text-white font-bold hover:bg-slate-600/80 transition-colors"
                    >
                        إضافة فصل آخر
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
                    إضافة فصل جديد
                  </h1>
                  <p className="text-slate-400 text-lg">
                    قم ببناء محتوى الكورس الخاص بك فصلاً بفصل.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 sm:mt-0 px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {loading ? "جاري الإضافة..." : "إضافة الفصل"}
                </button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Right Side - Main Details */}
                <div className="lg:col-span-3 space-y-6">
                   <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
                    <label className="block text-lg font-bold text-white mb-3">عنوان الفصل</label>
                    <FormInput
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                        type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="مثال: الفصل الأول - قوانين نيوتن"
                    />
                  </div>
                  <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
                    <label className="block text-lg font-bold text-white mb-3">وصف الفصل</label>
                    <FormTextarea
                        value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="اكتب وصفاً موجزاً لما سيتم تغطيته في هذا الفصل..."
                    />
                  </div>
                </div>

                {/* Left Side - Image & Settings */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
                    <label className="block text-lg font-bold text-white mb-3">صورة الفصل (اختياري)</label>
                    <label htmlFor="file-upload" className="relative cursor-pointer flex justify-center w-full h-40 px-6 pt-5 pb-6 border-2 border-dashed border-slate-600 rounded-lg hover:border-cyan-500 transition-colors duration-300">
                      {courseUnitImage ? (
                        <>
                          <img src={URL.createObjectURL(courseUnitImage)} alt="Preview" className="h-full w-full object-cover rounded-md" />
                          <button type="button" onClick={() => setCourseUnitImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </>
                      ) : (
                        <div className="space-y-1 text-center flex flex-col justify-center items-center">
                          <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                          <p className="text-sm text-slate-400">اسحب وأفلت أو انقر للرفع</p>
                        </div>
                      )}
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => setCourseUnitImage(e.target.files[0])} />
                    </label>
                  </div>
                  
                  <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
                      <label className="block text-lg font-bold text-white mb-3">المدة التقديرية (بالدقائق)</label>
                      <FormInput
                          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                          type="number" value={durationInMinutes} onChange={(e) => setDurationInMinutes(e.target.value)} required min="1"
                      />
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

export default AddChapter;