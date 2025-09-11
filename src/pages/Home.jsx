import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cookies } from "react-cookie";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import * as THREE from "three";
import { motion } from "framer-motion";
import { jwtDecode } from 'jwt-decode';

import axios from "../api/axios";
import CardSlider from "../Components/CardSlider";
import { BookOpen, Star, Eye, BarChart3, TrendingUp, Monitor, ArrowLeft } from "lucide-react";
import { IoCall } from "react-icons/io5";
import Footer from "../Components/Footer";
// Animation Variants for Framer Motion
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  },
};

const Header = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const navigate = useNavigate();

  const handleDashboardRedirect = () => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

        if (role === 'Teacher') {
          window.location.href = "/teacher/dashboard";
        } else {
          window.location.href = "/student/dashboard"; 
        }
      } catch (error) {
        console.error("Failed to decode token, redirecting to default dashboard:", error);
        window.location.href = "/dashboard";
      }
    }
  };
  
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[rgba(0,191,255,0.1)] bg-[rgba(10,10,25,0.5)] p-4 backdrop-blur-lg">
      <div className="text-3xl font-black text-white [text-shadow:0_0_10px_rgba(0,191,255,0.6),_0_0_20px_rgba(0,191,255,0.4)]">
        <Link to="/">المحاضرة.</Link>
      </div>
      <div className="flex items-center space-x-4 space-x-reverse">
        {token ? (
          <button
            onClick={handleDashboardRedirect}
            className="hover:shadow-[0_0_25px_rgba(0,191,255,0.7)] rounded-lg bg-cyan-500 px-6 py-3 text-sm font-bold text-black shadow-[0_0_15px_rgba(0,191,255,0.4)] transition-all duration-300 ease-in-out hover:-translate-y-1"
          >
            الدخول إلى لوحة التحكم
          </button>
        ) : (
          <>
            <Link to="/login" className="rounded-md px-5 py-2 text-sm font-bold text-white transition-colors duration-300 hover:text-cyan-300">
              تسجيل الدخول
            </Link>
            <Link to="/student-signup" className="hidden sm:block rounded-lg bg-white px-6 py-3 text-sm font-bold text-black shadow-lg shadow-white/20 transition-all duration-300 hover:-translate-y-1 hover:bg-opacity-90">
              ابدأ الآن مجانًا
            </Link>
          </>
        )}
      </div>
    </header>
  );
};


