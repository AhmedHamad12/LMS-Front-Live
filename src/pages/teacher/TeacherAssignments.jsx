import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Loading from "../../Components/Loading";
import { Clock, FileDown, ShieldAlert, Edit, Trash2, ListChecks, FileWarning, AlertTriangle, X } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/ar';
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";


// Configure Day.js
dayjs.extend(relativeTime);
dayjs.locale('ar');

// --- Helper Components ---

const priorityMap = {
    1: { text: 'منخفضة', className: 'bg-green-900/50 text-green-300' },
    2: { text: 'متوسطة', className: 'bg-yellow-900/50 text-yellow-300' },
    3: { text: 'عالية', className: 'bg-red-900/50 text-red-400' }
};

const Countdown = ({ dueDate, now }) => {
    const isDue = dayjs(dueDate).isBefore(now);
    const fromNow = dayjs(dueDate).fromNow(true);

    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-2 ${isDue ? 'bg-slate-700 text-slate-300' : 'bg-cyan-900/50 text-cyan-300'}`}>
            <Clock size={14} />
            {isDue ? `انتهى منذ ${fromNow}` : `متبقٍ ${fromNow}`}
        </span>
    );
};

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, isLoading, assignmentTitle }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-slate-900 border border-red-500/20 rounded-2xl shadow-2xl w-full max-w-md p-6 text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-4">
                               <AlertTriangle className="h-8 w-8 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">هل أنت متأكد من الحذف؟</h3>
                            <p className="text-slate-400 mb-1">
                                أنت على وشك حذف الواجب: <br/> <strong className="text-red-300">{assignmentTitle}</strong>
                            </p>
                             <p className="text-sm text-yellow-400 bg-yellow-500/10 p-3 rounded-lg mt-4">
                                سيتم حذف جميع تسليمات الطلاب المرتبطة بهذا الواجب بشكل <strong className="font-bold">نهائي</strong>.
                                <br/>
                                <strong className="font-bold">لا يمكن التراجع عن هذا الإجراء.</strong>
                            </p>
                        </div>
                         <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={onClose} disabled={isLoading} className="px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold transition disabled:opacity-50">
                                إلغاء
                            </button>
                             <button onClick={onConfirm} disabled={isLoading} className="px-4 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition disabled:bg-red-800 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {isLoading ? "جاري الحذف..." : "نعم، قم بالحذف"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


const AssignmentCard = React.memo(({ assignment, isOpen, onToggle, onDelete, currentTime }) => {
    const navigate = useNavigate();
    const priority = priorityMap[assignment.assignmentPriority] || priorityMap[1];

    return (
        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-lg transition-all duration-300">
            <button onClick={onToggle} className="w-full flex items-center gap-4 p-5 text-start">
                <div className="flex-grow">
                    <h3 className="font-bold text-lg text-white">{assignment.assignmentDescription}</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-1">{assignment.courseName} / {assignment.lessonName}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-3">
                    <span className={`hidden sm:flex px-3 py-1 text-xs font-semibold rounded-full items-center gap-2 ${priority.className}`}><ShieldAlert size={14}/> {priority.text}</span>
                    <Countdown dueDate={assignment.dueDate} now={currentTime} />
                </div>
                <svg className={`w-6 h-6 text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-slate-700/50 p-5 space-y-4">
                            <div className="text-sm text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <p><span className="font-bold text-slate-400">تاريخ الإنشاء:</span> {dayjs(assignment.creationDate).format('YYYY/MM/DD')}</p>
                                <p><span className="font-bold text-slate-400">تاريخ التسليم:</span> {dayjs(assignment.dueDate).format('YYYY/MM/DD')}</p>
                            </div>
                            {assignment.files && (
                                <a href={assignment.files} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/70 text-cyan-300 font-semibold rounded-lg hover:bg-slate-700 transition-colors">
                                    <FileDown size={16}/> تحميل ملف الواجب
                                </a>
                            )}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700/50">
                                <button onClick={() => navigate(`/teacher/assignments/${assignment.id}/submissions`)} className="flex-1 flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-cyan-500/80 text-white font-bold hover:bg-cyan-500 transition-colors">
                                    <ListChecks size={18}/> عرض التسليمات
                                </button>
                                <button onClick={() => onDelete(assignment)} className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-red-500/20 text-red-300 font-bold hover:bg-red-500/30 transition-colors"><Trash2 size={16}/> حذف</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

// --- Main Component ---
const TeacherAssignments = () => {
    const [activeFilter, setActiveFilter] = useState("all");
    const [openAccordionId, setOpenAccordionId] = useState(null);
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState(null);
    
    const cookies = new Cookies();
    const token = cookies.get("token");
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(dayjs()), 60000);
        return () => clearInterval(timer);
    }, []);

    const { data: assignments = [], isLoading, isError } = useQuery({
        queryKey: ["teacherAssignments", token],
        queryFn: async () => {
            try {
                const response = await axios.get(`/api/Assignment/GetAssignmentsForTeacher`, { headers: { Authorization: `Bearer ${token}` } });
                return response.data;
            } catch (error) {
                if (error.response?.status === 404) {
                    return [];
                }
                throw error;
            }
        },
        enabled: !!token,
    });
    
    // --- Delete Mutation ---
    const deleteMutation = useMutation({
        mutationFn: (assignmentId) => {
            return axios.delete(`/api/Assignment/DeleteAssignment/${assignmentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => {
            toast.success("تم حذف الواجب بنجاح!");
            // Invalidate and refetch the assignments list
            queryClient.invalidateQueries({ queryKey: ["teacherAssignments"] });
            setIsDeleteModalOpen(false);
            setAssignmentToDelete(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف الواجب.");
            setIsDeleteModalOpen(false);
            setAssignmentToDelete(null);
        }
    });

    const handleDeleteClick = useCallback((assignment) => {
        setAssignmentToDelete(assignment);
        setIsDeleteModalOpen(true);
    }, []);

    const handleConfirmDelete = () => {
        if (assignmentToDelete) {
            deleteMutation.mutate(assignmentToDelete.id);
        }
    };

    const filteredAssignments = useMemo(() => { /* ... (no changes here) ... */ const now = dayjs(); if (activeFilter === "new") { return assignments.filter(a => now.isBefore(dayjs(a.dueDate))); } if (activeFilter === "ended") { return assignments.filter(a => now.isAfter(dayjs(a.dueDate))); } return assignments; }, [assignments, activeFilter]);
    const counts = useMemo(() => { /* ... (no changes here) ... */ const now = dayjs(); return { all: assignments.length, new: assignments.filter(a => now.isBefore(dayjs(a.dueDate))).length, ended: assignments.filter(a => now.isAfter(dayjs(a.dueDate))).length }; }, [assignments]);

    if (isLoading) return <Loading message="جاري تحميل الواجبات..." />;
    if (isError) return <div className="text-red-400 text-center p-8">حدث خطأ أثناء تحميل الواجبات.</div>;

    return (
        <div className="text-gray-100 font-[Cairo] p-4 sm:p-6 lg:p-8 h-full">
             <Toaster position="bottom-center" toastOptions={{ className: 'font-[Cairo] font-bold', style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #38bdf8' }, }} />
            <div className="max-w-4xl mx-auto">
                <header> {/* ... (no changes here) ... */  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10"><div><h1 className="text-4xl font-black text-white mb-2" style={{ textShadow: "0 0 15px rgba(0, 191, 255, 0.7)" }}>إدارة الواجبات</h1><p className="text-slate-400 text-lg">قم بإنشاء ومراجعة الواجبات والتسليمات الخاصة بالطلاب.</p></div></div>} </header>

                <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-4 mb-8 flex items-center gap-4 sticky top-4 z-10">
                    {/* ... (Filter buttons with no changes) ... */ <h3 className="font-bold text-white flex-shrink-0">فلترة حسب:</h3>} <div className="flex items-center gap-2 overflow-x-auto pb-2"><button onClick={() => setActiveFilter('all')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex-shrink-0 ${activeFilter === 'all' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-300 bg-slate-700/50 hover:bg-slate-700'}`}>الكل ({counts.all})</button><button onClick={() => setActiveFilter('new')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex-shrink-0 ${activeFilter === 'new' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-300 bg-slate-700/50 hover:bg-slate-700'}`}>الجديدة ({counts.new})</button><button onClick={() => setActiveFilter('ended')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex-shrink-0 ${activeFilter === 'ended' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-300 bg-slate-700/50 hover:bg-slate-700'}`}>المنتهية ({counts.ended})</button></div>
                </div>

                {filteredAssignments.length === 0 ? (
                    <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-12 text-center shadow-xl">
                        <FileWarning size={64} className="mx-auto text-cyan-500/40 mb-4" />
                        <h3 className="text-xl font-bold text-white">لا توجد واجبات تطابق هذا الفلتر</h3>
                        <p className="text-slate-400 mt-2">حاول تغيير الفلتر أو قم بإضافة واجب جديد.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredAssignments.map((assignment) => (
                            <AssignmentCard
                                key={assignment.id}
                                assignment={assignment}
                                isOpen={openAccordionId === assignment.id}
                                onToggle={() => setOpenAccordionId(prevId => prevId === assignment.id ? null : assignment.id)}
                                onDelete={handleDeleteClick}
                                currentTime={currentTime}
                            />
                        ))}
                    </div>
                )}
            </div>
             <ConfirmDeleteModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isLoading}
                assignmentTitle={assignmentToDelete?.assignmentDescription}
            />
        </div>
    );
};

export default TeacherAssignments;