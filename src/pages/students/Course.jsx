// src/pages/students/CoursePlayerPage.jsx

import React, { useState, useEffect, useMemo, lazy, Suspense, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// <-- الخطوة 1: تحديث سطر الاستيراد
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { Cookies } from "react-cookie";
import axios from "../../api/axios";
import Loading from "../../Components/Loading";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { ChevronDown, LayoutList, PlayCircle, FileText, CheckCircle, Lock, XCircle, Trophy, BookCopy, Download, Clock } from "lucide-react";

const StarfieldBackground = lazy(() => import('../../Components/StarfieldBackground'));

/* =============================
   Hook Player (مستقر وعالي الأداء)
   ============================= */
// ... (كود الـ useAdvancedPlayer يبقى كما هو بدون تغيير)
const useAdvancedPlayer = (activeLesson, playerUrl, token, onProgressUpdate, expectedStartSec) => {
    const playerRef = useRef(null);
    const playerInstanceRef = useRef(null);
    const durationRef = useRef(0);
    const maxPosRef = useRef(0);
    const sentOpenedRef = useRef(false);
    const onProgressUpdateRef = useRef(onProgressUpdate);
    useEffect(() => { onProgressUpdateRef.current = onProgressUpdate; }, [onProgressUpdate]);
    const SEEK_TOLERANCE = 0.75;
    useEffect(() => {
        const scriptId = "player-js-script";
        if (document.getElementById(scriptId)) return;
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js";
        script.async = true;
        document.head.appendChild(script);
    }, []);
    const buildPayload = useCallback((event, sec) => {
        const dur = durationRef.current || 0;
        const pct = dur > 0 ? +((sec / dur) * 100).toFixed(2) : 0;
        return {
            durationSeconds: Math.round(dur),
            positionSeconds: Math.round(sec || 0),
            maxPositionSeconds: Math.round(Math.max(maxPosRef.current || 0, sec || 0)),
            percent: pct,
            event,
        };
    }, []);
    const sendProgress = useCallback(async (event, sec, opts = {}) => {
        if (!activeLesson) return;
        try {
            const payload = buildPayload(event, sec);
            if (onProgressUpdateRef.current) { onProgressUpdateRef.current(activeLesson.id, payload.percent); }
            if (opts.beacon && navigator.sendBeacon) {
                const url = `${axios.defaults.baseURL}/api/lesson/${activeLesson.id}/progress`;
                const blob = new Blob([JSON.stringify({ ...payload, token })], { type: 'application/json' });
                navigator.sendBeacon(url, blob);
                return;
            }
            await axios.post(`/api/lesson/${activeLesson.id}/progress`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch { /* Ignore */ }
    }, [activeLesson, token, buildPayload]);
    useEffect(() => {
        if (!activeLesson || !playerUrl || !playerRef.current || !window.playerjs) return;
        if (playerInstanceRef.current) { try { playerInstanceRef.current.destroy(); } catch { } playerInstanceRef.current = null; }

        const player = new window.playerjs.Player(playerRef.current);
        playerInstanceRef.current = player;
        durationRef.current = 0;
        maxPosRef.current = expectedStartSec || 0;
        sentOpenedRef.current = false;
        
        player.on('ready', () => {
            player.getDuration((d) => { durationRef.current = d || 0; });
            const resumeAt = Math.max(0, Math.floor(expectedStartSec || 0));
            if (resumeAt > 0) { try { player.setCurrentTime(resumeAt); player.play(); } catch { } }
            else { try { player.play(); } catch {} }
        });
        player.on('timeupdate', (d) => {
            const t = d?.seconds || 0;
            maxPosRef.current = Math.max(maxPosRef.current, t);
            if (!sentOpenedRef.current) {
                const resumeAt = +expectedStartSec || 0;
                const reachedResume = resumeAt <= SEEK_TOLERANCE || t >= (resumeAt - SEEK_TOLERANCE);
                if (reachedResume) {
                    sendProgress('opened', t);
                    sentOpenedRef.current = true;
                }
            }
            sendProgress('timeupdate', t);
        });
        const cleanup = () => {
            window.removeEventListener('beforeunload', beaconHandler, { capture: true });
            document.removeEventListener('visibilitychange', visHandler);
            if (playerInstanceRef.current) {
                try { playerInstanceRef.current.getCurrentTime((t) => { if ((t || 0) > 0) sendProgress('pause', t || 0); }); } catch { }
                try { playerInstanceRef.current.destroy(); } catch { }
                playerInstanceRef.current = null;
            }
        };
        const beaconHandler = () => { if (playerInstanceRef.current) { playerInstanceRef.current.getCurrentTime((t) => sendProgress('pause', t || 0, { beacon: true })); } };
        window.addEventListener('beforeunload', beaconHandler, { capture: true });
        const visHandler = () => { if (document.visibilityState === 'hidden') beaconHandler(); };
        document.addEventListener('visibilitychange', visHandler);
        return cleanup;
    }, [activeLesson, playerUrl, expectedStartSec, sendProgress]);
    return { playerRef };
};


/* =============================
   UI Components (Optimized with React.memo)
   ============================= */
// ... (كل المكونات الأخرى تبقى كما هي بدون تغيير)
const formatDuration = (totalSeconds) => {
    if (isNaN(totalSeconds) || totalSeconds <= 0) return null;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const CourseHeader = ({ title, progress }) => {
    const radius = 30; const stroke = 4;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;
    return (
        <div className="flex-shrink-0 bg-slate-900/50 backdrop-blur-lg p-4 flex items-center justify-between border-b border-slate-700">
            <h2 className="text-xl font-bold text-white truncate pr-4">{title}</h2>
            <div className="flex items-center gap-3 text-sm flex-shrink-0">
                <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r={radius} stroke="rgb(51 65 85)" strokeWidth={stroke} fill="none" />
                        <motion.circle
                            cx="40" cy="40" r={radius} stroke="url(#gradient)" strokeWidth={stroke} fill="none"
                            strokeDasharray={circumference} strokeLinecap="round"
                            initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                        <defs>
                            <linearGradient id="gradient">
                                <stop offset="0%" stopColor="#67e8f9" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-cyan-400" />
                    </div>
                </div>
                <span className="font-bold text-gray-200">تقدمك ({Math.floor(progress)}%)</span>
            </div>
        </div>
    );
};

const LessonPlayer = ({ lesson, playerRef, playerUrl, gateMessage }) => {
    const [activeTab, setActiveTab] = useState('details');
    useEffect(() => { setActiveTab('details'); }, [lesson?.id]);

    const TabButton = ({ id, label, count }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                activeTab === id ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-slate-700/50'
            }`}
        >
            {label} {count !== undefined && <span className="text-xs bg-slate-700 text-gray-300 rounded-full px-2 py-0.5 ml-1">{count}</span>}
        </button>
    );

    if (!lesson) {
        return (
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl w-full h-full flex flex-col items-center justify-center text-center p-8">
                <BookCopy size={48} className="text-cyan-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">أهلاً بك في الكورس</h3>
                <p className="text-gray-400">اختر درسًا من القائمة الجانبية لبدء التعلم.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl w-full h-full flex flex-col">
            <div className="aspect-video bg-black rounded-t-2xl border-b border-slate-800 overflow-hidden">
                {gateMessage ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                        {gateMessage.startsWith('🔒') ? ( <Lock size={48} className="text-yellow-400 mb-4" />) : (<Loading />)}
                        <p className={gateMessage.startsWith('🔒') ? 'text-yellow-300' : 'text-gray-400'}>{gateMessage}</p>
                    </div>
                ) : playerUrl ? (
                    <iframe ref={playerRef} key={lesson.id} className="w-full h-full" src={playerUrl} title={lesson.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
                ) : (
                    <div className="w-full h-full flex items-center justify-center"><Loading message="...جاري التحضير"/></div>
                )}
            </div>
            <div className="p-4 border-b border-slate-800">
                <h2 className="text-2xl font-bold text-white">{lesson.title}</h2>
            </div>
            <div className="p-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <TabButton id="details" label="تفاصيل الدرس" />
                    <TabButton id="attachments" label="الملحقات" count={lesson.attachments?.length || 0} />
                </div>
            </div>
            <div className="flex-grow p-4 pt-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50">
                {activeTab === 'details' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                            {lesson.summary || lesson.content || "لا يوجد وصف لهذا الدرس."}
                        </p>
                    </motion.div>
                )}
                {activeTab === 'attachments' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {(!lesson.attachments || lesson.attachments.length === 0) ? (
                            <div className="flex flex-col items-center justify-center text-center text-gray-500 pt-8">
                                <FileText size={40} className="mb-2"/>
                                <p>لا توجد مرفقات لهذا الدرس.</p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {lesson.attachments.map(file => (
                                    <li key={file.id}>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors duration-200">
                                            <FileText size={20} className="text-cyan-400 flex-shrink-0" />
                                            <span className="text-gray-200 font-medium">{file.name}</span>
                                            <Download size={18} className="text-gray-400 ml-auto" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const LessonItem = React.memo(({ lesson, onLessonClick, isActive, progress }) => {
    const isCompleted = progress >= 95;
    const formattedDuration = formatDuration(lesson.duration);
    return (
        <button
            onClick={() => onLessonClick(lesson)}
            className={`w-full text-right flex items-center gap-3 p-3 rounded-md transition-all duration-200 border-r-4 ${
                isActive ? 'bg-cyan-500/10 border-cyan-400' : isCompleted ? 'border-green-500/20' : 'border-transparent'
            } hover:bg-slate-700/50`}
        >
            {isCompleted ? <CheckCircle size={20} className="text-green-500 flex-shrink-0" /> : <PlayCircle size={20} className={`flex-shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />}
            <span className={`flex-grow ${isActive ? 'text-white font-semibold' : 'text-slate-300'} ${isCompleted ? 'line-through text-slate-400' : ''}`}>{lesson.title}</span>
            {formattedDuration && (
                <div className="flex items-center gap-1 text-xs text-slate-400 font-mono ml-3 flex-shrink-0">
                    <Clock size={12} /> <span>{formattedDuration}</span>
                </div>
            )}
            <div className="w-12 text-left flex-shrink-0 text-xs text-slate-400 font-mono">{Math.floor(progress)}%</div>
        </button>
    );
});

const UnitItem = React.memo(({ unit, index, onLessonClick, activeLesson, lessonProgressMap, isOpen, onToggle }) => {
    const { totalLessons, completedLessons, isUnitCompleted } = useMemo(() => {
        const totalLessons = unit.lessons.length;
        if (totalLessons === 0) return { totalLessons: 0, completedLessons: 0, isUnitCompleted: false };
        const completedLessons = unit.lessons.filter(l => (lessonProgressMap[l.id] ?? l.progress?.percent ?? 0) >= 95).length;
        const isUnitCompleted = completedLessons === totalLessons;
        return { totalLessons, completedLessons, isUnitCompleted };
    }, [unit.lessons, lessonProgressMap]);

    return (
        <div className={`bg-slate-800/50 rounded-lg mb-3 transition-all duration-300 ${isUnitCompleted ? 'shadow-lg shadow-green-500/10' : ''}`}>
            <button onClick={onToggle} className="w-full text-right p-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start gap-1">
                        <span className={`font-bold text-sm ${isUnitCompleted ? 'text-green-400' : 'text-cyan-400'}`}>الباب {index + 1}</span>
                        <span className="text-white font-semibold text-lg">{unit.title}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400 font-mono text-sm flex-shrink-0">{completedLessons}/{totalLessons} مكتمل</span>
                      <ChevronDown className={`transform transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''} text-cyan-400`} size={24} />
                    </div>
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden border-t border-slate-700/50">
                        <div className="p-2 space-y-1">
                            {unit.lessons.map(lesson => ( <LessonItem key={lesson.id} lesson={lesson} onLessonClick={onLessonClick} isActive={activeLesson?.id === lesson.id} progress={lessonProgressMap[lesson.id] ?? lesson.progress?.percent ?? 0} /> ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

const CourseCurriculum = ({ units, activeLesson, onLessonClick, lessonProgressMap }) => {
    const findUnitIdForLesson = useCallback((lessonId) => {
        if (!units || !lessonId) return units?.[0]?.id ?? null;
        for (const unit of units) { if (unit.lessons.some(l => l.id === lessonId)) return unit.id; }
        return units?.[0]?.id ?? null;
    }, [units]);

    const [openUnitId, setOpenUnitId] = useState(() => findUnitIdForLesson(activeLesson?.id));
    useEffect(() => { if (activeLesson) setOpenUnitId(findUnitIdForLesson(activeLesson.id)); }, [activeLesson, findUnitIdForLesson]);

    return (
        <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl h-full flex flex-col">
            <h3 className="text-xl font-bold text-white p-4 flex-shrink-0 flex items-center gap-3 border-b border-slate-800">
                <LayoutList size={22} /> <span>محتويات الكورس</span>
            </h3>
            <div className="flex-grow overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50">
                {units?.map((unit, index) => ( <UnitItem key={unit.id} unit={unit} index={index} onLessonClick={onLessonClick} activeLesson={activeLesson} lessonProgressMap={lessonProgressMap} isOpen={openUnitId === unit.id} onToggle={() => setOpenUnitId(openUnitId === unit.id ? null : unit.id)} /> ))}
            </div>
        </div>
    );
};


/* =============================
   الصفحة الرئيسية (مع منطق محسّن)
   ============================= */
export default function CoursePlayerPage() {
    const { courseId, lessonId: initialLessonId } = useParams();
    const cookies = new Cookies();
    const token = cookies.get("token");
    const queryClient = useQueryClient();
    // <-- الخطوة 2: تهيئة الـ hooks
    const location = useLocation();
    const navigate = useNavigate();
    
    const [activeLesson, setActiveLesson] = useState(null);
    const [gateMessage, setGateMessage] = useState("");
    const [playerUrl, setPlayerUrl] = useState("");
    const [lessonProgressMap, setLessonProgressMap] = useState({});
    const [expectedStartSec, setExpectedStartSec] = useState(0);
    const mainContentRef = useRef(null);
    const isInitialLoad = useRef(true);

    // <-- الخطوة 3: إضافة الـ hook لتنظيف الرابط
    useEffect(() => {
        // التحقق من وجود أي query parameters في الرابط (مثل ?paymentStatus=SUCCESS)
        if (location.search) {
            // استبدال الرابط الحالي بالمسار فقط، مما يزيل كل الـ query parameters
            // { replace: true } تضمن عدم إضافة الرابط القديم إلى سجل المتصفح
            navigate(location.pathname, { replace: true });
        }
    }, [location.pathname, location.search, navigate]); // تعتمد على هذه القيم لتشغيل الـ hook عند التغيير


    const { data: courseData, isLoading, isError } = useQuery({
        queryKey: ["coursePlayerData", courseId],
        queryFn: async () => {
            const { data } = await axios.get(`/api/StudentCourse/${courseId}/full`, { headers: { Authorization: `Bearer ${token}` } });
            return data;
        },
        onSuccess: (data) => {
            if (isInitialLoad.current && data?.units) {
                const initialProgress = {};
                data.units.forEach(unit => unit.lessons.forEach(lesson => {
                    initialProgress[lesson.id] = Math.floor(lesson.progress?.percent || 0);
                }));
                setLessonProgressMap(initialProgress);
                isInitialLoad.current = false;
            }
            if (!activeLesson && data?.units?.length > 0) {
                const allLessons = data.units.flatMap(u => u.lessons);
                const lessonToPlay = allLessons.find(l => l.id === parseInt(initialLessonId)) || allLessons.find(l => (l.progress?.percent || 0) < 95) || allLessons[0];
                if (lessonToPlay) handleLessonClick(lessonToPlay, true);
            }
        },
        refetchOnWindowFocus: false,
    });

    const handleProgressUpdate = useCallback((lessonId, newPercent) => {
        const rounded = Math.floor(newPercent);
        setLessonProgressMap(prev => {
            const cur = prev[lessonId] ?? 0;
            if (rounded > cur) return { ...prev, [lessonId]: rounded };
            return prev;
        });
    }, []);
    
    const { playerRef } = useAdvancedPlayer(activeLesson, playerUrl, token, handleProgressUpdate, expectedStartSec);

    const overallCourseProgress = useMemo(() => {
        if (!courseData?.units) return 0;
        const lessons = courseData.units.flatMap(u => u.lessons);
        if (lessons.length === 0) return 0;
        const totalPercent = lessons.reduce((sum, lesson) => {
            const p = lessonProgressMap[lesson.id] ?? lesson.progress?.percent ?? 0;
            return sum + p;
        }, 0);
        return totalPercent / lessons.length;
    }, [courseData, lessonProgressMap]);
    
    const handleLessonClick = useCallback(async (lesson, isInitial = false) => {
        if (!lesson || (!isInitial && lesson.id === activeLesson?.id)) return;
        
        setActiveLesson(lesson);
        setPlayerUrl("");
        setGateMessage("...جاري التحقق");
        setExpectedStartSec(0);

        try {
            const { data: gate } = await axios.get(`/api/Lesson/${lesson.id}/gate`, { headers: { Authorization: `Bearer ${token}` } });
            if (gate.locked) {
                setGateMessage(`🔒 مقفول: يجب إكمال ${gate.requiredPercent}% من الدرس السابق${gate.currentPercent != null ? ` (أنت ${gate.currentPercent}%)` : ''}.`);
                return;
            }

            let startTime = 0;
            try {
                const { data: progressData } = await axios.get(`/api/lesson/${lesson.id}/progress/me`, { headers: { Authorization: `Bearer ${token}` } });
                const maxPos = progressData?.maxPositionSeconds ?? progressData?.lastPositionSeconds ?? 0;
                const percent = progressData?.percent ?? 0;
                startTime = percent >= 98 ? 0 : Math.max(0, Math.floor(maxPos));
            } catch { /* Start from 0 if no progress found */ }

            setExpectedStartSec(startTime);
            setGateMessage("");
            setPlayerUrl(`https://iframe.mediadelivery.net/embed/475904/${lesson.vimeoId}?autoplay=true&responsive=true&preload=true&startTime=${startTime}`);

            if (!isInitial) {
                queryClient.invalidateQueries({ queryKey: ["coursePlayerData", courseId] });
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء تحميل الدرس.");
            setGateMessage("لا يمكن تحميل الدرس حاليًا.");
        }
    }, [activeLesson, token, queryClient, courseId]);

    if (isLoading) return <Loading message="جاري تحميل الكورس..." />;

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center">
                <XCircle size={64} className="text-red-500 mb-4" />
                <h2 className="text-3xl font-bold mb-2">حدث خطأ</h2>
                <p className="text-gray-400 mb-6">لم نتمكن من تحميل بيانات الكورس.</p>
                <Link to="/student/my-courses" className="px-6 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors">
                    العودة إلى كورساتي
                </Link>
            </div>
        );
    }
    
    return (
        <div className="bg-black text-gray-100 min-h-screen" style={{ fontFamily: "Cairo, sans-serif" }}>
            <Helmet><title>{courseData?.course?.title || "مشغّل الكورس"}</title></Helmet>
            <Suspense fallback={<div className="fixed inset-0 bg-black -z-10" />}>
                <StarfieldBackground mainContentRef={mainContentRef} />
            </Suspense>
            <div ref={mainContentRef} className="flex flex-col h-screen overflow-y-auto">
                <div className="sticky top-0 z-20">
                    <CourseHeader title={courseData?.course?.title} progress={overallCourseProgress} />
                </div>
                <div className="flex-grow p-4 sm:p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-0">
                    <div className="xl:col-span-2 min-h-0">
                        <LessonPlayer lesson={activeLesson} playerUrl={playerUrl} gateMessage={gateMessage} playerRef={playerRef} />
                    </div>
                    <div className="xl:col-span-1 min-h-0">
                        <CourseCurriculum units={courseData?.units || []} activeLesson={activeLesson} onLessonClick={handleLessonClick} lessonProgressMap={lessonProgressMap} />
                    </div>
                </div>
            </div>
        </div>
    );
}