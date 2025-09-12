import React, { useState, useMemo, lazy, Suspense, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios"; // تأكد من أن هذا المسار صحيح
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { File, Clock, CheckCircle, XCircle, Inbox, AlertTriangle, Hourglass, Calendar, CalendarOff, FileText } from "lucide-react";
import Loading from "../../Components/Loading"; // تأكد من أن هذا المسار صحيح

const StarfieldBackground = lazy(() => import('../../Components/StarfieldBackground')); // تأكد من أن هذا المسار صحيح

// --- مكونات مساعدة ---

const CountdownTimer = ({ targetDate, onComplete }) => {
    // ... (هذا المكون لم يتغير)
    const calculateTimeLeft = (difference) => { if (difference > 0) { return { days: Math.floor(difference / (1000 * 60 * 60 * 24)), hours: Math.floor((difference / (1000 * 60 * 60)) % 24), minutes: Math.floor((difference / 1000 / 60) % 60), seconds: Math.floor((difference / 1000) % 60), }; } return {}; };
    const initialDifference = +new Date(targetDate) - +new Date();
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(initialDifference));
    useEffect(() => { if (initialDifference <= 0) { onComplete(); return; } const timer = setInterval(() => { const difference = +new Date(targetDate) - +new Date(); if (difference > 0) { setTimeLeft(calculateTimeLeft(difference)); } else { setTimeLeft({}); clearInterval(timer); onComplete(); } }, 1000); return () => clearInterval(timer); }, [targetDate, onComplete, initialDifference]);
    const formatTime = () => { const { days, hours, minutes, seconds } = timeLeft; if (days === undefined) return "00:00"; const parts = []; if (days > 0) parts.push(`${days}ي`); if (hours > 0 || days > 0) parts.push(`${String(hours || 0).padStart(2, '0')}`); parts.push(`${String(minutes || 0).padStart(2, '0')}`); parts.push(`${String(seconds || 0).padStart(2, '0')}`); return parts.join(':'); };
    return ( <div className="bg-black/20 p-4 rounded-lg text-center mb-4"><p className="text-sm text-gray-300 flex items-center justify-center gap-2"><Hourglass size={14} /> يبدأ خلال</p><p className="text-3xl font-black text-yellow-400 font-mono tracking-wider">{formatTime()}</p></div> );
};

const StartExamModal = ({ exam, onStart, onClose }) => (
    // ... (هذا المكون لم يتغير)
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"> <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-effect rounded-2xl w-full max-w-lg text-center p-8 border border-yellow-500/30 shadow-2xl shadow-yellow-500/10"> <AlertTriangle className="w-16 h-16 mx-auto text-yellow-400 mb-4" /> <h2 className="text-2xl font-bold text-white mb-2">تنبيه قبل بدء الامتحان!</h2> <p className="text-gray-300 mb-6">أنت على وشك بدء امتحان '<span className="font-bold text-white">{exam?.title}</span>'.</p> <div className="bg-black/20 rounded-lg p-4 space-y-3 text-sm text-gray-300 mb-6 text-right"> <p>» مدة الامتحان: <span className="font-bold text-white">{exam?.time} دقيقة</span>.</p> <p>» لا يمكنك إيقاف المؤقت أو مغادرة الصفحة بعد البدء.</p> <p className="text-yellow-400 font-bold">» تحذير: مغادرة صفحة الامتحان أو فتح تبويب جديد سيؤدي إلى إنهاء وتسليم الامتحان فورًا.</p> </div> <div className="flex justify-center gap-4"> <button onClick={onClose} className="px-8 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors font-bold">إلغاء</button> <button onClick={onStart} className="px-8 py-2 rounded-lg bg-yellow-400 text-black hover:bg-yellow-300 transition-colors font-bold">تأكيد وبدء</button> </div> </motion.div> </motion.div>
);

