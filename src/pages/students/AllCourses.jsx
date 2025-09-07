import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Search, Info, User, Tag, Check, Loader, Filter, Ticket } from "lucide-react"; // Added Ticket icon
import Loading from "../../Components/Loading";

// --- مكون الكارت المدمج (تم تعديله) ---
const CourseCard = ({ course, isEnrolled, isLoading, onEnroll, couponValue, onCouponChange }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonClass = isEnrolled
    ? "bg-green-600 cursor-not-allowed"
    : isLoading
    ? "bg-gray-600 cursor-wait"
    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500";
  
  const teacherName = course.firstName || "مدرس غير محدد";

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8, scale: 1.03 }}
      className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group flex flex-col transition-shadow duration-300 hover:shadow-[0_8px_40px_rgba(0,191,255,0.25)]"
    >
      <div className="absolute top-0 right-0 m-4 bg-cyan-400/10 backdrop-blur-md text-cyan-300 font-bold text-lg px-4 py-2 rounded-full border border-cyan-400/20 flex items-center gap-2 z-10">
        <Tag size={20} />
        <span>{course.price} ج.م</span>
      </div>

      <img
        src={course.courseImage}
        alt={course.title}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
      />

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-sm text-gray-400 mb-4 h-12 overflow-hidden">
          {course.description}
        </p>
        
        <div className="flex items-center text-gray-300 mb-4 text-sm">
          <User size={16} className="ml-2 text-cyan-400" />
          <span>{teacherName}</span>
        </div>

        <div className="mt-auto space-y-4">
          {/* --- NEW: Coupon input inside the card --- */}
          {!isEnrolled && !isLoading && (
            <div className="relative">
               <Ticket className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2" />
               <input
                 type="text"
                 value={couponValue}
                 onChange={onCouponChange}
                 placeholder="كود الخصم (اختياري)"
                 className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pr-10 focus:outline-none focus:bg-black/40 focus:border-cyan-400 transition-all text-white placeholder-gray-500"
               />
            </div>
          )}

          <button
            onClick={onEnroll}
            disabled={isEnrolled || isLoading}
            className={`w-full flex items-center justify-center p-3 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-105 ${buttonClass}`}
          >
            {isLoading ? (
              <><Loader size={20} className="animate-spin ml-2" /><span>جاري التحميل...</span></>
            ) : isEnrolled ? (
              <><Check size={20} className="ml-2" /><span>تم الاشتراك</span></>
            ) : ( "الاشتراك الآن" )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};


