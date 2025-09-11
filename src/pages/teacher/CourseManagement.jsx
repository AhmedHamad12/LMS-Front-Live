import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as THREE from "three";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import Loading from "../../Components/Loading";

// Icon Component for cleaner SVG usage
const ChevronDownIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export default function CourseManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const cookies = new Cookies();
  const token = cookies.get("token");
  
  // Use a more descriptive name for the state
  const { courseId } = location.state || {};

  const [openUnitId, setOpenUnitId] = useState(null);

  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const starFieldsRef = useRef([]);

  // --- Three.js setup and other effects remain the same ---
  useEffect(() => {
    if (!courseId) {
      navigate('/teacher/courses'); // Redirect if no courseId
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
    // Scroll and Resize handlers... (no changes needed)
  }, []);

  const fetchCourse = () => {
    return axios.get(`/api/teacher/courses/${courseId}/full`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const { data: courseData, isLoading, isError, error } = useQuery({
    queryKey: ["course-details", courseId],
    queryFn: fetchCourse,
    enabled: !!courseId, // Only run query if courseId exists
  });

  const course = courseData?.data?.course;
  const units = courseData?.data?.units;

  const formatted = (newDate) => {
    if (!newDate) return '';
    const date = new Date(newDate);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  const toggleUnit = (unitId) => {
    setOpenUnitId(prevId => (prevId === unitId ? null : unitId));
  };
  
  if (isLoading) return <Loading />;

  if (isError) {
    return (
        <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center">
            {/* You can reuse the error component from AddCourse for consistency */}
            <div className="text-center p-8 bg-slate-900/50 rounded-lg">
                <h2 className="text-2xl text-red-400 font-bold mb-4">حدث خطأ</h2>
                <p>لم نتمكن من تحميل بيانات الكورس.</p>
                <p className="text-sm text-slate-400 mt-2">{error.message}</p>
            </div>
        </div>
    );
  }

  return (
    <div className="text-gray-100 font-[Cairo] h-screen overflow-hidden w-full" dir="rtl">
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />

      <main ref={mainContentRef} className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#00BFFF rgba(0,0,0,0.2)" }}>
        
        <div className="max-w-5xl mx-auto">
          {/* Course Header */}
          <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-8 mb-10 shadow-2xl shadow-cyan-500/10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div>
                <span className="text-cyan-400 font-semibold">كورس</span>
                <h1 className="text-4xl font-black text-white mt-1 mb-3">{course?.title}</h1>
                <p className="text-slate-300 max-w-2xl">{course?.description}</p>
              </div>
              <button
                onClick={() => navigate(`/teacher/addchapter`, { state: { courseId } })}
                className="w-full md:w-auto flex-shrink-0 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold transition-transform transform hover:scale-105 shadow-lg shadow-cyan-500/20"
              >
                إضافة فصل جديد +
              </button>
            </div>
            <div className="border-t border-slate-700/50 mt-6 pt-4 flex items-center gap-x-6 gap-y-2 text-sm text-slate-400 flex-wrap">
              <p>تاريخ الإنشاء: <span className="font-semibold text-cyan-300">{formatted(course?.createdAt)}</span></p>
              <p>السعر: <span className="font-semibold text-cyan-300">{course?.price} جنيه</span></p>
            </div>
          </div>

          {/* Chapters (Units) Accordion */}
          <div className="space-y-4">
            {units?.map((unit, index) => (
              <div key={unit.id} className="bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-lg transition-all duration-300">
                {/* Accordion Header */}
                <button
                  onClick={() => toggleUnit(unit.id)}
                  className="w-full flex justify-between items-center p-5 text-start"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center h-10 w-10 rounded-full bg-cyan-900/50 text-cyan-400 font-bold">{index + 1}</span>
                    <div>
                      <h2 className="text-xl font-bold text-white">{unit.title}</h2>
                      <p className="text-sm text-slate-400">{formatted(unit.createdAt)}</p>
                    </div>
                  </div>
                  <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${openUnitId === unit.id ? 'rotate-188' : ''}`} />
                </button>

                {/* Accordion Content */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openUnitId === unit.id ? 'max-h-[1000px]' : 'max-h-0'}`}>
                  <div className="border-t border-slate-700/50 p-5 space-y-4">
                    <p className="text-slate-300">{unit.description}</p>
                    {/* Lessons List */}
                    {unit.lessons.length > 0 ? (
                      <div className="space-y-3 pt-2">
                        {unit.lessons.map(lesson => (
                          <div key={lesson.id} className="bg-slate-800/40 p-4 rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                <button onClick={() => navigate("/teacher/lesson", {state: {lessonId: lesson.id}})} className="text-lg font-semibold text-green-300 hover:text-green-200 transition">
                                    {lesson.title}
                                </button>
                            </div>
                            <div className="flex items-center gap-3 self-end md:self-center">
                                <button onClick={() => navigate("/teacher/add/assignment", { state: { courseId, unitId: unit.id, lessonId: lesson.id } })}
                                    className="text-sm px-4 py-2 bg-cyan-600/50 text-cyan-200 rounded-md hover:bg-cyan-600/80 transition"
                                >
                                    إضافة مهمة
                                </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-slate-500 py-4">لا توجد دروس في هذا الفصل بعد.</p>
                    )}
                    <button onClick={() => navigate(`/teacher/addlesson`, { state: { courseId, chapterId: unit.id } })}
                        className="w-full mt-4 py-2 text-center rounded-lg bg-slate-700/80 text-white font-bold hover:bg-slate-600/80 transition-colors"
                    >
                        + إضافة درس جديد
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}