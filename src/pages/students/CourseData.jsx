import React, { useRef, Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Cookies } from "react-cookie";
import axios from "../../api/axios";
import Loading from "../../Components/Loading";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { BookOpen, PlayCircle, CheckCircle, Info, XCircle } from "lucide-react";

// Lazy load the heavy 3D background
const StarfieldBackground = lazy(() => import('../../Components/StarfieldBackground'));

// --- Helper Components ---

const LessonListItem = ({ lesson }) => (
    <Link 
        // 1. الرابط الآن يوجه لصفحة الدرس المنفصلة
        to={`/student/lesson/${lesson.id}`} 
        state={{ lessonId: lesson.id }} // تمرير ID الدرس للصفحة التالية
        className="block"
    >
        <motion.div 
            whileHover={{ scale: 1.02, backgroundColor: "rgba(0, 191, 255, 0.1)" }}
            className="flex items-center justify-between p-4 rounded-lg bg-[#0d0d21]/50 transition-colors"
        >
            <div className="flex items-center gap-4">
                <PlayCircle className="text-cyan-400 flex-shrink-0" size={24} />
                <div>
                    <p className="font-bold text-white">{lesson.title}</p>
                    <p className="text-sm text-gray-400">{lesson.summary}</p>
                </div>
            </div>
            {lesson.isCompleted && <CheckCircle size={20} className="text-green-500 flex-shrink-0" />}
        </motion.div>
    </Link>
);

const UnitCard = ({ unit, unitIndex }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 }
        }}
        className="mb-6 bg-[#05050d]/50 py-4 px-6 border border-cyan-400/20 rounded-xl glass-effect"
    >
        <div className="border-b border-cyan-400/20 pb-3 mb-3">
            <h2 className="text-2xl font-black text-cyan-400">الباب {unitIndex + 1}: {unit.title}</h2>
            <p className="text-gray-400 mt-1">{unit.description}</p>
        </div>
        <div className="space-y-3">
            {unit.lessons.length > 0 ? (
                unit.lessons.map(lesson => <LessonListItem key={lesson.id} lesson={lesson} />)
            ) : (
                <p className="text-center text-gray-500 py-4">لا توجد دروس في هذا الباب بعد.</p>
            )}
        </div>
    </motion.div>
);


// --- المكون الرئيسي ---
export default function CourseData() {
    const { courseId } = useParams();
    const cookies = new Cookies();
    const token = cookies.get("token");
    const mainContentRef = useRef(null);

    const { data: courseData, isLoading, isError } = useQuery({
        queryKey: ["courseContent", courseId],
        queryFn: async () => {
            // 2. استخدام نفس رابط الـ API الذي كان يعمل معك 100%
            const { data } = await axios.get(`/api/StudentCourse/${courseId}/full`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return data;
        },
        refetchOnWindowFocus: false,
    });

    if (isLoading) return <Loading message="جاري تحميل محتويات الكورس..." />;

    if (isError || !courseData) return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center">
            <XCircle size={64} className="text-red-500 mb-4"/>
            <h2 className="text-3xl font-bold mb-2">خطأ في الوصول للكورس</h2>
            <p className="text-gray-400 mb-6">إما أن هذا الكورس غير موجود، أو أن اشتراكك قد انتهى.</p>
            <Link to="/student/my-courses" className="px-6 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors">
                العودة إلى كورساتي
            </Link>
        </div>
    );

    const { course, units } = courseData;

    return (
        <div className="min-h-screen text-gray-100 bg-black font-[Cairo]">
            <Helmet>
                <title>{course?.title || "محتويات الكورس"}</title>
            </Helmet>
            <Suspense fallback={<div className="fixed inset-0 bg-black -z-10" />}>
                <StarfieldBackground mainContentRef={mainContentRef} />
            </Suspense>
            
            <main ref={mainContentRef} className="h-screen overflow-y-auto p-4 sm:p-8">
                <div className="max-w-4xl mx-auto">
                    <motion.header 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-cyan-500/30 p-2">
                           <BookOpen className="w-full h-full text-cyan-400" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-white title-glow">{course.title}</h1>
                        <p className="text-lg text-gray-400 mt-4">{course.description}</p>
                    </motion.header>
                    
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.1 } },
                            hidden: {}
                        }}
                    >
                        {units && units.length > 0 ? (
                            units.map((unit, index) => (
                                <UnitCard key={unit.id} unit={unit} unitIndex={index} />
                            ))
                        ) : (
                            <div className="glass-effect text-center p-12 rounded-2xl">
                                <Info size={48} className="mx-auto text-gray-600 mb-4"/>
                                <h3 className="text-xl font-bold text-white">الكورس فارغ حالياً</h3>
                                <p className="text-gray-400">لم يتم إضافة أي وحدات أو دروس لهذا الكورس بعد.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}