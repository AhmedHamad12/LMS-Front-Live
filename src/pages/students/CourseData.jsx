import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Cookies } from "react-cookie";
import axios from "../../api/axios";
import Loading from "../../Components/Loading";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutList, PlayCircle, FileText, CheckCircle, Lock, Info } from "lucide-react";

// Lazy load the heavy 3D background for a massive performance boost
const StarfieldBackground = lazy(() => import('../../Components/StarfieldBackground'));

// --- Helper Components ---

const CourseSidebar = ({ units, activeLessonId, onLessonClick }) => (
    <div className="glass-effect p-6 rounded-2xl h-full flex flex-col">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <LayoutList className="text-cyan-400" />
            محتويات الكورس
        </h3>
        <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50">
            {units?.map((unit, unitIndex) => (
                <div key={unit.id} className="mb-6">
                    <p className="font-bold text-cyan-300 mb-3">الباب {unitIndex + 1}: {unit.title}</p>
                    <div className="space-y-2">
                        {unit.lessons.map(lesson => (
                            <button
                                key={lesson.id}
                                onClick={() => onLessonClick(lesson)}
                                className={`w-full text-right flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${activeLessonId === lesson.id ? 'bg-cyan-500/20 text-white' : 'text-gray-300 hover:bg-white/10'}`}
                            >
                                <PlayCircle size={20} className={activeLessonId === lesson.id ? 'text-cyan-400' : 'text-gray-500'} />
                                <span className="flex-grow">{lesson.title}</span>
                                {lesson.isCompleted && <CheckCircle size={18} className="text-green-500" />}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const LessonContent = ({ lesson, courseTitle }) => (
    <AnimatePresence mode="wait">
        <motion.div
            key={lesson ? lesson.id : 'empty'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-effect p-8 rounded-2xl h-full flex flex-col"
        >
            {lesson ? (
                <>
                    <div className="mb-6">
                        <p className="text-sm text-cyan-300 mb-1">{courseTitle}</p>
                        <h2 className="text-4xl font-black text-white title-glow">{lesson.title}</h2>
                    </div>
                    
                    {/* Video Player Placeholder */}
                    <div className="aspect-video bg-black rounded-lg mb-6 flex items-center justify-center border border-white/10">
                         <iframe 
                            className="w-full h-full rounded-lg" 
                            src={`https://www.youtube.com/embed/${lesson.videoUrl}`} 
                            title={lesson.title}
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>

                    <div className="prose prose-invert max-w-none text-gray-300 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50 pr-2">
                         <p>{lesson.content}</p>
                    </div>

                    {lesson.files && lesson.files.length > 0 && (
                        <div className="mt-6 border-t border-white/10 pt-4">
                            <h4 className="font-bold text-white mb-3">ملفات الدرس</h4>
                            <div className="flex flex-wrap gap-3">
                                {lesson.files.map(file => (
                                    <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg transition-colors">
                                        <FileText size={18} />
                                        <span>{file.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex items-center justify-center h-full text-center">
                    <div>
                        <Info size={48} className="mx-auto text-gray-600 mb-4"/>
                        <p className="text-xl text-gray-400">اختر درسًا من القائمة لبدء رحلتك.</p>
                    </div>
                </div>
            )}
        </motion.div>
    </AnimatePresence>
);


// --- Main CourseData Component ---
export default function CourseData() {
    const { courseId } = useParams();
    const cookies = new Cookies();
    const token = cookies.get("token");
    const mainContentRef = useRef(null);
    const [activeLesson, setActiveLesson] = useState(null);

    const { data: courseData, isLoading, isError } = useQuery({
        // The key is now dynamic, ensuring correct data fetching for each course
        queryKey: ["courseData", courseId],
        queryFn: async () => {
            try {
                const response = await axios.get(`/api/StudentCourse/${courseId}/full`, { headers: { Authorization: `Bearer ${token}` } });
                return response.data;
            } catch (error) {
                if (error.response?.status === 404) {
                    toast.error("الكورس غير موجود أو ليس لديك صلاحية الوصول.");
                }
                throw error; // Let react-query handle the error state
            }
        },
        onSuccess: (data) => {
            // Automatically select the first lesson of the first unit when data loads
            if (data?.units?.[0]?.lessons?.[0]) {
                setActiveLesson(data.units[0].lessons[0]);
            }
        },
        refetchOnWindowFocus: false,
    });
    
    if (isLoading) return <Loading message="جاري تحميل بيانات الكورس..." />;
    
    if (isError) return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center">
            <XCircle size={64} className="text-red-500 mb-4"/>
            <h2 className="text-3xl font-bold mb-2">حدث خطأ</h2>
            <p className="text-gray-400 mb-6">لم نتمكن من تحميل بيانات الكورس. قد يكون الرابط غير صحيح.</p>
            <Link to="/student/my-courses" className="px-6 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors">
                العودة إلى كورساتي
            </Link>
        </div>
    );
    
    return (
        <div className="min-h-screen text-gray-100" style={{ fontFamily: "Cairo, sans-serif" }}>
             <Helmet>
                <title>{courseData?.course?.title || "عرض الكورس"}</title>
            </Helmet>
            <Suspense fallback={<div className="fixed inset-0 bg-black -z-10" />}>
                <StarfieldBackground mainContentRef={mainContentRef} />
            </Suspense>

            <div ref={mainContentRef} className="h-screen overflow-y-auto">
                <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-4rem)]">
                        {/* Main Content (Left Column) */}
                        <div className="lg:col-span-2">
                             <LessonContent lesson={activeLesson} courseTitle={courseData?.course?.title} />
                        </div>

                        {/* Sidebar (Right Column) */}
                        <div className="lg:col-span-1">
                            <CourseSidebar
                                units={courseData?.units}
                                activeLessonId={activeLesson?.id}
                                onLessonClick={setActiveLesson}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}