// --- المكون الرئيسي (تم تعديله) ---
const AllCourses = () => {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  // --- MODIFIED: Changed coupon state to handle multiple coupons ---
  const [coupons, setCoupons] = useState({}); 
  const [enrollmentStatus, setEnrollmentStatus] = useState({});
  const [loadingStates, setLoadingStates] = useState({});

  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const animationFrameId = useRef(null);

  const cookies = new Cookies();
  const token = cookies.get("token");

  // --- 3D Background Logic (unchanged) ---
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
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      starsFar.rotation.y = elapsedTime * 0.01;
      starsMid.rotation.y = elapsedTime * 0.02;
      starsClose.rotation.y = elapsedTime * 0.03;
      renderer.render(scene, camera);
      animationFrameId.current = requestAnimationFrame(animate);
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
    window.addEventListener('resize', handleResize);
    const scrollContainer = mainContentRef.current;
    if (scrollContainer) scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (scrollContainer) scrollContainer.removeEventListener('scroll', handleScroll);
      if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      scene.children.forEach(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  const { data: allCourses, isLoading: coursesLoading, isError } = useQuery({
    queryKey: ["allCoursesForStudent"],
    queryFn: () => axios.get("/api/AllowCourses/GetAllCoursesForMyStudyYear", { headers: { Authorization: `Bearer ${token}` } }),
    enabled: !!token,
  });

  useEffect(() => {
    if (allCourses?.data) {
      const checkAllEnrollments = async () => {
        const statusMap = {};
        const checks = allCourses.data.map(course =>
          axios.get(`/api/StudentCourse/IsAllowed/${course.id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => { statusMap[course.id] = res.data; })
            .catch(() => { statusMap[course.id] = false; })
        );
        await Promise.all(checks);
        setEnrollmentStatus(statusMap);
      };
      checkAllEnrollments();
    }
  }, [allCourses?.data, token]);

  // --- NEW: Handler for individual coupon inputs ---
  const handleCouponChange = (courseId, value) => {
    setCoupons(prev => ({ ...prev, [courseId]: value }));
  };

  // --- MODIFIED: enrollCourse now uses the specific coupon for the course ---
  const enrollCourse = async (courseId) => {
    setLoadingStates(prev => ({ ...prev, [courseId]: true }));
    const courseCoupon = coupons[courseId] || null; // Get coupon from state object
    try {
      const response = await axios.post(`/api/StudentCourse/Enroll?courseId=${courseId}`, { courseId, couponCode: courseCoupon }, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data?.url) { window.location.href = response.data.url; }
    } catch (error) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الاشتراك.");
    } finally {
      setLoadingStates(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const filteredCourses = allCourses?.data?.filter((course) => {
    const subjectMatch = subjectFilter === "" || course.subject === subjectFilter;
    const lowerCaseSearch = search.toLowerCase();
    const titleMatch = course.title.toLowerCase().includes(lowerCaseSearch);
    const teacherMatch = course.firstName && course.firstName.toLowerCase().includes(lowerCaseSearch);
    const searchMatch = search === "" || titleMatch || teacherMatch;
    return subjectMatch && searchMatch;
  });

  const groupedCourses = filteredCourses?.reduce((acc, course) => {
    const subject = course.subject || "أخرى";
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(course);
    return acc;
  }, {});

  if (coursesLoading) return <Loading />;
  if (isError) return (
    <div className="flex items-center justify-center h-screen bg-black text-white text-center">
      <div>
        <Info size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">حدث خطأ</h2>
        <p className="text-gray-400">لم نتمكن من تحميل الكورسات.</p>
      </div>
    </div>
  );

  return (
    <div className="text-gray-100 font-[Cairo] h-screen overflow-hidden w-full" dir="rtl">
      <Helmet><title>جميع الكورسات</title></Helmet>
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-black" />
      <main ref={mainContentRef} className="h-full p-4 sm:p-8 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#00BFFF rgba(0,0,0,0.2)" }}>
        <h1 className="text-4xl font-black text-white mb-2" style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}>اكتشف كورسات المعرفة</h1>
        <p className="text-gray-400 text-lg mb-8">ابحث عن رحلتك التعليمية التالية في مجرّتنا الواسعة.</p>

        {/* --- MODIFIED: Filter bar is now 2 columns, coupon input removed --- */}
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-2xl p-4 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 items-center sticky top-0 z-20">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن كورس أو مدرس..." className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pr-10 focus:outline-none focus:bg-black/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all text-white placeholder-gray-400"/>
          </div>
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2" />
            <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pr-10 appearance-none focus:outline-none focus:bg-black/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all text-white">
              <option value="">كل المواد</option>
              <option value="الفيزياء">الفيزياء</option>
              <option value="الكيمياء">الكيمياء</option>
              <option value="الرياضيات">الرياضيات</option>
              <option value="الأحياء">الأحياء</option>
              <option value="اللغة العربية">اللغة العربية</option>
              <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>
        </div>

        <div className="space-y-12">
          {groupedCourses && Object.keys(groupedCourses).map(subject => (
            <section key={subject}>
              <h2 className="text-3xl font-bold text-cyan-400 mb-6 border-b-2 border-cyan-400/20 pb-3" style={{ textShadow: "0 0 8px rgba(0, 191, 255, 0.5)" }}>{subject}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                {groupedCourses[subject].map(course => (
                   <CourseCard
                     key={course.id}
                     course={course}
                     isEnrolled={!!enrollmentStatus[course.id]}
                     isLoading={!!loadingStates[course.id]}
                     onEnroll={() => enrollCourse(course.id)}
                     // --- NEW: Pass coupon state and handler to each card ---
                     couponValue={coupons[course.id] || ""}
                     onCouponChange={(e) => handleCouponChange(course.id, e.target.value)}
                   />
                ))}
              </div>
            </section>
          ))}
        </div>

        {filteredCourses?.length === 0 && !coursesLoading && (
          <div className="col-span-full text-center py-16">
             <Info size={48} className="mx-auto text-gray-600 mb-4"/>
            <h3 className="text-xl font-bold text-white">لا توجد نتائج تطابق بحثك</h3>
            <p className="text-gray-400">حاول تغيير كلمات البحث أو الفلتر.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AllCourses;