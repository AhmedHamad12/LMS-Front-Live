import React, { useState, useMemo, lazy, Suspense, useEffect, useRef } from "react";
import { Cookies } from "react-cookie";
import * as THREE from "three";
import axios from "../../api/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Zap, CheckCircle, PlayCircle, Star, Info, Check } from "lucide-react";
import Loading from "../../Components/Loading";
import { toast } from "react-hot-toast";

// --- استيراد المكون الكسول (Lazy Import) ---
const StarfieldBackground = lazy(() => import('../../Components/StarfieldBackground'));

// --- المكونات المساعدة ---

const StatCard = ({ icon, label, value, color }) => (
    <div className="glass-effect p-6 rounded-2xl flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
);
  
const DashboardHeader = ({ counts }) => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
    >
      <StatCard icon={<BookOpen size={24} className="text-white" />} label="إجمالي الكورسات" value={counts.all} color="bg-blue-500/30" />
      <StatCard icon={<Zap size={24} className="text-white" />} label="قيد التقدم" value={counts.inProgress} color="bg-cyan-500/30" />
      <StatCard icon={<CheckCircle size={24} className="text-white" />} label="كورسات مكتملة" value={counts.completed} color="bg-green-500/30" />
    </motion.div>
);
  
const CircularProgress = ({ progress }) => {
    const radius = 38;
    const stroke = 7;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    const progressColor = progress >= 100 ? 'stroke-green-500' : 'stroke-cyan-400';
  
    return (
      <div className="relative w-24 h-24">
        <svg height="100%" width="100%" viewBox="0 0 100 100" className="-rotate-90">
          <circle className="stroke-slate-700" strokeWidth={stroke} fill="transparent" r={normalizedRadius} cx="50" cy="50" />
          <motion.circle
            className={progressColor}
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx="50"
            cy="50"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
          {progress >= 100 ? <Check size={30} className="text-green-500" /> : `${Math.round(progress)}%`}
        </div>
      </div>
    );
};
  
const CourseCard = ({ course, navigate }) => {
    const progress = course.progress || 0;
    const buttonInfo = useMemo(() => {
      if (progress >= 100) return { text: "مراجعة الكورس", icon: <Check size={20} />, style: "from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500" };
      if (progress > 0) return { text: "أكمل الرحلة", icon: <PlayCircle size={20} />, style: "from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500" };
      return { text: "ابدأ الرحلة", icon: <Star size={20} />, style: "from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500" };
    }, [progress]);
  
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.4 }}
        className="glass-effect group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_8px_40px_rgba(0,191,255,0.25)]"
      >
        <img src={course.courseImage} alt={course.title} className="h-48 w-full object-cover" />
        <div className="flex flex-grow flex-col p-6">
          <div className="flex justify-between items-start gap-4">
            <h3 className="mb-2 text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
              {course.title}
            </h3>
            <CircularProgress progress={progress} />
          </div>
          <p className="mb-4 text-sm text-gray-400 flex-grow">{course.description}</p>
          <button
            onClick={() => navigate(`/student/course/data/${course.id}`)}
            className={`mt-auto w-full flex items-center justify-center gap-2 rounded-lg p-3 text-center font-bold text-white transition-all transform hover:scale-105 bg-gradient-to-r ${buttonInfo.style}`}
          >
            {buttonInfo.icon}
            {buttonInfo.text}
          </button>
        </div>
      </motion.div>
    );
};
  
const EmptyState = ({ filter }) => (
      <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-full text-center py-16"
      >
          <Info size={56} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white">
              {filter === "completed" && "لا توجد كورسات مكتملة بعد"}
              {filter === "in-progress" && "لا توجد كورسات قيد التقدم حالياً"}
              {filter === "all" && "لم تشترك في أي كورس بعد"}
          </h3>
          <p className="text-gray-400 mb-6">
              {filter !== "all" ? "جرّب تغيير الفلتر أو ابدأ كورسًا جديدًا!" : "اكتشف الكورسات المتاحة وانطلق في رحلتك."}
          </p>
          <Link to="/student/allcourses" className="text-cyan-400 hover:text-cyan-300 font-bold underline transition-colors">
              اكتشف كورسات جديدة
          </Link>
      </motion.div>
);

