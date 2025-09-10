import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { File, Clock, CheckCircle, XCircle, Inbox, Award, AlertTriangle, ArrowLeft, ArrowRight } from "lucide-react";
import Loading from "../../Components/Loading";

const StarfieldBackground = lazy(() => import('../../Components/StarfieldBackground'));

// ... (All Helper Components like StartExamModal, ExamInterface, ExamCard remain unchanged)
const StartExamModal = ({ exam, onStart, onClose }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-effect rounded-2xl w-full max-w-lg text-center p-8 border border-yellow-500/30 shadow-2xl shadow-yellow-500/10">
            <AlertTriangle className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">تنبيه قبل بدء الامتحان!</h2>
            <p className="text-gray-300 mb-6">أنت على وشك بدء امتحان '<span className="font-bold text-white">{exam?.title}</span>'.</p>
            <div className="bg-black/20 rounded-lg p-4 space-y-3 text-sm text-gray-300 mb-6 text-right">
                <p>» مدة الامتحان: <span className="font-bold text-white">{exam?.time} دقيقة</span>.</p>
                <p>» لا يمكنك إيقاف المؤقت أو مغادرة الصفحة بعد البدء.</p>
                <p>» سيتم تسليم إجاباتك تلقائيًا عند انتهاء الوقت.</p>
            </div>
            <div className="flex justify-center gap-4">
                <button onClick={onClose} className="px-8 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors font-bold">إلغاء</button>
                <button onClick={onStart} className="px-8 py-2 rounded-lg bg-yellow-400 text-black hover:bg-yellow-300 transition-colors font-bold">ابدأ الآن</button>
            </div>
        </motion.div>
    </motion.div>
);

const ExamInterface = ({ exam, questions, onFinish }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(exam.time * 60);
    const timerRef = useRef(null);
    useEffect(() => {
        if (timeLeft <= 0) {
            clearInterval(timerRef.current);
            onFinish(answers);
        }
        timerRef.current = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 0), 1000);
        return () => clearInterval(timerRef.current);
    }, [timeLeft, onFinish, answers]);
    const handleAnswerSelect = (questionId, option) => {
        setAnswers(prev => {
            const existing = prev.find(ans => ans.questionId === questionId);
            if (existing) {
                return prev.map(ans => ans.questionId === questionId ? { questionId, selectedOptionId: option.id, writtenText: option.text } : ans);
            }
            return [...prev, { questionId, selectedOptionId: option.id, writtenText: option.text }];
        });
    };
    const selectedAnswerId = answers.find(a => a.questionId === questions[currentQuestionIndex]?.id)?.selectedOptionId;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900 z-40 flex flex-col">
            <header className="p-4 flex-shrink-0 glass-effect flex justify-between items-center border-b border-white/10">
                <div><p className="text-sm text-cyan-300">{exam?.course}</p><h2 className="text-xl font-bold text-white">{exam?.title}</h2></div>
                <div className={`text-center p-2 rounded-lg transition-colors ${timeLeft < 60 ? 'bg-red-500/20 text-red-400' : ''}`}><p className="text-sm">الوقت المتبقي</p><p className="text-2xl font-bold font-mono">{`${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`}</p></div>
            </header>
            <div className="flex-grow p-4 sm:p-8 flex flex-col items-center justify-center overflow-y-auto">
                <div className="w-full max-w-4xl">
                    <AnimatePresence mode="wait">
                        <motion.div key={currentQuestionIndex} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                            <div className="flex justify-between items-center mb-4"><p className="font-bold">السؤال {currentQuestionIndex + 1} من {questions.length}</p><div className="w-1/2 h-2 bg-gray-700 rounded-full"><div className="h-2 bg-cyan-400 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div></div></div>
                            <div className="glass-effect p-8 rounded-lg"><p className="text-xl font-bold leading-relaxed mb-8">{questions[currentQuestionIndex].text}</p>
                                {questions[currentQuestionIndex].imageUrl && <img src={questions[currentQuestionIndex].imageUrl} alt="question" className="mb-6 rounded-lg max-w-full mx-auto" />}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {questions[currentQuestionIndex].options.map(opt => (<button key={opt.id} onClick={() => handleAnswerSelect(questions[currentQuestionIndex].id, opt)} className={`p-4 rounded-lg border text-right transition-colors ${selectedAnswerId === opt.id ? "bg-cyan-500/20 border-cyan-500" : "border-gray-600 hover:bg-cyan-500/10 hover:border-cyan-500/40"}`}>{opt.text}</button>))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            <footer className="p-4 flex-shrink-0 glass-effect flex justify-between items-center border-t border-white/10">
                <button onClick={() => onFinish(answers)} className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors font-bold">إنهاء وتسليم</button>
                <div className="flex gap-4">
                    <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className="p-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors font-bold disabled:opacity-50"><ArrowRight size={20}/></button>
                    <button disabled={currentQuestionIndex === questions.length - 1} onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="p-3 rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 transition-colors font-bold disabled:opacity-50"><ArrowLeft size={20}/></button>
                </div>
            </footer>
        </motion.div>
    );
};

