import React, { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { Cookies } from "react-cookie";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import Loading from "../../Components/Loading";
import { LayoutGrid, List, Search, UserX, Phone, User, GraduationCap, Star } from "lucide-react"; // تم إضافة أيقونات جديدة

// خريطة لترجمة السنة الدراسية
const studyYearMap = {
  1: 'الصف الأول الثانوي',
  2: 'الصف الثاني الثانوي',
  3: 'الصف الثالث الثانوي',
};

const TeacherStudents = () => {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table'

  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());

  const cookies = new Cookies();
  const token = cookies.get("token");

  // --- Data Fetching ---
  const { data: studentsResponse, isLoading: studentLoading } = useQuery({ 
    queryKey: ["teacherStudents", token], 
    queryFn: () => axios.get(`/api/Teacher/getTeacherStudents`, { headers: { Authorization: `Bearer ${token}` } }), 
    enabled: !!token 
  });
  const students = studentsResponse?.data || [];

  const filteredStudents = useMemo(() => 
    students.filter(
      (student) =>
        search === "" || 
        (student.firstName && student.firstName.toLowerCase().includes(search.toLowerCase())) ||
        (student.lastName && student.lastName.toLowerCase().includes(search.toLowerCase()))
    ), [students, search]);

  // --- التعديل هنا: ترتيب الطلاب حسب الرانك القادم من السيرفر ---
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity));
  }, [filteredStudents]);


  // --- Three.js Effect (Unaltered) ---
  useEffect(() => {
    // ... (الكود هنا لم يتغير)
    if (!canvasRef.current) return; const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); camera.position.z = 5; const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true }); renderer.setSize(window.innerWidth, window.innerHeight); renderer.setPixelRatio(window.devicePixelRatio); const createStarfield = (count, size, color) => { const geometry = new THREE.BufferGeometry(); const positions = new Float32Array(count * 3); for (let i = 0; i < count; i++) { positions[i*3+0] = (Math.random() - 0.5) * 200; positions[i*3+1] = (Math.random() - 0.5) * 200; positions[i*3+2] = (Math.random() - 0.5) * 200; } geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); const material = new THREE.PointsMaterial({ size, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.7 }); return new THREE.Points(geometry, material); }; const stars = [createStarfield(8000, 0.05, 0x888888), createStarfield(5000, 0.1, 0xbbbbbb), createStarfield(1500, 0.15, 0xffffff)]; stars.forEach(s => scene.add(s)); const animate = () => { requestAnimationFrame(animate); const elapsedTime = clockRef.current.getElapsedTime(); stars[0].rotation.y = elapsedTime * 0.01; stars[1].rotation.y = elapsedTime * 0.02; stars[2].rotation.y = elapsedTime * 0.03; renderer.render(scene, camera); }; animate(); const handleResize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); }; window.addEventListener("resize", handleResize); return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // ... (الكود هنا لم يتغير)
    const mainContent = mainContentRef.current; if (!mainContent) return; const moveCameraAndStars = () => { const camera = mainContent.parentElement.querySelector('canvas'); if (!camera) return; const scrollY = mainContent.scrollTop; const docHeight = mainContent.scrollHeight - mainContent.clientHeight; const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0; }; mainContent.addEventListener("scroll", moveCameraAndStars); return () => mainContent.removeEventListener("scroll", moveCameraAndStars);
  }, []);


  if (studentLoading) {
    return <Loading />;
  }

  return (
    <div className="text-gray-100 font-[Cairo] h-screen overflow-hidden w-full" dir="rtl">
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-black" />
      <main ref={mainContentRef} className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#00BFFF rgba(0,0,0,0.2)" }}>
        
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-black text-white mb-2" style={{ textShadow: "0 0 15px rgba(0, 191, 255, 0.7)" }}>
              قائمة الطلاب
            </h1>
            <p className="text-slate-400 text-lg">
              تابع رواد الفضاء المسجلين في رحلاتك المعرفية وتفاعل معهم.
            </p>
          </header>

          <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center sticky top-4 z-10">
            <div className="relative flex-grow w-full">
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن طالب بالاسم..."
                className="w-full bg-slate-800/60 border border-slate-600 rounded-lg p-3 pr-10 text-white placeholder-slate-400 focus:bg-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all duration-300"
              />
              <Search className="w-5 h-5 text-slate-400 absolute top-1/2 right-3 -translate-y-1/2" />
            </div>
            <div className="flex items-center gap-2 p-1 bg-slate-800/70 rounded-lg">
              <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700'}`}>
                <LayoutGrid />
              </button>
              <button onClick={() => setViewMode('table')} className={`px-4 py-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700'}`}>
                <List />
              </button>
            </div>
          </div>

          {sortedStudents.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-2xl">
                <UserX size={64} className="mx-auto text-cyan-500/50 mb-4" />
                <h3 className="text-2xl font-bold text-white">
                    {search ? "لا يوجد طلاب يطابقون بحثك" : "لم يتم تسجيل أي طلاب بعد"}
                </h3>
                <p className="text-slate-400 mt-2">
                    {search ? "حاول تغيير كلمة البحث." : "عندما يسجل الطلاب في كورساتك، سيظهرون هنا."}
                </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {sortedStudents.map((student) => (
                <div key={student.id} className="bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 text-center transform hover:-translate-y-2 transition-transform duration-300 overflow-hidden relative shadow-lg">
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="bg-cyan-400 text-black px-3 py-1 text-sm font-bold rounded-full shadow-md">#{student.rank || '-'}</div>
                    <div className="bg-yellow-400 text-black px-3 py-1 text-sm font-bold rounded-full shadow-md flex items-center gap-1">
                        <Star size={14} /> {student.score}
                    </div>
                  </div>
                  <img src={student.path || `https://placehold.co/112x112/0f172a/38bdf8?text=${student.firstName.charAt(0)}`} className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-slate-700 shadow-lg" alt={`${student.firstName} ${student.lastName}`} />
                  <h3 className="text-xl font-bold text-white mb-1">{student.firstName} {student.lastName}</h3>
                  <p className="text-sm font-semibold text-cyan-300 mb-6">{studyYearMap[student.studentYears] || 'غير محدد'}</p>
                  
                  <div className="text-left space-y-3 text-sm border-t border-slate-700/50 pt-4">
                     <p className="text-slate-300 flex items-center gap-3">
                        <Phone size={16} className="text-slate-400 flex-shrink-0"/>
                        <span className="font-semibold">هاتف الطالب:</span> 
                        <span className="font-mono text-white mr-auto">{student.phone || 'غير متوفر'}</span>
                    </p>
                    <p className="text-slate-300 flex items-center gap-3">
                        <User size={16} className="text-slate-400 flex-shrink-0"/>
                        <span className="font-semibold">ولي الأمر:</span> 
                        <span className="text-white mr-auto">{student.parentName || 'غير مسجل'}</span>
                    </p>
                     <p className="text-slate-300 flex items-center gap-3">
                        <Phone size={16} className="text-slate-400 flex-shrink-0"/>
                        <span className="font-semibold">هاتف ولي الأمر:</span> 
                        <span className="font-mono text-white mr-auto">{student.parentPhone || 'غير متوفر'}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl overflow-x-auto">
              <table className="w-full text-right min-w-[900px]">
                <thead className="border-b border-slate-700">
                  <tr>
                    <th className="p-4 font-semibold">اسم الطالب</th>
                    <th className="p-4 font-semibold">السنة الدراسية</th>
                    <th className="p-4 font-semibold">بيانات ولي الأمر</th>
                    <th className="p-4 font-semibold">رقم الطالب</th>
                    <th className="p-4 font-semibold text-yellow-400">النتيجة</th>
                    <th className="p-4 font-semibold text-cyan-300">الترتيب</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map((student) => (
                    <tr key={student.id} className="border-b border-slate-800 last:border-b-0 hover:bg-cyan-500/10 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={student.path || `https://placehold.co/40x40/0f172a/38bdf8?text=${student.firstName.charAt(0)}`} className="w-10 h-10 rounded-full" alt={`${student.firstName} ${student.lastName}`} />
                        <span className="font-bold">{student.firstName} {student.lastName}</span>
                      </td>
                      <td className="p-4">{studyYearMap[student.studentYears] || 'غير محدد'}</td>
                      <td className="p-4">
                        <div className="font-semibold">{student.parentName || 'غير مسجل'}</div>
                        <div className="font-mono text-xs text-slate-400">{student.parentPhone || 'غير متوفر'}</div>
                      </td>
                      <td className="p-4 font-mono">{student.phone || 'غير متوفر'}</td>
                      <td className="p-4 font-bold text-yellow-400 text-lg">{student.score}</td>
                      <td className="p-4 font-bold text-cyan-300 text-lg">#{student.rank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherStudents;