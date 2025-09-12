import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast'; // تم تغيير المكتبة لتتناسب مع باقي المشروع
import { Cookies } from 'react-cookie'; // تم استبدال js-cookie
import { jwtDecode } from 'jwt-decode'; // لاستخلاص الدور من التوكن

import Loading from '../../Components/Loading';
import { XCircle, Clock, BookOpen, Layers, Users, Play, Lock, Tag, ChevronDown, X } from 'lucide-react';

// --- Helper Components ---
const Stat = ({ icon, label, value }) => ( <div className="flex items-center gap-3"> {icon} <span className="text-white"><span className="font-bold">{value}</span> {label}</span> </div> );
const LessonItem = ({ lesson, onClick }) => { const isClickable = lesson.isFreePreview; return ( <button onClick={() => onClick(lesson)} disabled={!isClickable} className={`w-full flex items-center justify-between p-3 rounded-lg text-right transition-colors ${isClickable ? 'cursor-pointer hover:bg-slate-800/50' : 'cursor-not-allowed'}`} > <div className="flex items-center gap-4"> {lesson.isFreePreview ? <Play size={20} className="text-cyan-400 flex-shrink-0" /> : <Lock size={20} className="text-gray-500 flex-shrink-0" />} <p className={isClickable ? "text-gray-200" : "text-gray-600"}>{lesson.title}</p> </div> <div className="flex items-center gap-4"> {lesson.isFreePreview && ( <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">معاينة مجانية</span> )} <p className="text-xs text-gray-400 tabular-nums">{Math.floor(lesson.durationSeconds / 60)}:{String(lesson.durationSeconds % 60).padStart(2, '0')}</p> </div> </button> ); };
const UnitAccordionItem = ({ unit, index, onLessonClick }) => { const [isOpen, setIsOpen] = useState(index === 0); return ( <div className="glass-effect rounded-xl border border-white/10 overflow-hidden"> <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 text-right bg-slate-800/20 hover:bg-slate-800/50 transition-colors"> <div> <h3 className="font-bold text-lg text-white">{unit.title}</h3> <p className="text-sm text-gray-400">{unit.description}</p> </div> <ChevronDown size={24} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}/> </button> <AnimatePresence> {isOpen && ( <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden"> <div className="border-t border-white/10 p-2"> {unit.lessons.map(lesson => <LessonItem key={lesson.id} lesson={lesson} onClick={onLessonClick} />)} </div> </motion.div> )} </AnimatePresence> </div> ); };


export default function CoursePreview() {
    const BUNNY_LIBRARY_ID = "475904"; 
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    const [playingVideoUrl, setPlayingVideoUrl] = useState(null);
    const [playingVideoTitle, setPlayingVideoTitle] = useState('');
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [courseCoupon, setCourseCoupon] = useState("");
    
    const cookies = new Cookies();
    const token = cookies.get('token'); 

    // --- التعديل هنا: إضافة منطق التعرف على دور المستخدم ---
    const userRole = useMemo(() => {
        if (!token) return null;
        try {
            const decodedToken = jwtDecode(token);
            return decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        } catch (error) {
            console.error("Invalid token:", error);
            return null;
        }
    }, [token]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['coursePreview', courseId],
        queryFn: async () => {
            const response = await axios.get(`/api/teacher/Courses/${courseId}/Preview`);
            return response.data;
        },
        enabled: !!courseId,
    });
    
    const { course, stats, units } = data || {};
    
    const totalHours = useMemo(() => {
        if (!stats?.totalDurationSeconds) return '0.0';
        return (stats.totalDurationSeconds / 3600).toFixed(1);
    }, [stats]);

    const isFreeCourse = useMemo(() => course?.price === 0, [course]);

    const firstFreeLesson = useMemo(() => {
        if (!units) return null;
        return units.flatMap(unit => unit.lessons).find(lesson => lesson.isFreePreview && lesson.vimeoId);
    }, [units]);

    const handleLessonClick = (lesson) => {
        if (lesson && lesson.isFreePreview && lesson.vimeoId) {
            const videoEmbedUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${lesson.vimeoId}?autoplay=true`;
            setPlayingVideoUrl(videoEmbedUrl);
            setPlayingVideoTitle(lesson.title);
        } else if (lesson && lesson.isFreePreview) {
            toast.warn("رابط المعاينة غير متوفر حالياً.");
        } else {
            toast.error("يجب عليك الاشتراك في الكورس لمشاهدة هذا الدرس");
        }
    };
    
    // --- التعديل هنا: إضافة التحقق من دور المستخدم قبل الاشتراك ---
    const handleEnrollment = async () => {
        if (!token) {
            toast.error("يرجى تسجيل الدخول أولاً للمتابعة.");
            navigate('/login');
            return;
        }

        if (userRole === 'Teacher') {
            toast.error("لا يمكن للمدرسين الاشتراك في الكورسات. يرجى تسجيل الدخول بحساب طالب.");
            return;
        }

        setIsEnrolling(true);
        try {
            const response = await axios.post(`/api/StudentCourse/Enroll?courseId=${courseId}`, { courseId, couponCode: courseCoupon || null }, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data?.url) {
                window.location.href = response.data.url;
            } else {
                toast.success("تم الاشتراك بنجاح!");
                navigate('/student/mycourses');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء الاشتراك.");
        } finally {
            setIsEnrolling(false);
        }
    };

    if (isLoading) return <Loading message="جاري تحضير الكورس..." />;
    if (isError || !data) return ( <div className="flex flex-col items-center justify-center h-screen bg-black text-white"><XCircle size={64} className="text-red-500 mb-4" /><h2 className="text-3xl font-bold">هذا الكورس غير متوفر حاليًا</h2><Link to="/" className="mt-6 px-6 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors">العودة للرئيسية</Link></div> );

    const isTeacher = userRole === 'Teacher';

    return (
        <div className="min-h-screen bg-black text-white" style={{ fontFamily: "Cairo, sans-serif" }}>
            <Helmet><title>{course.title}</title></Helmet>
            
            <AnimatePresence>
                {playingVideoUrl && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setPlayingVideoUrl(null)} > <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} className="relative z-10 w-full max-w-4xl" onClick={(e) => e.stopPropagation()} > <div className="flex justify-between items-center mb-2 px-2"> <h2 className="text-xl font-bold text-white">{playingVideoTitle}</h2> <button onClick={() => setPlayingVideoUrl(null)} className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"><X size={24} /></button> </div> <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border border-cyan-500/20 shadow-2xl shadow-cyan-500/20"> <iframe src={playingVideoUrl} className="w-full h-full border-0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title={playingVideoTitle} ></iframe> </div> </motion.div> </motion.div> )}
            </AnimatePresence>

            <div className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center p-4">
                <div className="absolute inset-0 bg-black overflow-hidden"><img src={course.courseImage} alt="" className="w-full h-full object-cover opacity-30 blur-sm" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div></div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10">
                    <p className="text-cyan-400 font-bold mb-2">{course.teacher.subject}</p>
                    <h1 className="text-4xl md:text-6xl font-black text-white title-glow mb-4 max-w-4xl">{course.title}</h1>
                    <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">{course.description}</p>
                    <Link to={`/teacherprofile/${course.teacher.id}`} className="inline-flex items-center gap-4 group">
                        <img src={course.teacher.teacherImage} alt={course.teacher.name} className="w-14 h-14 rounded-full border-2 border-cyan-500/50 transition-transform group-hover:scale-110 object-top" />
                        <div>
                            <p className="font-bold text-white group-hover:text-cyan-300 transition-colors">مقدم بواسطة: {course.teacher.name}</p>
                            <p className="text-sm text-gray-400">{course.teacher.experienceYears} سنوات من الخبرة</p>
                        </div>
                    </Link>
                </motion.div>
            </div>
            
            <main className="container mx-auto px-4 py-12 -mt-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    <div className="lg:col-span-3">
                        <h2 className="text-3xl font-bold mb-6">محتويات الكورس</h2>
                        <div className="space-y-4">{units.map((unit, index) => <UnitAccordionItem key={unit.id} unit={unit} index={index} onLessonClick={handleLessonClick}/>)}</div>
                    </div>
                    <div className="lg:col-span-2">
                        <div className="sticky top-24">
                            <div className="glass-effect rounded-2xl overflow-hidden border border-white/10">
                                <div className="relative group">
                                    <img src={course.courseImage} alt={course.title} className="w-full h-56 object-cover" />
                                    {firstFreeLesson && (<button onClick={() => handleLessonClick(firstFreeLesson)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"><div className="w-20 h-20 rounded-full bg-cyan-500/70 flex items-center justify-center backdrop-blur-sm border-2 border-white/50"><Play size={40} className="text-white" fill="white" /></div></button>)}
                                </div>
                                <div className="p-6">
                                    {isFreeCourse ? ( <p className="text-4xl font-black text-center mb-4 text-green-400">مجاني</p> ) : ( <p className="text-4xl font-black text-center mb-4">{course.price} <span className="text-lg">ج.م</span></p> )}
                                    {!isFreeCourse && !isTeacher && ( <div className="relative mb-4"><Tag className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="عندك كود خصم؟" value={courseCoupon} onChange={(e) => setCourseCoupon(e.target.value)} className="w-full bg-gray-900/50 border border-white/20 rounded-lg py-3 pr-4 pl-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition"/></div> )}
                                    
                                    {/* --- التعديل هنا: تغيير شكل ومحتوى الزر للمدرس --- */}
                                    <button 
                                        onClick={handleEnrollment} 
                                        className={`w-full block text-center rounded-lg px-8 py-4 text-lg font-bold transition-all duration-300 disabled:scale-100 
                                            ${isTeacher 
                                                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                                                : 'bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-105 disabled:bg-gray-600 disabled:cursor-wait'
                                            }`}
                                        disabled={isEnrolling || isTeacher}
                                    >
                                        {isEnrolling ? 'لحظات من فضلك...' : (isTeacher ? 'غير متاح للمدرسين' : (isFreeCourse ? 'ابدأ التعلم الآن' : 'اشترك الآن'))}
                                    </button>

                                    <div className="space-y-3 mt-6 pt-6 border-t border-white/10 text-sm text-gray-300">
                                        <h4 className="font-bold text-white text-base mb-2">هذا الكورس يتضمن:</h4>
                                        <Stat icon={<Layers size={20} className="text-cyan-400"/>} label="وحدة" value={stats.unitsCount} />
                                        <Stat icon={<BookOpen size={20} className="text-cyan-400"/>} label="درس" value={stats.lessonsCount} />
                                        <Stat icon={<Clock size={20} className="text-cyan-400"/>} label={`ساعة`} value={totalHours} />
                                        <Stat icon={<Users size={20} className="text-cyan-400"/>} label="طالب مشترك" value={stats.studentsPaidCount} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}