const ExamCard = ({ exam, onStart }) => (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`glass-effect rounded-2xl p-6 flex flex-col justify-between transform hover:-translate-y-2 transition-transform duration-300 border ${exam.status === "missed" ? "border-red-500/30" : "border-white/10"}`}>
        <div>
            <div className="flex justify-between items-start">
                <p className="text-sm font-bold text-cyan-300">{exam.course}</p>
                <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 ${exam.status === "NotStarted" ? "text-yellow-300 bg-yellow-500/20" : exam.status === "Completed" ? "text-green-300 bg-green-500/20" : exam.status === "missed" ? "text-red-300 bg-red-500/20" : "text-blue-300 bg-blue-500/20"}`}>
                    {{ "NotStarted": <File size={14}/>, "Completed": <CheckCircle size={14}/>, "missed": <XCircle size={14}/>, "processing": <Clock size={14}/> }[exam.status]}
                    {{ "NotStarted": "جديد", "Completed": "تم التقييم", "missed": "فائت", "processing": "قيد المعالجة" }[exam.status]}
                </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1 mb-4">{exam.title}</h3>
            {exam.status === "graded" && (<div className="bg-black/20 p-4 rounded-lg text-center mb-6"><p className="text-sm text-gray-300">النتيجة</p><p className="text-3xl font-black text-green-400">{exam.score} <span className="text-lg">/ {exam.points}</span></p><p className="text-xs text-green-400">ترتيبك: #{exam.rank}</p></div>)}
            <div className="border-t border-b border-white/5 py-4 my-4 flex justify-around text-center">
                <div><p className="font-bold text-lg text-white">{exam.questions}</p><p className="text-xs text-gray-400">سؤال</p></div>
                <div><p className="font-bold text-lg text-white">{exam.time}</p><p className="text-xs text-gray-400">دقيقة</p></div>
                <div><p className="font-bold text-lg text-white">{exam.points}</p><p className="text-xs text-gray-400">نقطة</p></div>
            </div>
        </div>
        {exam.status === "NotStarted" && <button onClick={onStart} className="w-full text-center block p-3 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors">ابدأ الامتحان</button>}
        {exam.status === "Completed" && <button className="w-full text-center block p-3 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors">عرض التقرير</button>}
        {exam.status === "missed" && <button className="w-full text-center block p-3 rounded-lg bg-red-800/50 text-red-300 font-bold cursor-not-allowed">فات الموعد</button>}
        {exam.status === "processing" && <button className="w-full text-center block p-3 rounded-lg bg-blue-800/50 text-blue-300 font-bold cursor-not-allowed">جاري التصحيح</button>}
    </motion.div>
);

const MyExams = () => {
    const [filter, setFilter] = useState("NotStarted");
    const [showStartModal, setShowStartModal] = useState(false);
    const [showExamInterface, setShowExamInterface] = useState(false);
    const [currentExam, setCurrentExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [attemptId, setAttemptId] = useState(null);
    const mainContentRef = useRef(null);

    // --- CORRECTED DATA FETCHING ---
    const { data: exams, isLoading, refetch } = useQuery({
        queryKey: ["studentExams"],
        queryFn: async () => {
            try {
                const response = await api.get("/api/Quiz/getQuizForStudent");
                return response.data.map(exam => ({
                    id: exam.id, course: exam.courseName, title: exam.title,
                    statusNum: exam.QuizAttemptStatus,
                    status: ["NotStarted", "processing", "Completed", "missed"][exam.QuizAttemptStatus - 1],
                    questions: exam.questions, time: exam.time, score: exam.score, points: exam.totalScore,
                    deadline: new Date(exam.deadline).toLocaleString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
                    rank: exam.rank,
                })).sort((a,b) => a.statusNum - b.statusNum);
            } catch (error) {
                 if (error.response && error.response.status === 404) {
                    return []; // Return an empty array on 404
                }
                throw error;
            }
        },
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        const endExpiredQuizzes = async () => {
            try {
                await api.post("/api/Quiz/endExpiredQuizzesForStudent");
                refetch();
            } catch (error) {
                // This can fail silently, it's a background task
            }
        };
        endExpiredQuizzes();
    }, [refetch]);
    // --- END OF CORRECTION ---

    const filteredExams = useMemo(() => exams?.filter(exam => filter === "all" || exam.status === filter) || [], [exams, filter]);

    const startExam = async () => {
        setShowStartModal(false);
        try {
            const response = await api.post(`/api/Quiz/${currentExam.id}/start`, {});
            setAttemptId(response.data.attemptId);
            const questionsResponse = await api.get(`/api/Quiz/${currentExam.id}/questions`);
            setQuestions(questionsResponse.data);
            setShowExamInterface(true);
        } catch (error) {
            toast.error(error.response?.data?.message || "لا يمكنك بدء هذا الامتحان حاليًا.");
            setShowExamInterface(false);
        }
    };

    const handleFinishExam = async (finalAnswers) => {
        if (!currentExam || !attemptId) return;
        setShowExamInterface(false);
        const toastId = toast.loading("جاري تسليم إجاباتك...");

        const formattedAnswers = {
            quizId: currentExam.id,
            submitAnswerResponseDtos: finalAnswers.map(ans => ({
                questionId: ans.questionId,
                selectedOptionId: ans.selectedOptionId,
                writtenText: ans.writtenText || ""
            }))
        };
        try {
            await api.post("/api/Quiz/submit-answer", formattedAnswers);
            await api.post(`/api/Quiz/attempts/${attemptId}/finish`);
            toast.success("تم تسليم الامتحان بنجاح!", { id: toastId });
            refetch();
        } catch (error) {
            toast.error("حدث خطأ أثناء التسليم.", { id: toastId });
        } finally {
            setQuestions([]); setAttemptId(null);
        }
    };

    if (isLoading && !exams) return <Loading message="جاري تجهيز غرفة الامتحانات..." />;

    return (
        <div className="text-gray-100 min-h-screen overflow-hidden w-full" style={{ fontFamily: "Cairo, sans-serif" }} dir="rtl">
            <Suspense fallback={<div className="fixed inset-0 bg-black -z-10" />}><StarfieldBackground mainContentRef={mainContentRef} /></Suspense>
            <AnimatePresence>
                {showStartModal && <StartExamModal exam={currentExam} onStart={startExam} onClose={() => setShowStartModal(false)} />}
                {showExamInterface && <ExamInterface exam={currentExam} questions={questions} onFinish={handleFinishExam} />}
            </AnimatePresence>

            <main ref={mainContentRef} className="flex-1 h-screen p-4 sm:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-black/20">
                <h1 className="text-4xl font-black text-white mb-2 title-glow">غرفة الامتحانات</h1>
                <p className="text-gray-400 text-lg mb-8">استعد لاختبار قدراتك في ساحة التحدي.</p>
                <div className="flex items-center gap-2 sm:gap-4 mb-8 flex-wrap">
                    {[ { key: "new", label: "جديدة" }, { key: "processing", label: "قيد المعالجة" }, { key: "graded", label: "منجزة" }, { key: "missed", label: "فائتة" }, { key: "all", label: "الكل" } ]
                    .map(btn => (
                        <button key={btn.key} onClick={() => setFilter(btn.key)} className={`relative rounded-lg px-4 py-2 text-sm font-bold transition-colors ${filter === btn.key ? "text-white" : "text-gray-400 hover:text-white"}`}>
                            {filter === btn.key && <motion.div layoutId="exam-filter-pill" className="absolute inset-0 bg-cyan-500/20 border border-cyan-500 rounded-lg" />}
                            <span className="relative z-10">{btn.label}</span>
                        </button>
                    ))}
                </div>
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredExams.length > 0 ? (
                            filteredExams.map(exam => <ExamCard key={exam.id} exam={exam} onStart={() => { setCurrentExam(exam); setShowStartModal(true); }} />)
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