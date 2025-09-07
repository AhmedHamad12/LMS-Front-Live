import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import React, { useEffect, useRef } from "react";
import { Cookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import * as THREE from "three";
import Loading from "../../Components/Loading";

// Helper Component for Stats Cards
const StatCard = ({ icon, label, value, unit, colorClass = "text-white" }) => (
  <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-6 shadow-lg shadow-cyan-500/5 transition-transform transform hover:-translate-y-1">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-slate-800/60 rounded-lg">{icon}</div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className={`text-3xl font-black ${colorClass}`}>
          {value} <span className="text-base font-medium text-slate-300">{unit}</span>
        </p>
      </div>
    </div>
  </div>
);

const TeacherDashboard = () => {
  // --- All your original logic, refs, and state are preserved ---
  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const starFieldsRef = useRef([]);

  const cookies = new Cookies();
  const token = cookies.get("token");

  const navigate = useNavigate();

  // --- All data fetching functions remain unchanged ---
  const fetchUser = async () => {
    return await axios.get("/api/Account/GetCurrentUser", { headers: { accept: "text/plain", Authorization: `Bearer ${token}` } })
      .catch((error) => console.error("User data fetch error:", error));
  };

  const fetchCourses =  async() => {
    return await axios.get(`/api/teacher/courses`, { headers: { accept: "/", Authorization: `Bearer ${token}` } })
      .catch((error) => console.error("Courses data fetch error:", error));
  };

  const fetchAllData = async () => {
    return await axios.get(`/api/Teacher/getTeacherByid`, { headers: { accept: "text/plain", Authorization: `Bearer ${token}` } })
      .catch((error) => console.error("All data fetch error:", error));
  };

  const getTeacherReport = async () => {
    return await axios.get(`/api/reports/teacher`, { headers: { Authorization: `Bearer ${token}` } })
      .catch((error) => console.error("Report data fetch error:", error));
  };

  const getSubmittedAssignments = async () => {
    return await axios.get(`/api/SubmitedAssignment/endExpiredAssignments`, { headers: { Authorization: `Bearer ${token}` } })
      .catch((error) => console.error("Assignments fetch error:", error));
  };

  // --- All useQuery hooks remain unchanged ---
  const { data: user, isLoading: userLoading } = useQuery({ queryKey: ["user"], queryFn: fetchUser, refetchOnWindowFocus: false });
  const { data: courses, isLoading: coursesLoading } = useQuery({ queryKey: ["courses"], queryFn: fetchCourses, refetchOnWindowFocus: false });
  const { data: allData } = useQuery({ queryKey: ["all-data"], queryFn: fetchAllData, refetchOnWindowFocus: false });
  const { data: report } = useQuery({ queryKey: ["report"], queryFn: getTeacherReport, refetchOnWindowFocus: false });

  // --- All useEffect hooks remain unchanged ---
  useEffect(() => { getSubmittedAssignments(); }, []);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    sceneRef.current = scene; cameraRef.current = camera; rendererRef.current = renderer;
    const createStarfield = (count, size, color) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i*3+0] = (Math.random() - 0.5) * 200;
        positions[i*3+1] = (Math.random() - 0.5) * 200;
        positions[i*3+2] = (Math.random() - 0.5) * 200;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({ size, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.7 });
      const starfield = new THREE.Points(geometry, material);
      scene.add(starfield);
      return starfield;
    };
    starFieldsRef.current = [createStarfield(8000, 0.05, 0x888888), createStarfield(5000, 0.1, 0xbbbbbb), createStarfield(1500, 0.15, 0xffffff)];
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      if(starFieldsRef.current[0]) starFieldsRef.current[0].rotation.y = elapsedTime * 0.01;
      if(starFieldsRef.current[1]) starFieldsRef.current[1].rotation.y = elapsedTime * 0.02;
      if(starFieldsRef.current[2]) starFieldsRef.current[2].rotation.y = elapsedTime * 0.03;
      if(rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();
    const handleResize = () => {
      if(cameraRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
      }
      if(rendererRef.current) {
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); };
  }, []);

  useEffect(() => {
    const mainContent = mainContentRef.current;
    if(!mainContent) return;
    const handleScroll = () => {
      const scrollY = mainContent.scrollTop;
      const docHeight = mainContent.scrollHeight - mainContent.clientHeight;
      const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;
      if(cameraRef.current) {
        cameraRef.current.position.z = 5 - scrollPercent * 10;
      }
    };
    mainContent.addEventListener("scroll", handleScroll);
    return () => mainContent.removeEventListener("scroll", handleScroll);
  }, []);

  if (userLoading || coursesLoading) {
    return <Loading />;
  }

  return (
    <div className="text-gray-100 font-[Cairo] h-screen overflow-hidden w-full" dir="rtl">
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-black" />

      <main ref={mainContentRef} className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#00BFFF rgba(0,0,0,0.2)" }}>
        
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-10">
            <h1 className="text-4xl font-black text-white mb-2" style={{ textShadow: "0 0 15px rgba(0, 191, 255, 0.7)" }}>
              برج المراقبة
            </h1>
            <p className="text-slate-400 text-lg">
              أهلاً بك مجددًا، {user?.data?.givenName || 'أستاذنا'}. إليك تقرير شامل عن أدائك.
            </p>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            <StatCard 
              label="الرصيد القابل للسحب"
              value={report?.data?.totals?.teacherEarnings || 0}
              unit="جنيه"
              colorClass="text-green-400"
              icon={<svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            />
            <StatCard 
              label="أرباح هذا الشهر"
              value={report?.data?.monthlySeries[report?.data?.monthlySeries?.length - 1]?.teacherEarnings || 0}
              unit="جنيه"
              icon={<svg className="w-6 h-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            />
            <StatCard 
              label="الاشتراكات النشطة"
              value={report?.data?.totals?.totalSubscriptions || 0}
              unit="طالب"
              icon={<svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.283.356-1.857m0 0a3.004 3.004 0 014.288 0M12 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
            <button className="w-full h-full p-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30">
              طلب سحب الأرباح
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* My Courses */}
            <div className="lg:col-span-3 bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-white">إدارة الكورسات</h2>
              <div className="space-y-4">
                {courses?.data?.items.map((course) => (
                  <div key={course.id} className="bg-slate-800/60 p-4 rounded-lg flex items-center justify-between transition-colors hover:bg-slate-800/90">
                    <div>
                      <h3 className="font-bold text-white">{course.title}</h3>
                      <p className="text-xs text-slate-400">
                        {course.stats.studentsCount} طالب مشترك
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/teacher/course/mange`, {state: {courseId: course.id}})}
                      className="px-4 py-2 text-sm rounded-lg bg-slate-700/80 hover:bg-slate-600/80 transition-colors font-semibold"
                    >
                      إدارة
                    </button>
                  </div>
                ))}
                <Link to="/teacher/addcourse" className="block text-center p-6 rounded-lg border-2 border-dashed border-slate-600 hover:border-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all text-slate-400 font-bold">
                  + إضافة كورس جديد
                </Link>
              </div>
            </div>

            {/* Personal Info */}
            <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-white">البيانات الشخصية</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="p-3 bg-slate-800 rounded-lg"><svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg></div>
                  <div className="mr-4">
                    <p className="text-sm text-slate-400">البريد الإلكتروني</p>
                    <p className="font-bold text-white">{user?.data?.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="p-3 bg-slate-800 rounded-lg"><svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
                  <div className="mr-4">
                    <p className="text-sm text-slate-400">رقم الهاتف</p>
                    <p className="font-bold text-white">{allData?.data?.phone || 'غير مسجل'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="p-3 bg-slate-800 rounded-lg"><svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l4-4m0 0l4 4m-4-4v18" /></svg></div>
                  <div className="mr-4">
                    <p className="text-sm text-slate-400">سنوات الخبرة</p>
                    <p className="font-bold text-white">{allData?.data?.experienceYears || 0} سنوات</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;