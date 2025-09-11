import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { File, Clock, CheckCircle, XCircle, Inbox, Paperclip, UploadCloud, X } from "lucide-react";
import Loading from "../../Components/Loading";
import { Cookies } from "react-cookie";

const StarfieldBackground = lazy(() => import('../../Components/StarfieldBackground'));

// --- Helper Components ---
const AssignmentModal = ({ assignment, onClose, onSubmit }) => {
    // ... (This component code remains unchanged, you can keep it as is)
    const [fileUpload, setFileUpload] = useState(null);
    const [textAnswer, setTextAnswer] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!textAnswer && !fileUpload) {
            return toast.error("يجب إضافة إجابة نصية أو رفع ملف على الأقل.");
        }
        setIsSubmitting(true);
        await onSubmit(textAnswer, fileUpload);
        setIsSubmitting(false);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-effect rounded-2xl w-full max-w-2xl border-cyan-500/20 shadow-2xl shadow-cyan-500/10 flex flex-col max-h-[90vh]">
                <header className="p-4 border-b border-white/10 flex-shrink-0 flex justify-between items-center">
                    <div>
                        <p className="text-sm font-bold text-cyan-300">{assignment?.courseName}</p>
                        <h2 className="text-2xl font-bold text-white">تسليم المهمة</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors"><X size={24} /></button>
                </header>
                <div className="p-6 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-black/20">
                    <h3 className="font-bold mb-2 text-lg text-white">تعليمات المهمة:</h3>
                    <p className="text-gray-300 mb-6 bg-black/20 p-4 rounded-lg">{assignment?.assignmentDescription}</p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">كتابة الإجابة (اختياري)</label>
                            <textarea rows={4} value={textAnswer} onChange={(e) => setTextAnswer(e.target.value)} className="w-full bg-black/20 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition" placeholder="اكتب إجابتك أو أي ملاحظات هنا..."/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">رفع ملف الحل (اختياري)</label>
                            <div className="mt-1 cursor-pointer flex flex-col items-center justify-center px-6 py-8 border-2 border-gray-600 border-dashed rounded-md hover:border-cyan-500 transition-colors">
                                <UploadCloud size={48} className="text-gray-500 mb-2" />
                                <input id="file_upload" type="file" className="hidden" onChange={(e) => setFileUpload(e.target.files[0])} />
                                <label htmlFor="file_upload" className="font-medium text-cyan-400 hover:text-cyan-300 cursor-pointer"><span>اضغط لاختيار ملف</span></label>
                                <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG, DOCX (بحد أقصى 10MB)</p>
                            </div>
                            {fileUpload && (<div className="flex items-center justify-between bg-green-500/10 text-green-300 p-3 rounded-lg mt-2 text-sm"><div className="flex items-center gap-2"><Paperclip size={16} /><span>{fileUpload.name}</span></div><button onClick={() => setFileUpload(null)} className="p-1 rounded-full hover:bg-white/10"><X size={16} /></button></div>)}
                        </div>
                    </div>
                </div>
                <footer className="p-4 border-t border-white/10 flex-shrink-0 flex justify-end gap-4">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors font-bold">إلغاء</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors shadow-lg shadow-green-500/20 font-bold flex items-center gap-2 disabled:bg-gray-500 disabled:cursor-wait">{isSubmitting ? "جاري التسليم..." : "تسليم المهمة"}</button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

