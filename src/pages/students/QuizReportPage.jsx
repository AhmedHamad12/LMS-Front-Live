import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../../api/axios';
import { Cookies } from 'react-cookie';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Loading from '../../Components/Loading';
import { CheckCircle, XCircle, ShieldOff, BarChart2, Star, HelpCircle, ArrowLeft } from 'lucide-react';

// --- مكون لعرض رسالة "الوصول مرفوض" ---
const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center p-4">
        <ShieldOff size={64} className="text-red-500 mb-4" />
        <h2 className="text-3xl font-bold mb-2">الوصول مرفوض</h2>
        <p className="text-gray-400 mb-6">
            ليس لديك الصلاحية لعرض هذا التقرير. قد يكون هذا التقرير خاصًا بطالب آخر.
        </p>
        <Link to="/student/dashboard" className="px-6 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors">
            العودة للوحة التحكم
        </Link>
    </div>
);

// --- مكون لعرض خيار الإجابة ---
const OptionItem = ({ option, studentAnswers }) => {
    const isSelected = studentAnswers.includes(option.optionId);
    const isCorrect = option.isCorrect;

    let stateClass = "border-slate-700 hover:bg-slate-800"; // الحالة الافتراضية
    if (isCorrect) {
        stateClass = "bg-green-500/10 border-green-500 text-green-300"; // الإجابة الصحيحة
    }
    if (isSelected && !isCorrect) {
        stateClass = "bg-red-500/10 border-red-500 text-red-300"; // إجابة الطالب الخاطئة
    }
    
    return (
        <div className={`p-4 rounded-lg border flex items-center justify-between transition-all ${stateClass}`}>
            <span className="font-medium">{option.text}</span>
            <div className="flex items-center gap-2">
                {isCorrect && <CheckCircle size={20} className="text-green-500" />}
                {isSelected && !isCorrect && <XCircle size={20} className="text-red-500" />}
            </div>
        </div>
    );
};


// --- مكون لعرض السؤال ---
const QuestionCard = ({ question, index }) => (
    <motion.div 
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        className="glass-effect rounded-2xl p-6 border border-slate-800"
    >
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg">
                {index + 1}
            </div>
            <div>
                <h3 className="text-xl font-bold text-white">{question.text}</h3>
                {question.imageUrl && <img src={question.imageUrl} alt="Question visual aid" className="mt-4 rounded-lg max-w-sm" />}
            </div>
        </div>
        <div className="mt-6 space-y-3">
            {question.options.map(opt => (
                <OptionItem key={opt.optionId} option={opt} studentAnswers={question.studentAnswers} />
            ))}
        </div>
    </motion.div>
);


// --- مكون لعرض ملخص التقرير ---
const ReportHeader = ({ report }) => {
    const statusText = report.isPassed ? "لقد نجحت!" : "للأسف لم تجتاز الاختبار";
    const statusColor = report.isPassed ? "text-green-400" : "text-red-400";

    return(
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
        >
            <Link to="/student/myexams" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mb-4">
                <ArrowLeft size={16} /> العودة لصفحة الامتحانات
            </Link>
            <h1 className="text-4xl lg:text-5xl font-black text-white title-glow">{report.quizTitle}</h1>
            <p className="text-xl text-gray-400 mt-2">تقرير الأداء الخاص بك</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <div className="glass-effect p-4 rounded-xl"><p className="text-gray-400 text-sm">الحالة</p><p className={`text-2xl font-bold ${statusColor}`}>{statusText}</p></div>
                <div className="glass-effect p-4 rounded-xl"><p className="text-gray-400 text-sm">درجتك</p><p className="text-2xl font-bold text-white">{report.score}</p></div>
                <div className="glass-effect p-4 rounded-xl"><p className="text-gray-400 text-sm">درجة النجاح</p><p className="text-2xl font-bold text-white">{report.passScore}</p></div>
                <div className="glass-effect p-4 rounded-xl"><p className="text-gray-400 text-sm">عدد الأسئلة</p><p className="text-2xl font-bold text-white">{report.questions.length}</p></div>
            </div>
        </motion.div>
    );
};


// --- المكون الرئيسي للصفحة ---
export default function QuizReportPage() {
    const { attemptId } = useParams();
    const cookies = new Cookies();
    const token = cookies.get("token");

    const { data: report, isLoading, isError, error } = useQuery({
        queryKey: ['quizReport', attemptId],
        queryFn: async () => {
            const { data } = await axios.get(`/api/Quiz/QuizReport/${attemptId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        enabled: !!attemptId && !!token,
        refetchOnWindowFocus: false,
        retry: 1, // حاول مرة واحدة فقط في حال فشل الشبكة
    });

    if (isLoading) {
        return <Loading message="جاري تحميل تقرير الاختبار..." />;
    }

    // هنا يتم التعامل مع الأمان
    if (isError) {
        // إذا كان الخطأ بسبب الصلاحية، اعرض رسالة الوصول مرفوض
        if (error.response?.status === 403 || error.response?.status === 401) {
            return <AccessDenied />;
        }
        // لأي خطأ آخر، اعرض رسالة خطأ عامة
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center p-4">
                <XCircle size={64} className="text-red-500 mb-4" />
                <h2 className="text-3xl font-bold mb-2">حدث خطأ</h2>
                <p className="text-gray-400 mb-6">
                    لم نتمكن من تحميل تقرير هذا الاختبار. قد يكون قد تم حذفه أو أن الرابط غير صحيح.
                </p>
                <Link to="/student/dashboard" className="px-6 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors">
                    العودة للوحة التحكم
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-gray-100" style={{ fontFamily: "Cairo, sans-serif" }}>
            <Helmet><title>تقرير: {report?.quizTitle}</title></Helmet>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <ReportHeader report={report} />
                
                <h2 className="text-3xl font-bold text-white title-glow mb-6">تفاصيل الإجابات</h2>
                <motion.div 
                    className="space-y-6"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                >
                    {report.questions.map((q, index) => (
                        <QuestionCard key={q.questionId} question={q} index={index} />
                    ))}
                </motion.div>
            </main>
        </div>
    );
}