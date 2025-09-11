import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import Loading from '../../Components/Loading';

// --- Sidebar Component ---
const QuestionsSidebar = ({ questions, answers, currentQuestionIndex, setCurrentQuestionIndex }) => {
    const isAnswered = (questionId) => answers.some(ans => ans.questionId === questionId);

    return (
        <div className="glass-effect p-4 rounded-lg flex-shrink-0 w-full md:w-64 border border-white/10">
            <h3 className="font-bold text-white mb-4 text-center">قائمة الأسئلة</h3>
            <div className="grid grid-cols-5 md:grid-cols-4 gap-2">
                {questions.map((q, index) => (
                    <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-200
                            ${index === currentQuestionIndex 
                                ? 'bg-cyan-500 text-black ring-2 ring-offset-2 ring-offset-slate-900 ring-cyan-400' 
                                : isAnswered(q.id) 
                                    ? 'bg-green-500/50 hover:bg-green-500/80 text-white' 
                                    : 'bg-gray-700/50 hover:bg-gray-600/80 text-gray-300'
                            }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- Main Exam Attempt Page ---
const ExamAttempt = () => {
    const { examId } = useParams();
    const navigate = useNavigate();

    const [examDetails, setExamDetails] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [attemptId, setAttemptId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState(() => {
        try {
            const savedAnswers = localStorage.getItem(`examAttempt_${examId}`);
            return savedAnswers ? JSON.parse(savedAnswers) : [];
        } catch (error) { return []; }
    });
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const initializeExam = async () => {
            try {
                const startResponse = await api.post(`/api/Quiz/${examId}/start`);
                const newAttemptId = startResponse.data.attemptId;
                setAttemptId(newAttemptId);

                const questionsPromise = api.get(`/api/Quiz/${examId}/questions`);
                const detailsPromise = api.get(`/api/Quiz/GetQuizById${examId}`);
                
                const [questionsRes, detailsRes] = await Promise.all([questionsPromise, detailsPromise]);
                
                setQuestions(questionsRes.data);
                setExamDetails(detailsRes.data);
                setTimeLeft(detailsRes.data.timeLimitMinutes * 60);
            } catch (error) {
                const errorMessage = error.response?.data?.message || "لا يمكنك دخول هذا الامتحان حاليًا.";
                toast.error(errorMessage);
                navigate('/student/myexams');
            } finally {
                setIsLoading(false);
            }
        };

        initializeExam();
    }, [examId, navigate]);

    useEffect(() => {
        localStorage.setItem(`examAttempt_${examId}`, JSON.stringify(answers));
    }, [answers, examId]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) {
            if (timeLeft !== null) handleFinishExam();
            return;
        }
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                toast.error("لقد غادرت صفحة الامتحان! تم تسليم إجاباتك.", { duration: 5000 });
                handleFinishExam();
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [answers]);

    const handleAnswerSelect = (questionId, option) => {
        setAnswers(prev => {
            const existingIndex = prev.findIndex(a => a.questionId === questionId);
            const newAnswer = { questionId, selectedOptionId: option.optionId };
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = newAnswer;
                return updated;
            }
            return [...prev, newAnswer];
        });
    };

    const handleFinishExam = useCallback(async () => {
        if (!examDetails || !attemptId) return;
        if (window.isSubmitting) return;
        window.isSubmitting = true;

        const toastId = toast.loading("جاري تسليم إجاباتك...");
        
        const formattedAnswers = {
            quizId: examDetails.id,
            submitAnswerResponseDtos: answers.map(ans => ({
                questionId: ans.questionId,
                selectedOptionId: ans.selectedOptionId,
                writtenText: ""
            }))
        };
        try {
            await api.post("/api/Quiz/submit-answer", formattedAnswers);
            await api.post(`/api/Quiz/attempts/${attemptId}/finish`);
            
            localStorage.removeItem(`examAttempt_${examId}`);
            toast.success("تم تسليم الامتحان بنجاح!", { id: toastId });
            navigate('/student/my-exams');
        } catch (error) {
            toast.error("حدث خطأ أثناء التسليم.", { id: toastId });
        } finally {
            window.isSubmitting = false;
        }
    }, [answers, examDetails, attemptId, examId, navigate]);

    const selectedAnswerId = useMemo(() => 
        answers.find(a => a.questionId === questions?.[currentQuestionIndex]?.id)?.selectedOptionId,
        [answers, currentQuestionIndex, questions]
    );

    if (isLoading) return <Loading message="جاري بدء جلسة الامتحان..." />;

    const currentQuestion = questions?.[currentQuestionIndex];
    const timerColorClass = timeLeft <= 60 ? 'bg-red-500/30 text-red-400' 
                          : timeLeft <= 300 ? 'bg-yellow-500/30 text-yellow-400' 
                          : '';

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col p-4 select-none" dir="rtl">
            <header className="p-4 flex-shrink-0 glass-effect flex justify-between items-center border-b border-white/10 rounded-t-lg">
                <div>
                    <p className="text-sm text-cyan-300">{examDetails?.courseName}</p>
                    <h2 className="text-xl font-bold text-white">{examDetails?.title}</h2>
                </div>
                <div className={`text-center p-2 rounded-lg transition-colors ${timerColorClass}`}>
                    <p className="text-sm">الوقت المتبقي</p>
                    <p className="text-2xl font-bold font-mono">
                        {timeLeft !== null ? `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}` : '00:00'}
                    </p>
                </div>
            </header>

            <div className="flex-grow flex flex-col md:flex-row gap-6 mt-6">
                <QuestionsSidebar 
                    questions={questions} 
                    answers={answers}
                    currentQuestionIndex={currentQuestionIndex}
                    setCurrentQuestionIndex={setCurrentQuestionIndex}
                />

                <main className="flex-grow flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentQuestionIndex} 
                            initial={{ opacity: 0, x: 50 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: -50 }} 
                            transition={{ duration: 0.2 }}
                            className="w-full flex-grow flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <p className="font-bold text-lg">السؤال {currentQuestionIndex + 1} من {questions.length}</p>
                                <div className="w-1/2 h-2 bg-gray-700 rounded-full">
                                    <div className="h-2 bg-cyan-400 rounded-full" style={{ width: `${((answers.length) / questions.length) * 100}%` }}></div>
                                </div>
                            </div>
                            <div className="glass-effect p-8 rounded-lg flex-grow">
                                <p className="text-xl font-bold leading-relaxed mb-8">{currentQuestion?.text}</p>
                                {currentQuestion?.imageUrl && <img src={currentQuestion.imageUrl} alt="question" className="mb-6 rounded-lg max-w-full mx-auto" />}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentQuestion?.options.map(opt => (
                                        <button 
                                            key={opt.optionId} 
                                            onClick={() => handleAnswerSelect(currentQuestion.id, opt)} 
                                            className={`p-4 rounded-lg border text-right transition-colors duration-200
                                                ${selectedAnswerId === opt.optionId
                                                    ? "bg-cyan-500/20 border-cyan-500" 
                                                    : "border-gray-600 hover:bg-cyan-500/10 hover:border-cyan-500/40"
                                                }`}
                                        >
                                            {opt.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            <footer className="p-4 mt-6 flex-shrink-0 glass-effect flex justify-between items-center border-t border-white/10 rounded-b-lg">
                <button onClick={handleFinishExam} className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors font-bold">إنهاء وتسليم</button>
                <div className="flex gap-4">
                    <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className="p-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors font-bold disabled:opacity-50"><ArrowRight size={20}/></button>
                    <button disabled={currentQuestionIndex === questions.length - 1} onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="p-3 rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 transition-colors font-bold disabled:opacity-50"><ArrowLeft size={20}/></button>
                </div>
            </footer>
        </div>
    );
};

export default ExamAttempt;
