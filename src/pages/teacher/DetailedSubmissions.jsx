import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import api from "../../api/axios"; // Will be used when endpoint is provided
import toast from "react-hot-toast";
import api from '../../api/axios';

const DetailedSubmissions = () => {
    const { quizId, submissionId } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState([]);//backend returns an array
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetailedSubmission = async () => {
            try {
                setLoading(true);
    
                const response = await api.get(`/api/Quiz/submissions-with-questions/${quizId}/${submissionId}`);
                // console.log("detailed submission:", response.data);
    
                if (!Array.isArray(response.data) || response.data.length === 0) {
                    setSubmission(null);
                    return;
                }
    
                // Backend returns an array, but we take the first (since submissionId is unique)
                const raw = response.data[0];
    
                const transformed = {
                    submissionId: raw.submissionId,
                    quizId: raw.quizId,
                    studentId: raw.studentId,
                    studentName: raw.studentName,
                    submittedAt: raw.submittedAt,
                    score: raw.score,
                    answers: raw?.answers?.map(ans => {
                        let questionType;
                        if (ans.type === 1) questionType = 'mcq';
                        else if (ans.type === 2) questionType = 'trueFalse';
                        else questionType = 'text';
    
                        if (questionType === 'mcq') {
                            return {
                                questionId: ans.questionId,
                                questionText: ans.questionText,
                                questionType,
                                studentAnswer: ans.studentAnswer,
                                isCorrect: ans.isCorrect,
                                options2: ans?.options2?.map(o => o.text),
                                correctAnswer: ans?.options2?.find(o => o.isCorrect)?.text || null
                            };
                        } 
                        else if (questionType === 'trueFalse') {
                            return {
                                questionId: ans.questionId,
                                questionText: ans.questionText,
                                questionType,
                                studentAnswer: ans.studentAnswer === true || ans.studentAnswer === "true",
                                isCorrect: ans.isCorrect,
                                correctAnswer: ans?.options2?.find(o => o.isCorrect)?.text?.toLowerCase() === "true"
                            };
                        } 
                        else {
                            return {
                                questionId: ans.questionId,
                                questionText: ans.questionText,
                                questionType,
                                studentAnswer: ans.studentAnswer,
                                isCorrect: ans.isCorrect
                            };
                        }
                    })
                };
    
                setSubmission(transformed);
    
            } catch (error) {
                console.error("Error fetching detailed submission:", error);
                toast.error("حدث خطأ في تحميل تفاصيل التقديم");
            } finally {
                setLoading(false);
            }
        };
    
        fetchDetailedSubmission();
    }, [quizId, submissionId]);
    

    const formatDate = (dateString) => {
        if (!dateString) return "غير محدد";
        const date = new Date(dateString);
        return date.toLocaleString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-400 bg-green-400/20 border-green-400/30';
        if (score >= 70) return 'text-cyan-400 bg-cyan-400/20 border-cyan-400/30';
        if (score >= 50) return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
        return 'text-red-400 bg-red-400/20 border-red-400/30';
    };

    const getAnswerStatus = (isCorrect) => {
        return isCorrect ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-400/20 text-green-400 border border-green-400/30">
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                صحيح
            </span>
        ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-400/20 text-red-400 border border-red-400/30">
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                خطأ
            </span>
        );
    };

    const getQuestionTypeBadge = (questionType) => {
        const typeConfig = {
            text: { label: "إجابة نصية", color: "bg-blue-500/20 text-blue-400 border-blue-400/30" },
            mcq: { label: "اختيار متعدد", color: "bg-purple-500/20 text-purple-400 border-purple-400/30" },
            trueFalse: { label: "صح وخطأ", color: "bg-orange-500/20 text-orange-400 border-orange-400/30" }
        };
        
        const config = typeConfig[questionType] || typeConfig.text;
        
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const renderStudentAnswer = (answer) => {
        switch (answer.questionType) {
            case 'mcq':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-white">إجابة الطالب:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                                answer.isCorrect 
                                    ? 'bg-green-400/20 text-green-400 border-green-400/30' 
                                    : 'bg-red-400/20 text-red-400 border-red-400/30'
                            }`}>
                                {answer.studentAnswer}
                            </span>
                        </div>
                        <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                            <p className="text-gray-400 mb-3">الخيارات المتاحة:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {answer?.options2?.map((option, index) => (
                                    <div 
                                        key={index}
                                        className={`p-3 rounded-lg border ${
                                            option === answer.correctAnswer 
                                                ? 'bg-green-400/20 border-green-400/30 text-green-300' 
                                                : option === answer.studentAnswer && !answer.isCorrect
                                                ? 'bg-red-400/20 border-red-400/30 text-red-300'
                                                : 'bg-gray-700/50 border-gray-600/30 text-gray-300'
                                        }`}
                                    >
                                        <span className="font-bold ml-2">{String.fromCharCode(65 + index)}.</span>
                                        {option}
                                        {option === answer.correctAnswer && (
                                            <span className="mr-2 text-green-400">✓</span>
                                        )}
                                        {option === answer.studentAnswer && !answer.isCorrect && option !== answer.correctAnswer && (
                                            <span className="mr-2 text-red-400">✗</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            
            case 'trueFalse':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-white">إجابة الطالب:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                                answer.isCorrect 
                                    ? 'bg-green-400/20 text-green-400 border-green-400/30' 
                                    : 'bg-red-400/20 text-red-400 border-red-400/30'
                            }`}>
                                {answer.studentAnswer ? 'صح' : 'خطأ'}
                            </span>
                        </div>
                        <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                            <p className="text-gray-400 mb-3">الإجابة الصحيحة:</p>
                            <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${
                                !answer.correctAnswer 
                                    ? 'bg-green-400/20 text-green-400 border-green-400/30' 
                                    : 'bg-red-400/20 text-red-400 border-red-400/30'
                            }`}>
                                <span className="font-bold">{answer.correctAnswer ? 'صح' : 'خطأ'}</span>
                            </div>
                        </div>
                    </div>
                );
            
            default: // text
                return (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">إجابة الطالب:</h3>
                        <p className={`p-4 rounded-lg border ${
                            answer.isCorrect 
                                ? 'bg-green-400/10 border-green-400/30 text-green-300' 
                                : 'bg-red-400/10 border-red-400/30 text-red-300'
                        }`}>
                            {answer.studentAnswer}
                        </p>
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-gray-400">جاري تحميل تفاصيل التقديم...</p>
                </div>
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="min-h-screen bg-black text-white font-[Cairo] flex items-center justify-center" dir="rtl">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-3">لم يتم العثور على التقديم</h3>
                    <p className="text-gray-400 mb-6">التقديم المطلوب غير موجود أو تم حذفه</p>
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors"
                    >
                        العودة للخلف
                    </button>
                </div>
            </div>
        );
    }

    const correctAnswers = submission?.answers?.filter(answer => answer.isCorrect).length;
    const totalQuestions = submission?.answers?.length;

    return (
        <div className="min-h-screen  text-white font-[Cairo]" dir="rtl">
            <div className="p-8 max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            العودة للقائمة
                        </button>
                    </div>
                    
                    <p
                        className="text-4xl font-black text-white mb-4"
                        style={{ textShadow: "0 0 12px rgba(0, 191, 255, 0.6)" }}
                    >
                        تفاصيل التقديم
                    </p>
                    <p className="text-gray-400 text-lg">
                        عرض تفاصيل إجابة الطالب على الاختبار
                    </p>
                </div>

                {/* Student Info Card */}
                <div className="glass-effect rounded-2xl p-6 border border-white/5 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="h-16 w-16 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                                <span className="text-2xl font-bold text-cyan-400">
                                    {submission?.studentName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                            </div>
                            <div className="mr-4">
                                <h2 className="text-2xl font-bold text-white">{submission.studentName}</h2>
                                <p className="text-gray-400">رقم التقديم: {submission.submissionId}</p>
                            </div>
                        </div>
                        
                        <div className="text-left">
                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold border ${getScoreColor(submission.score)}`}>
                                {submission.score}%
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-black/20 rounded-lg">
                            <p className="text-sm text-gray-400">تاريخ التقديم</p>
                            <p className="text-lg font-bold text-white">{formatDate(submission.submittedAt)}</p>
                        </div>
                        <div className="text-center p-4 bg-black/20 rounded-lg">
                            <p className="text-sm text-gray-400">عدد الأسئلة</p>
                            <p className="text-lg font-bold text-white">{totalQuestions}</p>
                        </div>
                        <div className="text-center p-4 bg-black/20 rounded-lg">
                            <p className="text-sm text-gray-400">الإجابات الصحيحة</p>
                            <p className="text-lg font-bold text-white">{correctAnswers} / {totalQuestions}</p>
                        </div>
                    </div>
                </div>

                {/* Answers Section */}
                <div className="glass-effect rounded-2xl border border-white/5 overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white">إجابات الطالب</h2>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {submission?.answers?.map((answer, index) => (
                            <div key={answer.questionId} className="bg-black/20 rounded-xl p-6 border border-white/5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3 space-x-reverse">
                                        <span className="bg-cyan-500/20 text-cyan-400 font-bold px-3 py-1 rounded-full text-sm border border-cyan-500/30">
                                            السؤال {index + 1}
                                        </span>
                                        {getQuestionTypeBadge(answer.questionType)}
                                    </div>
                                    {getAnswerStatus(answer.isCorrect)}
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2">السؤال:</h3>
                                        <p className="text-gray-300 bg-black/30 p-4 rounded-lg border border-white/10">
                                            {answer.questionText}
                                        </p>
                                    </div>
                                    
                                    {renderStudentAnswer(answer)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TODO: check logic for this card */}

                {/* Summary Card */}
                <div className="mt-8 glass-effect rounded-2xl p-6 border border-white/5">
                    <h3 className="text-xl font-bold text-white mb-4">ملخص الأداء</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-black/20 p-4 rounded-lg">
                            <p className="text-gray-400 mb-2">نسبة النجاح</p>
                            <div className="flex items-center">
                                <div className="flex-1 bg-gray-700 rounded-full h-3 mr-3">
                                    <div 
                                        className="bg-cyan-400 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${submission.score}%` }}
                                    ></div>
                                </div>
                                <span className="text-lg font-bold text-white">{submission.score}%</span>
                            </div>
                        </div>
                        
                        <div className="bg-black/20 p-4 rounded-lg">
                            <p className="text-gray-400 mb-2">معدل الإجابات الصحيحة</p>
                            <p className="text-2xl font-bold text-white">
                                {Math.round((correctAnswers / totalQuestions) * 100)}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedSubmissions;