import React, { useState, useMemo, lazy, Suspense, useEffect, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { File, Clock, CheckCircle, XCircle, Inbox, AlertTriangle, Hourglass, Calendar, CalendarOff, FileText } from "lucide-react";
import Loading from "../../Components/Loading";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

const StarfieldBackground = lazy(() => import('../../Components/StarfieldBackground'));

// Configure Day.js with necessary plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// --- Helper Components ---

const CountdownTimer = ({ targetDate, onComplete }) => {
    const calculateTimeLeft = useCallback(() => {
        const target = dayjs.utc(targetDate);
        const now = dayjs();
        const diff = target.diff(now);
        if (diff <= 0) return null;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        return { d, h, m, s };
    }, [targetDate]);
    
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            if (newTimeLeft) {
                setTimeLeft(newTimeLeft);
            } else {
                clearInterval(timer);
                onComplete();
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [calculateTimeLeft, onComplete]);

    const formatTime = () => {
        if (!timeLeft) return "00:00";
        const parts = [];
        if (timeLeft.d > 0) parts.push(`${timeLeft.d}ي`);
        if (timeLeft.h > 0 || timeLeft.d > 0) parts.push(`${String(timeLeft.h || 0).padStart(2, '0')}`);
        parts.push(`${String(timeLeft.m || 0).padStart(2, '0')}`);
        parts.push(`${String(timeLeft.s || 0).padStart(2, '0')}`);
        return parts.join(':');
    };

    return (
        <div className="bg-black/20 p-4 rounded-lg text-center mb-4"><p className="text-sm text-gray-300 flex items-center justify-center gap-2"><Hourglass size={14} /> يبدأ خلال</p><p className="text-3xl font-black text-yellow-400 font-mono tracking-wider">{formatTime()}</p></div>
    );
};

const StartExamModal = ({ exam, onStart, onClose }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"> <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-effect rounded-2xl w-full max-w-lg text-center p-8 border border-yellow-500/30 shadow-2xl shadow-yellow-500/10"> <AlertTriangle className="w-16 h-16 mx-auto text-yellow-400 mb-4" /> <h2 className="text-2xl font-bold text-white mb-2">تنبيه قبل بدء الامتحان!</h2> <p className="text-gray-300 mb-6">أنت على وشك بدء امتحان '<span className="font-bold text-white">{exam?.title}</span>'.</p> <div className="bg-black/20 rounded-lg p-4 space-y-3 text-sm text-gray-300 mb-6 text-right"> <p>» مدة الامتحان: <span className="font-bold text-white">{exam?.time} دقيقة</span>.</p> <p>» لا يمكنك إيقاف المؤقت أو مغادرة الصفحة بعد البدء.</p> <p className="text-yellow-400 font-bold">» تحذير: مغادرة صفحة الامتحان أو فتح تبويب جديد سيؤدي إلى إنهاء وتسليم الامتحان فورًا.</p> </div> <div className="flex justify-center gap-4"> <button onClick={onClose} className="px-8 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors font-bold">إلغاء</button> <button onClick={onStart} className="px-8 py-2 rounded-lg bg-yellow-400 text-black hover:bg-yellow-300 transition-colors font-bold">تأكيد وبدء</button> </div> </motion.div> </motion.div>
);

const statusMap = {
    new:        { icon: <File size={14}/>,        text: "جديد",           className: "text-yellow-300 bg-yellow-500/20" },
    processing: { icon: <Clock size={14}/>,        text: "قيد المراجعة",    className: "text-blue-300 bg-blue-500/20" },
    graded:     { icon: <CheckCircle size={14}/>, text: "تم التصحيح",      className: "text-green-300 bg-green-500/20" },
    missed:     { icon: <XCircle size={14}/>,     text: "فائت",           className: "text-red-300 bg-red-500/20" },
};

const ExamCard = ({ exam, onStart, currentTime }) => {
    const navigate = useNavigate();
    
    const isReady = useMemo(() => dayjs(currentTime).isAfter(dayjs.utc(exam.startAt)), [currentTime, exam.startAt]);
    const isDeadlinePassed = useMemo(() => dayjs(currentTime).isAfter(dayjs.utc(exam.deadline)), [currentTime, exam.deadline]);
    const diffMinutes = useMemo(() => dayjs.utc(exam.startAt).diff(currentTime, 'minute'), [exam.startAt, currentTime]);
    
    const currentStatus = statusMap[exam.status] || statusMap.new;

    const formatDate = (date) => dayjs.utc(date).tz('Africa/Cairo').format('D MMM YYYY, h:mm A');

    const handleViewReport = () => {
        if(exam.attempId) {
            navigate(`/student/quiz/report/${exam.attempId}`);
        } else {
            toast.error("لا يمكن عرض التقرير حاليًا.");
        }
    };

    return (
        <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`glass-effect rounded-2xl p-6 flex flex-col justify-between transform hover:-translate-y-2 transition-transform duration-300 border ${exam.status === "missed" ? "border-red-500/30" : "border-white/10"}`}>
            <div>
                <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-cyan-300">{exam.course}</p>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 ${currentStatus.className}`}>{currentStatus.icon} {currentStatus.text}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1 mb-2">{exam.title}</h3>
                <div className="space-y-2 text-sm text-gray-400 mb-4 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2"><Calendar size={16} className="text-cyan-400" /><span>يبدأ في:</span><span className="font-bold text-white/90">{formatDate(exam.startAt)}</span></div>
                    <div className="flex items-center gap-2"><CalendarOff size={16} className="text-red-400" /><span>ينتهي في:</span><span className="font-bold text-white/90">{formatDate(exam.deadline)}</span></div>
                </div>
                
                {/* --- UPDATED: تم إرجاع طريقة عرض الدرجة للأصل --- */}
                {exam.status === "graded" && (
                    <div className="bg-black/20 p-4 rounded-lg text-center mb-6">
                        <p className="text-sm text-gray-300">النتيجة</p>
                        <p className="text-3xl font-black text-green-400">{exam.score}</p>
                        <p className="text-xs text-green-400">ترتيبك: #{exam.rank}</p>
                    </div>
                )}
                {exam.status === "missed" && (
                    <div className="bg-black/20 p-4 rounded-lg text-center mb-6">
                        <p className="text-sm text-gray-300">النتيجة</p>
                        <p className="text-3xl font-black text-red-400">0 <span className="text-lg">{exam.totalScore}</span></p>
                    </div>
                )}

                {exam.status === "new" && !isReady && diffMinutes <= 30 && (<CountdownTimer targetDate={exam.startAt} onComplete={() => onStart(exam, true)} />)}
                <div className="border-t border-white/5 pt-4 mt-4 flex justify-around text-center">
                    <div><p className="font-bold text-lg text-white">{exam.questions}</p><p className="text-xs text-gray-400">سؤال</p></div>
                    <div><p className="font-bold text-lg text-white">{exam.time}</p><p className="text-xs text-gray-400">دقيقة</p></div>
                    {(exam.status === 'graded' || exam.status === 'missed') && (<div><p className="font-bold text-lg text-white">{exam.totalScore}</p><p className="text-xs text-gray-400">نقطة</p></div>)}
                </div>
            </div>
            <div className="mt-6">
                {exam.status === "new" && (isReady ? (<button onClick={() => onStart(exam)} className="w-full text-center block p-3 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors">ابدأ الامتحان</button>) : (<button disabled className="w-full text-center block p-3 rounded-lg bg-gray-700 text-gray-400 font-bold cursor-not-allowed">{diffMinutes > 30 ? `لم يبدأ بعد` : 'انتظر...'}</button>))}
                
                {(exam.status === "graded" || exam.status === "missed") && (
                    isDeadlinePassed ? (
                        <button onClick={handleViewReport} className="w-full text-center flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors">
                            <FileText size={16}/> عرض التقرير
                        </button>
                    ) : (
                        <button disabled className="w-full text-center flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-800 text-slate-400 font-bold cursor-not-allowed">
                            <Hourglass size={16}/> التقرير يتاح بعد انتهاء الموعد
                        </button>
                    )
                )}

                {exam.status === "processing" && <button disabled className="w-full text-center block p-3 rounded-lg bg-blue-800/50 text-blue-300 font-bold cursor-not-allowed">جاري التصحيح</button>}
            </div>
        </motion.div>
    );
};