// --- المكون الرئيسي ---
export default function MyCourses() {
  const [filter, setFilter] = useState("all");
  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const navigate = useNavigate();
  const cookies = new Cookies();
  const token = cookies.get("token");
  const location = useLocation();
  const queryClient = useQueryClient();

  // --- منطق خلفية النجوم (يبقى كما هو) ---
  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    const createStarfield = (count, size, color) => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ size, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.7 });
        const starfield = new THREE.Points(geometry, material);
        scene.add(starfield);
        return starfield;
    };
    const starsFar = createStarfield(8000, 0.05, 0x888888);
    const starsMid = createStarfield(5000, 0.1, 0xbbbbbb);
    const starsClose = createStarfield(1500, 0.15, 0xffffff);
    const clock = new THREE.Clock();
    let animationFrameId;
    const animate = () => {
        const elapsedTime = clock.getElapsedTime();
        starsFar.rotation.y = elapsedTime * 0.01;
        starsMid.rotation.y = elapsedTime * 0.02;
        starsClose.rotation.y = elapsedTime * 0.03;
        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    const handleScroll = () => {
        if (!mainContentRef.current) return;
        const scrollY = mainContentRef.current.scrollTop;
        const docHeight = mainContentRef.current.scrollHeight - mainContentRef.current.clientHeight;
        const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;
        camera.position.z = 5 - scrollPercent * 10;
    };
    window.addEventListener("resize", handleResize);
    const mainContent = mainContentRef.current;
    if (mainContent) mainContent.addEventListener("scroll", handleScroll);
    return () => {
        window.removeEventListener("resize", handleResize);
        if (mainContent) mainContent.removeEventListener("scroll", handleScroll);
        cancelAnimationFrame(animationFrameId);
        renderer.dispose();
    };
  }, []);

  const { data: myCourses, isLoading } = useQuery({
    queryKey: ["myCourses"],
    queryFn: () => axios.get("/api/StudentCourse/MyCourses", { headers: { Authorization: `Bearer ${token}` } }),
    enabled: !!token,
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('paymentStatus');
    const merchantOrderId = params.get('merchantOrderId');

    if (paymentStatus === 'SUCCESS' && merchantOrderId) {
      const verifyPaymentAndNotify = async () => {
        try {
          const response = await axios.get(`/api/orders/by-merchant-order/${merchantOrderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const courseTitle = response.data.courseTitle;
          toast.success(`تم الاشتراك بنجاح في كورس "${courseTitle}"!`, {
            duration: 4000,
            position: 'top-center',
          });

        } catch (error) {
          console.error("خطأ في جلب تفاصيل الطلب:", error);
          toast.success('تمت عملية الشراء بنجاح!', {
            duration: 4000,
            position: 'top-center',
          });
        } finally {
          queryClient.invalidateQueries({ queryKey: ['myCourses'] });
          navigate('/student/mycourses', { replace: true });
        }
      };

      verifyPaymentAndNotify();
    }
  }, [location, navigate, token, queryClient]);

  const { filteredCourses, counts } = useMemo(() => {
    const courses = myCourses?.data || [];
    const counts = {
      all: courses.length,
      inProgress: courses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100).length,
      completed: courses.filter(c => (c.progress || 0) >= 100).length,
    };
    const filteredCourses = courses.filter((course) => {
        const progress = course.progress || 0;
        switch (filter) {
            case "completed": return progress >= 100;
            case "in-progress": return progress > 0 && progress < 100;
            default: return true;
        }
    });
    return { filteredCourses, counts };
  }, [myCourses, filter]);

  if (isLoading) return <Loading />;

  return (
    <>
      <canvas ref={canvasRef} className="fixed top-0 left-0 -z-10 h-full w-full bg-black" />
      <main ref={mainContentRef} className="flex-1 overflow-y-auto p-4 sm:p-8" style={{ scrollbarWidth: "thin", scrollbarColor: "#00BFFF rgba(0,0,0,0.2)" }}>
        <h1 className="mb-2 text-4xl font-black text-white title-glow">أسطول كورساتك</h1>
        <p className="mb-8 text-lg text-gray-400">جميع الكورسات المعرفية التي انطلقت بها في المنصة.</p>
        
        <DashboardHeader counts={counts} />

        <div className="mb-8 flex items-center gap-2 sm:gap-4 flex-wrap">
          {[{ key: "all", label: "الكل" }, { key: "in-progress", label: "قيد التقدم" }, { key: "completed", label: "مكتملة" }].map(btn => (
            <button key={btn.key} onClick={() => setFilter(btn.key)} className={`relative rounded-lg px-4 py-2 text-sm font-bold transition-colors ${filter === btn.key ? "text-white" : "text-gray-400 hover:text-white"}`}>
              {filter === btn.key && <motion.div layoutId="active-pill" className="absolute inset-0 bg-cyan-500/20 border border-cyan-500 rounded-lg" />}
              <span className="relative z-10">{btn.label} ({counts[btn.key === 'in-progress' ? 'inProgress' : btn.key]})</span>
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => <CourseCard key={course.id} course={course} navigate={navigate} />)
            ) : (
              <EmptyState filter={filter} />
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </>
  );
}