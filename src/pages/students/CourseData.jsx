import React, { useState, useEffect, useRef, lazy, Suspense, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Cookies } from "react-cookie";
import axios from "../../api/axios";
import Loading from "../../Components/Loading";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

// استيراد الأيقونات اللازمة
import { LayoutList, PlayCircle, FileText, CheckCircle, Lock, Info, ArrowRight, VideoOff, XCircle } from "lucide-react";

const StarfieldBackground = lazy(() => import('../../Components/StarfieldBackground'));

// --- مكونات مساعدة بتصميم محسن ---

const CourseSidebar = ({ units, activeLessonId, onLessonClick, courseTitle }) => (
    <div className="glass-effect p-4 sm:p-6 rounded-2xl h-full flex flex-col">
        <div className="flex-shrink-0 mb-6">
            <p className="text-sm text-cyan-300">محتويات كورس</p>
            <h3 className="text-2xl font-bold text-white leading-tight">{courseTitle}</h3>
        </div>
        <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50">
            {units?.map((unit, unitIndex) => (
                <div key={unit.id} className="mb-6 last:mb-0">
                    <p className="font-bold text-cyan-300 mb-3 sticky top-0 bg-slate-800/50 backdrop-blur-sm py-2">الباب {unitIndex + 1}: {unit.title}</p>
                    <div className="space-y-2">
                        {unit.lessons.map(lesson => (
                            <button
                                key={lesson.id}
                                onClick={() => onLessonClick(lesson)}
                                className={`w-full text-right flex items-center gap-3 p-3 rounded-lg transition-all duration-200 border-l-4 ${activeLessonId === lesson.id ? 'bg-cyan-500/20 text-white border-cyan-400' : 'text-gray-300 hover:bg-white/10 border-transparent'}`}
                            >
                                <PlayCircle size={20} className={activeLessonId === lesson.id ? 'text-cyan-400' : 'text-gray-500'} />
                                <span className="flex-grow">{lesson.title}</span>
                                {lesson.isCompleted && <CheckCircle size={18} className="text-green-500 flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const LessonContent = ({ lesson, playerUrl, isCheckingGate, gateMessage, onNextLesson }) => {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={lesson ? lesson.id : 'empty'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-effect p-6 sm:p-8 rounded-2xl h-full flex flex-col"
            >
                {lesson ? (
                    <>
                        <div className="mb-6 flex-shrink-0">
                            <h2 className="text-3xl md:text-4xl font-black text-white title-glow">{lesson.title}</h2>
                        </div>
                        
                        <div className="aspect-video bg-black rounded-lg mb-6 flex items-center justify-center border border-white/10 overflow-hidden">
                            {isCheckingGate ? (
                                <div className="text-center text-slate-400"><Loading /> <p className="mt-2">جاري التحقق من صلاحية الوصول...</p></div>
                            ) : gateMessage ? (
                                <div className="text-center p-4"><Lock size={40} className="mx-auto text-yellow-400 mb-4" /><p className="font-semibold text-yellow-400">{gateMessage}</p></div>
                            ) : playerUrl ? (
                                <iframe 
                                    className="w-full h-full rounded-lg" 
                                    src={playerUrl}
                                    title={lesson.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="text-center p-4"><VideoOff size={40} className="mx-auto text-red-500 mb-4" /><p className="font-semibold text-red-400">رابط الفيديو غير متوفر لهذا الدرس.</p></div>
                            )}
                        </div>

                        <div className="prose prose-invert max-w-none text-gray-300 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50 pr-2 mb-6">
                            <p>{lesson.content}</p>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                            {lesson.pdfPath && (
                                <a href={lesson.pdfPath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg transition-colors">
                                    <FileText size={18} /><span>تحميل المرفقات</span>
                                </a>
                            )}
                            <button onClick={onNextLesson} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold transition-all transform hover:scale-105 ml-auto">
                                <span>الدرس التالي</span><ArrowRight size={18} />
                            </button>
                        </div>
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
};

// --- المكون الرئيسي لصفحة عرض الكورس ---
export default function CourseData() {
    const BUNNY_LIBRARY_ID = "475904"; 
    const { courseId } = useParams();
    const cookies = new Cookies();
    const token = cookies.get("token");
    const [activeLesson, setActiveLesson] = useState(null);
    const [playerUrl, setPlayerUrl] = useState('');
    const [gateMessage, setGateMessage] = useState('');
    const [isCheckingGate, setIsCheckingGate] = useState(false);

    const { data: courseData, isLoading, isError } = useQuery({
        queryKey: ["courseData", courseId],
        queryFn: async () => {
            const response = await axios.get(`/api/StudentCourse/${courseId}/full`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        },
        onSuccess: (data) => {
            const firstLesson = data?.units?.[0]?.lessons?.[0];
            if (firstLesson) {
                handleLessonClick(firstLesson);
            }
        },
        refetchOnWindowFocus: false,
        retry: 1,
    });
    
    const allLessons = useMemo(() => courseData?.units.flatMap(unit => unit.lessons) || [], [courseData]);

    const handleLessonClick = async (lesson) => {
        if (!lesson) return;
        
        setIsCheckingGate(true);
        setPlayerUrl('');
        setGateMessage('');
        setActiveLesson(lesson);

        try {
            const { data: gate } = await axios.get(`/api/Lesson/${lesson.id}/gate`, { headers: { Authorization: `Bearer ${token}` } });
            if (gate.locked) {
                setGateMessage(`🔒 مقفول: يجب إكمال ${gate.requiredPercent}% من الدرس السابق (أنت أكملت ${gate.currentPercent}%).`);
            } else if (lesson.vimeoId) {
                const videoEmbedUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${lesson.vimeoId}?autoplay=true`;
                setPlayerUrl(videoEmbedUrl);
            } else {
                setGateMessage("رابط الفيديو غير موجود لهذا الدرس.");
            }
        } catch (error) {
            setGateMessage("لا يمكن الوصول لهذا الدرس حالياً.");
            toast.error("حدث خطأ أثناء التحقق من صلاحية الوصول.");
        } finally {
            setIsCheckingGate(false);
        }
    };

    const handleNextLesson = () => {
        if (!activeLesson || allLessons.length === 0) return;
        const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
        const nextLesson = allLessons[currentIndex + 1];
        if (nextLesson) {
            handleLessonClick(nextLesson);
        } else {
            toast.success("تهانينا! لقد أكملت كل الدروس في هذا الكورس.");
        }
    };

    if (isLoading) return <Loading message="جاري تحميل الكورس..." />;
    if (isError) return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center">
            <XCircle size={64} className="text-red-500 mb-4"/>
            <h2 className="text-3xl font-bold mb-2">حدث خطأ</h2>
            <p className="text-gray-400 mb-6">لم نتمكن من تحميل بيانات الكورس. قد يكون ليس لديك صلاحية الوصول.</p>
            <Link to="/student/my-courses" className="px-6 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors">العودة إلى كورساتي</Link>
        </div>
    );
    
    return (
        <div className="min-h-screen text-gray-100 bg-black font-[Cairo]">
            <Helmet><title>{courseData?.course?.title || "عرض الكورس"}</title></Helmet>
            <Suspense fallback={<div className="fixed inset-0 bg-black -z-10" />}>
                <StarfieldBackground />
            </Suspense>
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 h-screen">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                    <div className="lg:col-span-2 h-full">
                        <LessonContent 
                            lesson={activeLesson}
                            playerUrl={playerUrl}
                            isCheckingGate={isCheckingGate}
                            gateMessage={gateMessage}
                            onNextLesson={handleNextLesson}
                        />
                    </div>
                    <div className="lg:col-span-1 h-full">
                        <CourseSidebar
                            units={courseData?.units}
                            activeLessonId={activeLesson?.id}
                            onLessonClick={handleLessonClick}
                            courseTitle={courseData?.course?.title}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}