const MyExams = () => {
    const [filter, setFilter] = useState("all");
    const [showStartModal, setShowStartModal] = useState(false);
    const [currentExam, setCurrentExam] = useState(null);
    const navigate = useNavigate();
    const mainContentRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(dayjs());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(dayjs()), 30000);
        return () => clearInterval(timer);
    }, []);

    const { data: exams, isLoading } = useQuery({
        queryKey: ["studentExams"],
        queryFn: async () => {
            try {
                await api.post("/api/Quiz/endExpiredQuizzesForStudent");
                const response = await api.get("/api/Quiz/getQuizForStudent");
                
                const statusKeyMap = ["new", "processing", "graded", "missed"];
                
                return response.data
                    .filter(exam => exam.isQuizEnd === true)
                    .map(exam => ({
                        ...exam,
                        status: statusKeyMap[exam.quizAttemptStatus - 1] || 'new',
                        deadline: exam.deadline,
                        startAt: exam.startAt,
                    })).sort((a, b) => a.quizAttemptStatus - b.quizAttemptStatus || dayjs(b.startAt).valueOf() - dayjs(a.startAt).valueOf());
            } catch (error) {
                if (error.response && error.response.status === 404) return [];
                throw error;
            }
        },
        refetchOnWindowFocus: true,
    });

    const filteredExams = useMemo(() => {
        if (!exams) return [];
        if (filter === "all") return exams;
        return exams.filter(exam => exam.status === filter);
    }, [exams, filter]);

    const handleStartClick = (exam, isAutoStart = false) => {
        setCurrentExam(exam);
        if (isAutoStart) {
            handleConfirmStart(exam.id)
        } else {
            setShowStartModal(true);
        }
    };

    const handleConfirmStart = (examId) => {
        const id = examId || currentExam.id;
        setShowStartModal(false);
        navigate(`/student/exam/${id}`);
    };

    if (isLoading && !exams) return <Loading message="جاري تجهيز غرفة الامتحانات..." />;
    
    const filterButtons = [{ key: "all", label: "الكل" }, { key: "new", label: "جديدة" }, { key: "processing", label: "قيد المراجعة" }, { key: "graded", label: "منجزة" }, { key: "missed", label: "فائتة" }];

    return (
        <div className="text-gray-100 min-h-screen overflow-hidden w-full" style={{ fontFamily: "Cairo, sans-serif" }} dir="rtl">
            <Toaster position="bottom-center" />
            <Suspense fallback={<div className="fixed inset-0 bg-black -z-10" />}><StarfieldBackground mainContentRef={mainContentRef} /></Suspense>
            <AnimatePresence>
                {showStartModal && <StartExamModal exam={currentExam} onStart={() => handleConfirmStart()} onClose={() => setShowStartModal(false)} />}
            </AnimatePresence>
            <main ref={mainContentRef} className="flex-1 max-h-screen p-4 sm:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-black/20">
                <h1 className="text-4xl font-black text-white mb-2 title-glow">غرفة الامتحانات</h1>
                <p className="text-gray-400 text-lg mb-8">استعد لاختبار قدراتك في ساحة التحدي.</p>
                <div className="flex items-center gap-2 sm:gap-4 mb-8 flex-wrap">
                    {filterButtons.map(btn => (<button key={btn.key} onClick={() => setFilter(btn.key)} className={`relative rounded-lg px-4 py-2 text-sm font-bold transition-colors ${filter === btn.key ? "text-white" : "text-gray-400 hover:text-white"}`}>{filter === btn.key && <motion.div layoutId="exam-filter-pill" className="absolute inset-0 bg-cyan-500/20 border border-cyan-500 rounded-lg" />}<span className="relative z-10">{btn.label}</span></button>))}
                </div>
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredExams && filteredExams.length > 0 ? (
                            filteredExams.map(exam => <ExamCard key={exam.id} exam={exam} onStart={handleStartClick} currentTime={currentTime} />)
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-2 xl:col-span-3 text-center py-16">
                                <Inbox size={56} className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                                <h3 className="text-xl font-bold text-white">لا توجد امتحانات في هذا التصنيف</h3>
                                <p className="text-gray-400">استعد جيدًا للمهام القادمة!</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
};

export default MyExams;