const statusMap = {
    new:        { icon: <File size={14}/>,        text: "جديد",        className: "text-yellow-300 bg-yellow-500/20" },
    processing: { icon: <Clock size={14}/>,       text: "قيد المراجعة", className: "text-blue-300 bg-blue-500/20" },
    graded:     { icon: <CheckCircle size={14}/>, text: "تم التصحيح",  className: "text-green-300 bg-green-500/20" },
    missed:     { icon: <XCircle size={14}/>,      text: "فائت",        className: "text-red-300 bg-red-500/20" },
};

const ExamCard = ({ exam, onStart }) => {
    const navigate = useNavigate();
    const now = useMemo(() => new Date(), []);
    const startTime = useMemo(() => new Date(exam.startAt), [exam.startAt]);
    const [isReady, setIsReady] = useState(() => now >= startTime);
    const diffMinutes = useMemo(() => (startTime - now) / (1000 * 60), [startTime, now]);

    const currentStatus = statusMap[exam.status] || statusMap.new;

    const formatDate = (date) => new Date(date).toLocaleString("ar-EG", {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Cairo'
    });

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
                    <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 ${currentStatus.className}`}>
                        {currentStatus.icon} {currentStatus.text}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1 mb-2">{exam.title}</h3>
                <div className="space-y-2 text-sm text-gray-400 mb-4 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2"><Calendar size={16} className="text-cyan-400" /><span>يبدأ في:</span><span className="font-bold text-white/90">{formatDate(exam.startAt)}</span></div>
                    <div className="flex items-center gap-2"><CalendarOff size={16} className="text-red-400" /><span>ينتهي في:</span><span className="font-bold text-white/90">{formatDate(exam.deadline)}</span></div>
                </div>
                {exam.status === "graded" && (<div className="bg-black/20 p-4 rounded-lg text-center mb-6"><p className="text-sm text-gray-300">النتيجة</p><p className="text-3xl font-black text-green-400">{exam.score} </p><p className="text-xs text-green-400">ترتيبك: #{exam.rank}</p></div>)}
                {exam.status === "missed" && (<div className="bg-black/20 p-4 rounded-lg text-center mb-6"><p className="text-sm text-gray-300">النتيجة</p><p className="text-3xl font-black text-red-400">0 <span className="text-lg">{exam.totalScore}</span></p></div>)}
                {exam.status === "new" && !isReady && diffMinutes <= 30 && (<CountdownTimer targetDate={exam.startAt} onComplete={() => setIsReady(true)} />)}
                <div className="border-t border-white/5 pt-4 mt-4 flex justify-around text-center">
                    <div><p className="font-bold text-lg text-white">{exam.questions}</p><p className="text-xs text-gray-400">سؤال</p></div>
                    <div><p className="font-bold text-lg text-white">{exam.time}</p><p className="text-xs text-gray-400">دقيقة</p></div>
                    {(exam.status === 'graded' || exam.status === 'missed') && (<div><p className="font-bold text-lg text-white">{exam.totalScore}</p><p className="text-xs text-gray-400">نقطة</p></div>)}
                </div>
            </div>
            <div className="mt-6">
                {exam.status === "new" && (isReady ? (<button onClick={onStart} className="w-full text-center block p-3 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors">ابدأ الامتحان</button>) : (<button disabled className="w-full text-center block p-3 rounded-lg bg-gray-700 text-gray-400 font-bold cursor-not-allowed">{diffMinutes > 30 ? `لم يبدأ بعد` : 'انتظر...'}</button>))}
                {exam.status === "graded" && <button onClick={handleViewReport} className="w-full text-center flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors"><FileText size={16}/> عرض التقرير</button>}
                {exam.status === "missed" && <button onClick={() => toast.error("لقد فاتك موعد هذا الامتحان.")} className="w-full text-center block p-3 rounded-lg bg-red-800/50 text-red-300 font-bold hover:bg-red-800/80 transition-colors">فات الموعد</button>}
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

    const { data: exams, isLoading } = useQuery({
        queryKey: ["studentExams"],
        queryFn: async () => {
            try {
                await api.post("/api/Quiz/endExpiredQuizzesForStudent");
                const response = await api.get("/api/Quiz/getQuizForStudent");
                
                const statusKeyMap = ["new", "processing", "graded", "missed"];
                
                return response.data
                    // ---!!! هذا هو السطر الذي تم تعديله ---
                    .filter(exam => exam.isQuizEnd === true) // فلترة لعرض الامتحانات المُنتهية من قبل المدرس فقط
                    .map(exam => {
                        const deadlineUTC = exam.deadline.endsWith('Z') ? exam.deadline : exam.deadline + 'Z';
                        const startAtUTC = exam.startAt.endsWith('Z') ? exam.startAt : exam.startAt + 'Z';
                        
                        return {
                            id: exam.id,
                            attempId: exam.attempId,
                            course: exam.courseName,
                            title: exam.title,
                            statusNum: exam.quizAttemptStatus,
                            status: statusKeyMap[exam.quizAttemptStatus - 1] || 'new',
                            questions: exam.questions,
                            time: exam.time,
                            score: exam.score,

                            deadline: new Date(deadlineUTC),
                            startAt: new Date(startAtUTC),
                            rank: exam.rank,
                        };
                    }).sort((a, b) => a.statusNum - b.statusNum || new Date(b.startAt) - new Date(a.startAt));
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

    const handleStartClick = (exam) => {
        setCurrentExam(exam);
        setShowStartModal(true);
    };

    const handleConfirmStart = () => {
        setShowStartModal(false);
        navigate(`/student/exam/${currentExam.id}`);
    };

    if (isLoading && !exams) return <Loading message="جاري تجهيز غرفة الامتحانات..." />;
    
    const filterButtons = [{ key: "all", label: "الكل" }, { key: "new", label: "جديدة" }, { key: "processing", label: "قيد المراجعة" }, { key: "graded", label: "منجزة" }, { key: "missed", label: "فائتة" }];

    return (
        <div className="text-gray-100 min-h-screen overflow-hidden w-full" style={{ fontFamily: "Cairo, sans-serif" }} dir="rtl">
            <Suspense fallback={<div className="fixed inset-0 bg-black -z-10" />}><StarfieldBackground mainContentRef={mainContentRef} /></Suspense>
            <AnimatePresence>
                {showStartModal && <StartExamModal exam={currentExam} onStart={handleConfirmStart} onClose={() => setShowStartModal(false)} />}
            </AnimatePresence>
            <main ref={mainContentRef} className="flex-1 max-h-screen p-4 sm:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-black/20">
                <h1 className="text-4xl font-black text-white mb-2 title-glow">غرفة الامتحانات</h1>
                <p className="text-gray-400 text-lg mb-8">استعد لاختبار قدراتك في ساحة التحدي.</p>
                <div className="flex items-center gap-2 sm:gap-4 mb-8 flex-wrap">
                    {filterButtons.map(btn => (<button key={btn.key} onClick={() => setFilter(btn.key)} className={`relative rounded-lg px-4 py-2 text-sm font-bold transition-colors ${filter === btn.key ? "text-white" : "text-gray-400 hover:text-white"}`}>{filter === btn.key && <motion.div layoutId="exam-filter-pill" className="absolute inset-0 bg-cyan-500/20 border border-cyan-500 rounded-lg" />}<span className="relative z-10">{btn.label}</span></button>))}
                </div>
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredExams && filteredExams.length > 0 ? (filteredExams.map(exam => <ExamCard key={exam.id} exam={exam} onStart={() => handleStartClick(exam)} />)) : (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-2 xl:col-span-3 text-center py-16"><Inbox size={56} className="w-16 h-16 mx-auto text-gray-600 mb-4" /><h3 className="text-xl font-bold text-white">لا توجد امتحانات في هذا التصنيف</h3><p className="text-gray-400">استعد جيدًا للمهام القادمة!</p></motion.div>)}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
};

export default MyExams;