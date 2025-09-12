import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios"; // تأكد أن هذا المسار صحيح
import { Cookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../Components/Loading"; // تأكد أن هذا المسار صحيح
import { ArrowLeft, Search, CheckCircle, Clock, FileText, UserCheck, Percent, Download, AlertCircle, X } from "lucide-react";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import toast, { Toaster } from 'react-hot-toast';

// --- تهيئة Day.js لاستخدام التوقيت المحلي للقاهرة ---
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Africa/Cairo");


// --- المكونات المساعدة (بدون تغيير) ---
const StatCard = ({ icon, label, value }) => ( <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-5 shadow-lg"><div className="flex items-center gap-4"><div className="p-3 bg-slate-800/60 rounded-lg">{icon}</div><div><p className="text-sm text-slate-400">{label}</p><p className="text-2xl font-black text-white">{value}</p></div></div></div> );
const SubmissionStatus = ({ submission }) => { let status = { text: "يحتاج تصحيح", icon: <Clock size={16} />, className: "bg-cyan-500/20 text-cyan-300" }; if (submission.isGraded) { status = { text: "تم التصحيح", icon: <CheckCircle size={16} />, className: "bg-green-500/20 text-green-300" }; } else if (submission.isLate) { status = { text: "متأخر", icon: <AlertCircle size={16} />, className: "bg-yellow-500/20 text-yellow-300" }; } return ( <span className={`px-3 py-1 rounded-full flex items-center gap-2 text-xs font-bold ${status.className}`}>{status.icon} {status.text}</span> ); };
const GradingModal = ({ isOpen, onClose, submission, onSubmit, isLoading }) => { const [grade, setGrade] = useState(''); useEffect(() => { if (submission) { setGrade(submission.grade || ''); } }, [submission]); if (!isOpen || !submission) return null; const handleSubmit = (e) => { e.preventDefault(); if (!isNaN(grade) && grade !== '' && parseFloat(grade) >= 0 && parseFloat(grade) <= 100) { onSubmit(parseFloat(grade)); } else { toast.error("الرجاء إدخال درجة صالحة بين 0 و 100."); } }; return ( <AnimatePresence>{isOpen && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}> <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="bg-slate-900 border border-cyan-500/20 rounded-2xl shadow-2xl w-full max-w-md p-6 text-white" onClick={(e) => e.stopPropagation()}> <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">تصحيح واجب الطالب</h2><button onClick={onClose} className="text-slate-400 hover:text-white transition"><X size={24} /></button></div><p className="text-slate-300 mb-2">الطالب: <span className="font-bold text-cyan-400">{submission.studentName}</span></p>{submission.files && ( <a href={submission.files} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 font-semibold"><Download size={16}/> تحميل ملف التسليم</a> )}<form onSubmit={handleSubmit}><label htmlFor="grade" className="block text-sm font-medium text-slate-400 mb-2">الدرجة<span className="text-xs text-slate-500 mr-2 font-bold">(الدرجة من 100)</span></label><input id="grade" type="number" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="أدخل الدرجة هنا..." readOnly={submission.isGraded} className={`w-full bg-slate-800 border ${submission.isGraded ? 'border-slate-700' : 'border-slate-600 focus:border-cyan-500'} rounded-lg p-3 text-white placeholder-slate-400 outline-none transition text-center text-2xl font-mono`} max="100" min="0" />{!submission.isGraded && ( <button type="submit" disabled={isLoading} className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition disabled:bg-slate-600 disabled:cursor-not-allowed">{isLoading ? "جاري الحفظ..." : "حفظ الدرجة"}</button> )}</form></motion.div></motion.div> )}</AnimatePresence> ); };


// --- المكون الرئيسي ---
const AssignmentSubmissions = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    const queryClient = useQueryClient();
    const cookies = new Cookies();
    const token = cookies.get("token");

    const { data: assignmentDetails, isLoading: isLoadingDetails } = useQuery({ queryKey: ["assignmentDetails", assignmentId], queryFn: async () => { const { data } = await axios.get(`/api/Assignment/GetAssignmentById/${assignmentId}`, { headers: { Authorization: `Bearer ${token}` } }); return data; }, enabled: !!assignmentId, });

    const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery({
        queryKey: ["assignmentSubmissions", assignmentId],
        queryFn: async () => {
            try {
                const { data } = await axios.get(`/api/SubmitedAssignment/GetSubmitedAssignments`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { assignmentId }
                });
                return data;
            } catch (error) {
                if (error.response?.status === 404) return [];
                throw error;
            }
        },
        enabled: !!assignmentId,
    });

    const gradeMutation = useMutation({
        mutationFn: ({ submissionId, grade }) => {
            if (!submissionId) { 
                return Promise.reject(new Error("Submission ID is missing")); 
            }
            
            // ---!!! هذا هو السطر الذي تم تعديله ---
            // نرسل 'grade' مباشرة، وليس كـ object
            // مع تحديد Content-Type لضمان التوافق مع السيرفر
            return axios.post(
                `/api/SubmitedAssignment/Addgrade/${submissionId}`, 
                grade, // تم التعديل هنا
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json' 
                    } 
                }
            );
        },
        onSuccess: () => {
            toast.success("تم تسجيل الدرجة بنجاح!");
            queryClient.invalidateQueries({ queryKey: ["assignmentSubmissions", assignmentId] });
            setIsModalOpen(false);
            setSelectedSubmission(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.title || "حدث خطأ أثناء حفظ الدرجة.");
        }
    });
    
    const stats = useMemo(() => { const graded = submissions.filter(s => s.isGraded); const totalScore = graded.reduce((sum, s) => sum + s.grade, 0); const average = graded.length > 0 ? (totalScore / graded.length).toFixed(1) : "N/A"; return { total: submissions.length, graded: graded.length, ungraded: submissions.length - graded.length, average: average, }; }, [submissions]);
    
    const sortedAndFilteredSubmissions = useMemo(() => { return submissions.slice().sort((a, b) => a.isGraded - b.isGraded).filter(sub => search === '' || sub.studentName?.toLowerCase().includes(search.toLowerCase())); }, [submissions, search]);

    const handleGradeClick = (submission) => {
        setSelectedSubmission(submission);
        setIsModalOpen(true);
    };

    const handleModalSubmit = (grade) => {
        gradeMutation.mutate({ submissionId: selectedSubmission.submitedAssignmentId, grade });
    };

    const isLoading = isLoadingDetails || isLoadingSubmissions;
    if (isLoading) return <Loading message="جاري تحميل التسليمات..." />;

    return (
        <div className="text-gray-100 font-[Cairo] p-4 sm:p-6 lg:p-8 min-h-screen">
            <Toaster position="bottom-center" toastOptions={{ className: 'font-[Cairo] font-bold', style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #38bdf8' }, }} />
            <Helmet><title>تسليمات: {assignmentDetails?.title || 'واجب'}</title></Helmet>
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <button onClick={() => navigate("/teacher/assignments")} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition font-semibold mb-4">
                        <ArrowLeft size={20} />
                        <span>العودة لجميع الواجبات</span>
                    </button>
                    <h1 className="text-4xl font-black text-white" style={{ textShadow: "0 0 15px rgba(0, 191, 255, 0.7)" }}>{assignmentDetails?.title || "تسليمات الواجب"}</h1>
                </header>

                <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                     <motion.div variants={{hidden:{opacity:0,y:20},visible:{opacity:1,y:0}}}><StatCard icon={<UserCheck size={28} className="text-cyan-400"/>} label="إجمالي التسليمات" value={stats.total} /></motion.div>
                    <motion.div variants={{hidden:{opacity:0,y:20},visible:{opacity:1,y:0}}}><StatCard icon={<CheckCircle size={28} className="text-green-400"/>} label="تم تصحيحها" value={stats.graded} /></motion.div>
                    <motion.div variants={{hidden:{opacity:0,y:20},visible:{opacity:1,y:0}}}><StatCard icon={<Clock size={28} className="text-yellow-400"/>} label="تحتاج تصحيح" value={stats.ungraded} /></motion.div>
                    <motion.div variants={{hidden:{opacity:0,y:20},visible:{opacity:1,y:0}}}><StatCard icon={<Percent size={28} className="text-purple-400"/>} label="متوسط الدرجات" value={stats.average} /></motion.div>
                </motion.div>

                <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-4 mb-8">
                    <div className="relative">
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن طالب..." className="w-full bg-slate-800/60 border border-slate-600 rounded-lg p-3 pr-10 text-white placeholder-slate-400 focus:border-cyan-500 outline-none transition" />
                        <Search className="w-5 h-5 text-slate-400 absolute top-1/2 right-3 -translate-y-1/2" />
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl overflow-x-auto">
                    <table className="w-full text-right min-w-[800px]">
                        <thead className="border-b border-slate-700">
                            <tr>
                                <th className="p-4 font-semibold text-white">الطالب</th>
                                <th className="p-4 font-semibold text-white">تاريخ التسليم</th>
                                <th className="p-4 font-semibold text-white">الملف</th>
                                <th className="p-4 font-semibold text-white">الحالة</th>
                                <th className="p-4 font-semibold text-white">الدرجة</th>
                                <th className="p-4 font-semibold text-white">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAndFilteredSubmissions.length > 0 ? (
                                sortedAndFilteredSubmissions.map((sub) => (
                                    <tr key={sub.submitedAssignmentId} className="border-b border-slate-800 last:border-b-0 hover:bg-cyan-500/5 transition-colors">
                                        <td className="p-4 flex items-center gap-3"><img src={`https://placehold.co/40x40/1e293b/94a3b8?text=${sub.studentName.charAt(0)}`} className="w-10 h-10 rounded-full" alt={sub.studentName} /><span className="font-bold">{sub.studentName}</span></td>
                                        <td className="p-4">{sub.submissionDate ? <span>{dayjs.utc(sub.submissionDate).tz("Africa/Cairo").format('YYYY/MM/DD hh:mm A')}</span> : <span className="text-slate-500">لم يسلم بعد</span>}</td>
                                        <td className="p-4">{sub.files ? ( <a href={sub.files} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2"><Download size={16}/> تحميل الملف</a> ) : ( <span className="text-slate-500">لا يوجد ملف</span> )}</td>
                                        <td className="p-4"><SubmissionStatus submission={sub} /></td>
                                        <td className="p-4 font-mono font-bold text-lg">{sub.isGraded ? `${sub.grade} / 100` : "—"}</td>
                                        <td className="p-4">
                                             <button onClick={() => handleGradeClick(sub)} className={`px-4 py-2 text-sm rounded-lg font-bold transition ${ sub.isGraded ? "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300" : "bg-cyan-500/80 hover:bg-cyan-500 text-white" }`}>
                                                {sub.isGraded ? "عرض الدرجة" : "تصحيح ومراجعة"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-16 text-slate-400"><FileText size={48} className="mx-auto text-slate-600 mb-4" /><h3 className="text-xl font-bold text-white">لا توجد تسليمات لهذا الواجب بعد</h3></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <GradingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} submission={selectedSubmission} onSubmit={handleModalSubmit} isLoading={gradeMutation.isLoading} />
        </div>
    );
};

export default AssignmentSubmissions;