export default function Home() {
  const [activeFaq, setActiveFaq] = useState(null);
  const canvasRef = useRef(null);
  
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const starFieldsRef = useRef([]);

  const getCourses = async () => {
    return await axios.get(`/api/LandingPadge/GetTopCourses`).catch((error) => {
      console.error("Courses data fetch error:", error);
    });
  };
  const { data: courses } = useQuery({ queryKey: ["courses"], queryFn: getCourses });

  const getStudents = async () => {
    return await axios.get(`/api/LandingPadge/TopStudents`).catch((error) => {
      console.error("Students data fetch error:", error);
    });
  };
  const { data: students } = useQuery({ queryKey: ["students"], queryFn: getStudents });

  const faqs = [
    { q: "لمن هذه المنصة؟", a: "منصة المحاضرة مصممة خصيصًا لطلاب المرحلة الثانوية بجميع صفوفها، وتهدف إلى تقديم المواد العلمية والأدبية بطريقة مبتكرة وتفاعلية."},
    { q: "كيف يساعدني الذكاء الاصطناعي؟", a: "مساعدك الذكي يقدم لك خطط مذاكرة مخصصة، ويجيب على أسئلتك على مدار الساعة، كما ينشئ لك اختبارات مخصصة لتقييم مستواك."},
    { q: "هل يمكنني تجربة المنصة قبل الاشتراك؟", a: "بالتأكيد! يمكنك التسجيل مجانًا وتصفح بعض الدروس التجريبية المتاحة لترى بنفسك جودة المحتوى وتجربة التعلم الفريدة التي نقدمها."},
    { q: "ما هي طرق الدفع المتاحة للاشتراك؟", a: "نحن ندعم جميع طرق الدفع الإلكترونية الشائعة، بما في ذلك البطاقات الائتمانية والمحافظ الإلكترونية."},
  ];

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
            positions[i*3+0] = (Math.random() - 0.5) * 200;
            positions[i*3+1] = (Math.random() - 0.5) * 200;
            positions[i*3+2] = (Math.random() - 0.5) * 200;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ size, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.7 });
        return new THREE.Points(geometry, material);
    };
    starFieldsRef.current = [createStarfield(8000, 0.05, 0x888888), createStarfield(5000, 0.1, 0xbbbbbb), createStarfield(1500, 0.15, 0xffffff)];
    starFieldsRef.current.forEach(s => scene.add(s));
    
    const clock = new THREE.Clock();
    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        starFieldsRef.current[0].rotation.y = elapsedTime * 0.01;
        starFieldsRef.current[1].rotation.y = elapsedTime * 0.02;
        starFieldsRef.current[2].rotation.y = elapsedTime * 0.03;
        renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
    };
    window.addEventListener("resize", handleResize);

    const handleScroll = () => {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;
        camera.position.z = 5 - scrollPercent * 15;
        camera.position.y = -scrollPercent * 3;
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A19] text-white" style={{ direction: "rtl" }}>
      <Helmet>
        <title>منصة المحاضرة - أعد تعريف تجربة التفوق</title>
        <meta name="description" content="منصة المحاضرة تجمع أفضل المدرسين مع طلاب الثانوية باستخدام تكنولوجيا تفاعلية وأدوات ذكاء اصطناعي." />
      </Helmet>
      
      <canvas ref={canvasRef} className="fixed top-0 left-0 -z-10 h-full w-full opacity-70" />
      <div className="fixed top-0 left-0 -z-10 h-full w-full bg-gradient-to-b from-[#0A0A19] via-transparent to-[#0A0A19]" />

      <Header />
      
      <>
        <main className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4 text-center overflow-hidden">
          <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-4000" />
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="mb-6 text-5xl leading-tight font-black text-white md:text-8xl" style={{ textShadow: "0 0 20px rgba(0, 191, 255, 0.6)" }}
          >
            أعد تعريف تجربة التفوق
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-10 max-w-3xl text-lg leading-relaxed text-slate-300"
          >
            منصة المحاضرة هي النظام البيئي المتكامل الذي يجمع أفضل المدرسين مع طلاب المرحلة الثانوية الطموحين، باستخدام تكنولوجيا تفاعلية، أدوات ذكاء اصطناعي، وأساليب تعليمية من المستقبل.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link to="/student-signup" className="flex items-center gap-3 rounded-lg bg-cyan-500 px-8 py-4 text-lg font-bold text-black transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/30">
              <Monitor className="h-6 w-6" /> تصفح الكورسات كطالب
            </Link>
            <Link to="/teacher-signup" className="flex items-center gap-3 rounded-lg border-2 border-cyan-500 bg-transparent px-8 py-4 text-lg font-bold text-cyan-400 transition-all duration-300 hover:bg-cyan-500/10">
              <Star className="h-6 w-6" /> انضم إلينا كمدرس
            </Link>
          </motion.div>
        </main>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} id="ai-features" className="px-4 py-24">
            <div className="mx-auto max-w-6xl text-center">
                <h2 className="mb-4 text-5xl font-black text-white" style={{ textShadow: "0 0 12px rgba(0, 191, 255, 0.5)" }}>لأول مرة في منصة تعليمية...</h2>
                <p className="mb-12 text-3xl font-bold text-cyan-400">الذكاء الاصطناعي.. مساعدك الشخصي نحو القمة</p>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="transform rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-800/50 p-8 backdrop-blur-md transition-transform duration-300 hover:-translate-y-2"><div className="mb-4 flex h-24 items-center justify-center"><Monitor className="h-20 w-20 text-cyan-400" style={{ filter: "drop-shadow(0 0 8px rgba(0, 191, 255, 0.7))" }}/></div><h3 className="mb-3 text-2xl font-bold text-white">شرح أي سؤال بالـ AI</h3><p className="text-gray-300">واجهت سؤال صعب؟ صوره وأرسله لمساعدنا الذكي واحصل على شرح تفصيلي وخطوات الحل فورًا.</p></div>
                    <div className="transform rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-800/50 p-8 backdrop-blur-md transition-transform duration-300 hover:-translate-y-2"><div className="mb-4 flex h-24 items-center justify-center"><BarChart3 className="h-20 w-20 text-cyan-400" style={{ filter: "drop-shadow(0 0 8px rgba(0, 191, 255, 0.7))" }}/></div><h3 className="mb-3 text-2xl font-bold text-white">خطة مذاكرة ذكية</h3><p className="text-gray-300">يقوم الـ AI بتحليل مستواك ونقاط ضعفك، ثم يقترح عليك جدول مذاكرة ذكي لتحقيق أفضل النتائج.</p></div>
                    <div className="transform rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-800/50 p-8 backdrop-blur-md transition-transform duration-300 hover:-translate-y-2"><div className="mb-4 flex h-24 items-center justify-center"><BookOpen className="h-20 w-20 text-cyan-400" style={{ filter: "drop-shadow(0 0 8px rgba(0, 191, 255, 0.7))" }}/></div><h3 className="mb-3 text-2xl font-bold text-white">امتحانات تحاكي الواقع</h3><p className="text-gray-300">أنشئ امتحانات مخصصة من أي جزء في المنهج، واحصل على تقييم فوري لأدائك كأنك في امتحان حقيقي.</p></div>
                </div>
            </div>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="bg-black/30 px-4 py-24">
            <div className="mx-auto max-w-6xl">
                <h2 className="mb-16 text-center text-5xl font-black text-white" style={{ textShadow: "0 0 12px rgba(0, 191, 255, 0.5)" }}>منهجيتنا نحو التفوق.. في 3 خطوات</h2>
                <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
                    <div className="flex flex-col items-center"><div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full border-2 border-cyan-400/50 bg-gradient-to-br from-slate-900/40 to-slate-800/50 backdrop-blur-md"><Eye className="h-16 w-16 text-cyan-400" /></div><h3 className="mb-2 text-2xl font-bold text-white">1. استكشف وافهم</h3><p className="text-gray-400">شاهد شرح تفاعلي يتجاوز حدود المألوف، ويربط المنهج بأمثلة من عالم التكنولوجيا.</p></div>
                    <div className="flex flex-col items-center"><div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full border-2 border-cyan-400/50 bg-gradient-to-br from-slate-900/40 to-slate-800/50 backdrop-blur-md"><BarChart3 className="h-16 w-16 text-cyan-400" /></div><h3 className="mb-2 text-2xl font-bold text-white">2. تدرب وتحدى</h3><p className="text-gray-400">حل آلاف الأسئلة المتدرجة الصعوبة واختبر فهمك بتحديات يضعها لك مساعدك الذكي.</p></div>
                    <div className="flex flex-col items-center"><div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full border-2 border-cyan-400/50 bg-gradient-to-br from-slate-900/40 to-slate-800/50 backdrop-blur-md"><TrendingUp className="h-16 w-16 text-cyan-400" /></div><h3 className="mb-2 text-2xl font-bold text-white">3. أتقن وانطلق</h3><p className="text-gray-400">عزز معرفتك بامتحانات شاملة، تابع ترتيبك على لوحة الشرف، وانطلق نحو أعلى الدرجات.</p></div>
                </div>
            </div>
        </motion.section>

       <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} id="courses" className="px-4 py-24">
    <div className="mx-auto max-w-7xl">
        <h2 className="mb-4 text-center text-5xl font-black text-white" style={{ textShadow: "0 0 12px rgba(0, 191, 255, 0.5)" }}>اكتشف كنوز المعرفة</h2>
        <p className="mb-16 text-center text-lg text-gray-400">كورسات مصممة بعناية فائقة لتأخذك في رحلة من الأساسيات إلى الإتقان.</p>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses?.data?.map((course) => (
                // --- التعديل هنا ---
                <Link to={`/coursepreview/${course.id}`} key={course.id} className="block">
                    <motion.div 
                        variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                        className="group h-full flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 hover:border-cyan-500/30 transform hover:-translate-y-2"
                    >
                        <div className="relative">
                            <img src={course.image} alt={course.title} className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            <h3 className="absolute bottom-4 right-4 text-2xl font-bold text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">{course.title}</h3>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <p className="mb-4 text-gray-400 line-clamp-2 h-12">{course.description}</p>
                            <div className="flex items-center justify-end text-cyan-400 font-semibold mt-auto group-hover:text-cyan-300">
                                <span>استكشف الكورس</span>
                                <ArrowLeft className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
                            </div>
                        </div>
                    </motion.div>
                </Link>
            ))}
        </div>
    </div>
</motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} id="teachers" className="bg-black/30 px-4 py-24">
    <div className="mx-auto max-w-6xl text-center">
        <h2 className="mb-4 text-5xl font-black text-white" style={{ textShadow: "0 0 12px rgba(0, 191, 255, 0.5)" }}>انضم إلى كوكبة من أفضل المدرسين</h2>
        <p className="mb-12 text-lg text-gray-400">نخبة من الخبراء والمبدعين في مجال التعليم، جاهزون لإلهامك.</p>
        
        {/* استدعاء المكون هنا بدون props */}
        <CardSlider />

        <div className="text-center mt-12">
            <Link to="/teacher-signup" className="rounded-lg bg-slate-800 border-2 border-slate-700 px-8 py-4 text-lg font-bold text-cyan-400 transition-all duration-300 hover:border-cyan-500 hover:text-white hover:scale-105">
                أنا مدرس وأريد الانضمام
            </Link>
        </div>
    </div>
</motion.section>
        
        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} id="leaderboard" className="px-4 py-24">
            <h2 className="mb-12 text-center text-5xl font-black text-white" style={{ textShadow: "0 0 12px rgba(0, 191, 255, 0.5)" }}>لوحة المتميزين</h2>
            <div className="mx-auto max-w-4xl rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-800/50 p-6 backdrop-blur-md space-y-3">
                {students?.data?.map((student, index) => (
                    <div key={student.id} className={`flex items-center justify-between rounded-lg p-4 transition-all duration-300 ${index === 0 ? 'bg-yellow-500/20 border-2 border-yellow-400 scale-105 shadow-xl' : index === 1 ? 'bg-slate-500/20 border border-slate-400' : index === 2 ? 'bg-orange-700/20 border-orange-500' : 'bg-cyan-900/40'}`}>
                        <div className="flex items-center gap-4"><span className={`text-2xl font-bold w-10 text-center ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-cyan-400'}`}>{index + 1}</span><span className="text-xl font-bold text-white">{student.firstName} {student.lastName}</span></div>
                        <span className="text-xl font-bold text-cyan-300">{student.score} نقطة</span>
                    </div>
                ))}
            </div>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} id="testimonials" className="bg-black/30 px-4 py-24">
            <div className="mx-auto max-w-6xl">
                <h2 className="mb-16 text-center text-5xl font-black text-white" style={{ textShadow: "0 0 12px rgba(0, 191, 255, 0.5)" }}>ماذا يقول روادنا عن رحلتهم؟</h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-800/50 p-8 backdrop-blur-md"><div className="mb-4 flex items-center"><img src="https://placehold.co/60x60/ffffff/000000?text=ع" alt="صورة الطالب" className="h-16 w-16 rounded-full border-2 border-cyan-400" /><div className="mr-4"><h4 className="text-lg font-bold text-white">عمر الشريف</h4><p className="text-sm text-gray-400">طالب - الصف الثالث الثانوي</p></div></div><p className="text-gray-300 italic">"لم أتخيل يومًا أن دراسة الفيزياء يمكن أن تكون بهذه المتعة. الشرح وطريقة ربط المنهج بالفضاء جعلت كل شيء أسهل وأكثر إثارة."</p></div>
                    <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-800/50 p-8 backdrop-blur-md"><div className="mb-4 flex items-center"><img src="https://placehold.co/60x60/ffffff/000000?text=ن" alt="صورة ولي الأمر" className="h-16 w-16 rounded-full border-2 border-cyan-400" /><div className="mr-4"><h4 className="text-lg font-bold text-white">نورة عبدالله</h4><p className="text-sm text-gray-400">ولية أمر</p></div></div><p className="text-gray-300 italic">"كنت قلقة بشأن مستوى ابني في الرياضيات، ولكن مع أدوات الذكاء الاصطناعي والمتابعة المستمرة، رأيت تحسنًا مذهلاً في درجاته وثقته بنفسه."</p></div>
                    <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-800/50 p-8 backdrop-blur-md"><div className="mb-4 flex items-center"><img src="https://placehold.co/60x60/ffffff/000000?text=ي" alt="صورة الطالب" className="h-16 w-16 rounded-full border-2 border-cyan-400" /><div className="mr-4"><h4 className="text-lg font-bold text-white">يوسف محمود</h4><p className="text-sm text-gray-400">طالب - الصف الأول الثانوي</p></div></div><p className="text-gray-300 italic">"نظام النقاط والمنافسة على لوحة الشرف حمسني أذاكر وأحل واجباتي أول بأول. المنصة حولت المذاكرة للعبة ممتعة!"</p></div>
                </div>
            </div>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} id="faq" className="px-4 py-24">
            <div className="mx-auto max-w-4xl">
                <h2 className="mb-16 text-center text-5xl font-black text-white" style={{ textShadow: "0 0 12px rgba(0, 191, 255, 0.5)" }}>أسئلة شائعة</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/50 backdrop-blur-md">
                            <button onClick={() => setActiveFaq(activeFaq === index ? null : index)} className="flex w-full cursor-pointer items-center justify-between p-6 text-right">
                                <span className="text-lg font-bold text-white">{faq.q}</span>
                                <span className={`text-2xl font-light text-cyan-400 transition-transform duration-300 ${activeFaq === index ? 'rotate-45' : ''}`}>+</span>
                            </button>
                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeFaq === index ? "max-h-96" : "max-h-0"}`}>
                                <div className="p-6 pt-0 text-gray-300">{faq.a}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.section>

        <Footer />
      </>
    </div>
  );
}