const AssignmentCard = ({ assignment, onStart }) => {
    // ... (This component code remains unchanged, you can keep it as is)
    const statusMap = {
        new: { text: "جديد", icon: <File size={16} />, className: "text-yellow-300 bg-yellow-500/20 border-yellow-500/30" },
        submitted: { text: "تم التسليم", icon: <Clock size={16} />, className: "text-blue-300 bg-blue-500/20 border-blue-500/30" },
        graded: { text: "تم التقييم", icon: <CheckCircle size={16} />, className: "text-green-300 bg-green-500/20 border-green-500/30" },
        missed: { text: "فائتة", icon: <XCircle size={16} />, className: "text-red-300 bg-red-500/20 border-red-500/30" },
    };
    const status = statusMap[assignment.statusCategory];
    return (
        <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`glass-effect rounded-2xl p-6 flex flex-col justify-between transform hover:-translate-y-2 transition-transform duration-300 border ${status.className}`}>
            <div>
                <div className="flex justify-between items-start mb-4"><p className="text-sm font-bold text-cyan-300">{assignment.courseName}</p><span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 ${status.className}`}>{status.icon} {status.text}</span></div>
                <h3 className="text-xl font-bold text-white mb-4">{assignment.assignmentDescription}</h3>
                {(status.text === "تم التقييم" || status.text === "فائتة") && (<div className="bg-black/20 p-4 rounded-lg text-center mb-6"><p className="text-sm text-gray-300">النتيجة</p><p className={`text-3xl font-black ${status.text === "تم التقييم" ? "text-green-400" : "text-red-400"}`}>{assignment.score || 0} <span className="text-lg">/ {assignment.totalScore || 100}</span></p></div>)}
                {status.text === "جديد" && (<div className="text-sm text-yellow-400 flex items-center gap-2 mb-6"><Clock size={16}/><span>الموعد النهائي: <span className="font-bold">{new Date(assignment.dueDate).toLocaleDateString('ar-EG')}</span></span></div>)}
            </div>
            <div className="space-y-2">
                <a href={assignment.files} target="_blank" rel="noopener noreferrer" className="w-full text-center block p-3 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors">عرض الواجب</a>
                {status.text === "جديد" && <button onClick={onStart} className="w-full text-center block p-3 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors">ابدأ المهمة</button>}
                {status.text === "تم التقييم" && <button className="w-full text-center block p-3 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors">عرض التقييم</button>}
                {(status.text === "تم التسليم" || status.text === "فائتة") && <button className="w-full text-center block p-3 rounded-lg bg-gray-800 text-gray-400 font-bold cursor-not-allowed">مغلق</button>}
            </div>
        </motion.div>
    );
};

// --- Main Component ---
const MyTasks = () => {
    const [filter, setFilter] = useState("new");
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState(null);

    const mainContentRef = useRef(null);
    const cookies = new Cookies();
    const token = cookies.get("token");

    // --- CORRECTED DATA FETCHING ---
    const { data: assignments, isLoading, refetch } = useQuery({
        queryKey: ["user-assignments"],
        queryFn: async () => {
            try {
                const response = await api.get(`/api/Assignment/GetAssignmentsForStudent`, { headers: { Authorization: `Bearer ${token}` } });
                return response.data; // Return data on success
            } catch (error) {
                // If the error is 404 (No assignments found), handle it gracefully
                if (error.response && error.response.status === 404) {
                    return []; // Return an empty array, not an error
                }
                // For any other error, re-throw it to let react-query handle it
                throw error;
            }
        },
        refetchOnWindowFocus: false,
    });
    // --- END OF CORRECTION ---

    const { filteredAssignments, counts } = useMemo(() => {
        const mappedAssignments = assignments?.map(a => ({
            ...a,
            statusCategory: ["new", "submitted", "graded", "missed"][a.submitedStatus - 1] || "new"
        })) || [];

        const counts = {
            all: mappedAssignments.length,
            new: mappedAssignments.filter(a => a.statusCategory === "new").length,
            submitted: mappedAssignments.filter(a => a.statusCategory === "submitted").length,
            graded: mappedAssignments.filter(a => a.statusCategory === "graded").length,
            missed: mappedAssignments.filter(a => a.statusCategory === "missed").length,
        };

        const filtered = filter === "all" ? mappedAssignments : mappedAssignments.filter(a => a.statusCategory === filter);
        
        return { filteredAssignments: filtered, counts };
    }, [assignments, filter]);

    const startAssignment = (assignment) => {
        setCurrentAssignment(assignment);
        setShowAssignmentModal(true);
    };

    const submitAssignment = async (textAnswer, fileUpload) => {
        const toastId = toast.loading("جاري تسليم المهمة...");
        const formData = new FormData();
        formData.append("AssignmentId", currentAssignment.id);
        if (fileUpload) formData.append("Files", fileUpload);
        formData.append("SubmissionComment", textAnswer || " ");
        
        try {
            await api.post(`/api/SubmitedAssignment/AddSubmitedAssignment`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            });
            toast.success("تم تسليم المهمة بنجاح!", { id: toastId });
            setShowAssignmentModal(false);
            setCurrentAssignment(null);
            refetch();
        } catch (err) {
            toast.error("فشل تسليم المهمة. حاول مرة أخرى.", { id: toastId });
        }
    };

    if (isLoading) return <Loading message="جاري تحميل مركز قيادة المهام..." />;

    return (
        <div className="text-gray-100 min-h-screen overflow-hidden w-full" style={{ fontFamily: "Cairo, sans-serif" }} dir="rtl">
            <Suspense fallback={<div className="fixed inset-0 bg-black -z-10" />}><StarfieldBackground mainContentRef={mainContentRef} /></Suspense>
            <AnimatePresence>
                {showAssignmentModal && <AssignmentModal assignment={currentAssignment} onClose={() => setShowAssignmentModal(false)} onSubmit={submitAssignment}/>}
            </AnimatePresence>
            <main ref={mainContentRef} className="flex-1 h-screen p-4 sm:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-black/20">
                <h1 className="text-4xl font-black text-white mb-2" style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}>مركز قيادة المهام</h1>
                <p className="text-gray-400 text-lg mb-8">جميع واجباتك الحالية والمنجزة في مكان واحد.</p>
                <div className="flex items-center gap-2 sm:gap-4 mb-8 flex-wrap">
                    {[ { key: "new", label: "جديدة" }, { key: "submitted", label: "بانتظار التقييم" }, { key: "graded", label: "منجزة" }, { key: "missed", label: "فائتة" }, { key: "all", label: "الكل" } ]
                    .map(btn => (
                        <button key={btn.key} onClick={() => setFilter(btn.key)} className={`relative rounded-lg px-4 py-2 text-sm font-bold transition-colors ${filter === btn.key ? "text-white" : "text-gray-400 hover:text-white"}`}>
                            {filter === btn.key && <motion.div layoutId="task-filter-pill" className="absolute inset-0 bg-cyan-500/20 border border-cyan-500 rounded-lg" />}
                            <span className="relative z-10">{btn.label} ({counts[btn.key]})</span>
                        </button>
                    ))}
                </div>
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredAssignments.length > 0 ? (
                            filteredAssignments.map((assignment) => (
                                <AssignmentCard key={assignment.id} assignment={assignment} onStart={() => startAssignment(assignment)} />
                            ))
                        ) : (
                            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="md:col-span-2 xl:col-span-3 text-center py-16">
                                <Inbox size={56} className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                                <h3 className="text-xl font-bold text-white">لا توجد مهام في هذا التصنيف</h3>
                                <p className="text-gray-400">يبدو أنك أنجزت كل شيء هنا!</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
};

export default MyTasks;