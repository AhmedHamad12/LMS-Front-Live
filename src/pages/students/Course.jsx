import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Cookies } from "react-cookie";
import axios, { BASE_URL } from "../../api/axios";
import Loading from "../../Components/Loading";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { BookCopy, CheckCircle, Clock, FileText, Info, Lock, PlayCircle, Trophy, XCircle } from "lucide-react";

const StarfieldBackground = lazy(() => import('../../Components/StarfieldBackground'));

// --- Helper Components ---

const CourseHeader = ({ title, progress }) => {
    const radius = 30;
    const stroke = 4;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="flex-shrink-0 glass-effect p-4 flex items-center justify-between border-b border-white/10">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <div className="flex items-center gap-3 text-sm">
                <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r={radius} stroke="gray" strokeWidth={stroke} fill="none" className="opacity-30" />
                        <motion.circle
                            cx="40" cy="40" r={radius} stroke="rgb(129, 140, 248)" strokeWidth={stroke} fill="none"
                            strokeDasharray={circumference} strokeLinecap="round"
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: offset }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-indigo-400" />
                    </div>
                </div>
                <span>تقدمك ({Math.floor(progress)}%)</span>
            </div>
        </div>
    );
};

const CourseCurriculum = ({ units, activeLessonId, onLessonClick }) => (
    <div className="glass-effect p-4 rounded-2xl h-full flex flex-col">
        <h3 className="text-xl font-bold text-white mb-4 p-2 flex-shrink-0">محتويات الكورس</h3>
        <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50">
            {units.map((unit, index) => (
                <div key={unit.id} className="mb-4">
                    <p className="font-bold text-cyan-300 mb-2 p-2">الباب {index + 1}: {unit.title}</p>
                    <div className="space-y-1">
                        {unit.lessons.map(lesson => {
                            const isCompleted = (lesson.progress?.percent || 0) >= 95;
                            const isActive = activeLessonId === lesson.id;
                            return (
                                <button
                                    key={lesson.id}
                                    onClick={() => onLessonClick(lesson)}
                                    className={`w-full text-right flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-cyan-500/20' : 'hover:bg-white/10'}`}
                                >
                                    {isCompleted ? <CheckCircle size={20} className="text-green-500 flex-shrink-0" /> : <PlayCircle size={20} className={`flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-gray-500'}`} />}
                                    <span className={`flex-grow ${isActive ? 'text-white font-bold' : 'text-gray-300'}`}>{lesson.title}</span>
                                    <div className="w-12 flex-shrink-0 text-xs text-gray-400">{Math.floor(lesson.progress?.percent || 0)}%</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const LessonPlayer = ({ lesson, gateMessage }) => {
    if (gateMessage) {
        return (
            <div className="w-full h-full glass-effect rounded-2xl flex flex-col items-center justify-center text-center p-8">
                <Lock size={48} className="text-yellow-400 mb-4"/>
                <h3 className="text-2xl font-bold text-white mb-2">الدرس مقفول</h3>
                <p className="text-yellow-300">{gateMessage}</p>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="w-full h-full glass-effect rounded-2xl flex flex-col items-center justify-center text-center p-8">
                <BookCopy size={48} className="text-cyan-400 mb-4"/>
                <h3 className="text-2xl font-bold text-white mb-2">أهلاً بك في الكورس</h3>
                <p className="text-gray-400">اختر درسًا من القائمة الجانبية لبدء رحلتك التعليمية.</p>
            </div>
        );
    }
    
    return (
        <div className="w-full h-full glass-effect rounded-2xl flex flex-col">
            <div className="aspect-video bg-black rounded-t-2xl">
                 <iframe 
                    className="w-full h-full rounded-t-2xl" 
                    src={lesson.playerUrl}
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>
            <div className="p-6 flex-grow">
                <h2 className="text-3xl font-bold text-white mb-2">{lesson.title}</h2>
                <p className="text-gray-300">{lesson.content}</p>
            </div>
        </div>
    );
};


// --- Main Course Player Component ---
export default function Course() {
    const { courseId } = useParams();
    const cookies = new Cookies();
    const token = cookies.get("token");

    const [activeLesson, setActiveLesson] = useState(null);
    const [gateMessage, setGateMessage] = useState("");
    const [playerUrl, setPlayerUrl] = useState("");

    const { data: courseData, isLoading, isError, refetch } = useQuery({
        queryKey: ["coursePlayerData", courseId],
        queryFn: async () => {
            try {
                const response = await axios.get(`/api/StudentCourse/${courseId}/full`, { headers: { Authorization: `Bearer ${token}` } });
                return response.data;
            } catch (error) {
                if (error.response?.status === 404) toast.error("الكورس غير موجود أو لا تملك صلاحية الوصول.");
                throw error;
            }
        },
        onSuccess: (data) => {
            if (data?.units?.[0]?.lessons?.[0]) {
                handleLessonClick(data.units[0].lessons[0]);
            }
        },
        refetchOnWindowFocus: false,
    });
    
    const handleLessonClick = async (lesson) => {
        setGateMessage("...جاري التحقق");
        setPlayerUrl("");
        setActiveLesson(lesson);

        try {
            const gate = await axios.get(`/api/Lesson/${lesson.id}/gate`, { headers: { Authorization: `Bearer ${token}` } });
            if (gate.data.locked) {
                setGateMessage(`🔒 مقفول: يجب إكمال ${gate.data.requiredPercent}% من الدرس السابق (أنت ${gate.data.currentPercent}%).`);
                return;
            }
            setGateMessage("");
            
            // NOTE: The video URL should come from a secure backend endpoint, not constructed here.
            // This is a placeholder for the logic that would fetch the secure Bunny.net or Vimeo URL.
            // For now, using a placeholder logic.
            const videoId = lesson.vimeoId; // Or bunnyId, etc.
            const libraryId = "475904"; // This should ideally be configured elsewhere
            const fetchedPlayerUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=true`;
            
            // In a real scenario, you'd fetch progress and set start time, etc.
            // For simplicity in this refactor, we are just loading the video.
            setActiveLesson(prev => ({...prev, playerUrl: fetchedPlayerUrl}));

        } catch (error) {
            toast.error("حدث خطأ أثناء تحميل الدرس.");
            setGateMessage("لا يمكن تحميل الدرس حاليًا.");
        }
    };

    if (isLoading) return <Loading message="جاري تحميل الكورس..." />;

    if (isError) return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center">
            <XCircle size={64} className="text-red-500 mb-4" />
            <h2 className="text-3xl font-bold mb-2">حدث خطأ</h2>
            <p className="text-gray-400 mb-6">لم نتمكن من تحميل بيانات الكورس.</p>
            <Link to="/student/my-courses" className="px-6 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors">العودة إلى كورساتي</Link>
        </div>
    );

    return (
        <div className="bg-black text-gray-100 min-h-screen" style={{ fontFamily: "Cairo, sans-serif" }}>
            <Helmet>
                <title>{courseData?.course?.title || "مشغّل الكورس"}</title>
            </Helmet>
            <Suspense fallback={<div className="fixed inset-0 bg-black -z-10" />}>
                <StarfieldBackground />
            </Suspense>

            <div className="flex flex-col h-screen">
                <CourseHeader title={courseData?.course?.title} progress={courseData?.courseProgress || 0} />
                <div className="flex-grow p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
                    <div className="lg:col-span-2 min-h-0">
                        <LessonPlayer lesson={activeLesson} gateMessage={gateMessage} />
                    </div>
                    <div className="lg:col-span-1 min-h-0">
                        <CourseCurriculum
                            units={courseData?.units || []}
                            activeLessonId={activeLesson?.id}
                            onLessonClick={handleLessonClick}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}