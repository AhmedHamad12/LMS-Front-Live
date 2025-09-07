import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import { useNavigate } from "react-router-dom"; // 1. تم استيراد useNavigate
import Loading from "../../Components/Loading";
import { Clock, FileDown, ShieldAlert, Edit, Trash2, ListChecks, FileWarning } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/ar'; // for Arabic localization

// Configure Day.js
dayjs.extend(relativeTime);
dayjs.locale('ar');

const priorityMap = {
    1: { text: 'منخفضة', className: 'bg-green-500/20 text-green-300' },
    2: { text: 'متوسطة', className: 'bg-yellow-500/20 text-yellow-300' },
    3: { text: 'عالية', className: 'bg-red-500/20 text-red-400' }
};

const Countdown = ({ dueDate }) => {
    const [now, setNow] = useState(dayjs());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(dayjs());
        }, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const isDue = dayjs(dueDate).isBefore(now);
    const fromNow = dayjs(dueDate).fromNow();

    return (
        <span className={`flex items-center gap-2 text-sm font-semibold ${isDue ? 'text-slate-400' : 'text-cyan-300'}`}>
            <Clock size={16} />
            {isDue ? `انتهى ${fromNow}` : `ينتهي ${fromNow}`}
        </span>
    );
};

const TeacherAssignments = () => {
    const [activeFilter, setActiveFilter] = useState("all");
    const [openAccordionId, setOpenAccordionId] = useState(null);

    const cookies = new Cookies();
    const token = cookies.get("token");
    const navigate = useNavigate(); // 2. تم تعريف useNavigate

    const getAssignments = async () => {
        const response = await axios.get(`/api/Assignment/GetAssignmentsForTeacher`, { headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    };

    const { data: assignments = [], isLoading } = useQuery({
        queryKey: ["teacherAssignments", token],
        queryFn: getAssignments,
        enabled: !!token,
    });

    const filteredAssignments = useMemo(() => {
        if (activeFilter === "new") {
            return assignments.filter(a => dayjs().isBefore(dayjs(a.dueDate)));
        }
        if (activeFilter === "ended") {
            return assignments.filter(a => dayjs().isAfter(dayjs(a.dueDate)));
        }
        return assignments;
    }, [assignments, activeFilter]);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="text-gray-100 font-[Cairo] p-4 sm:p-6 lg:p-8 h-full">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-black text-white mb-2" style={{ textShadow: "0 0 15px rgba(0, 191, 255, 0.7)" }}>
                        قائمة الواجبات
                    </h1>
                    <p className="text-slate-400 text-lg">
                        تابع الواجبات المرسلة للطلاب وقم بإدارتها.
                    </p>
                </header>

                <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-4 mb-8 flex items-center gap-4 sticky top-4 z-10">
                    <h3 className="font-bold text-white">فلترة حسب:</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setActiveFilter('all')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeFilter === 'all' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-300 bg-slate-700/50 hover:bg-slate-700'}`}>الكل ({assignments.length})</button>
                        <button onClick={() => setActiveFilter('new')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeFilter === 'new' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-300 bg-slate-700/50 hover:bg-slate-700'}`}>الجديدة</button>
                        <button onClick={() => setActiveFilter('ended')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeFilter === 'ended' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-300 bg-slate-700/50 hover:bg-slate-700'}`}>المنتهية</button>
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredAssignments.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900/50 rounded-2xl">
                            <FileWarning size={64} className="mx-auto text-cyan-500/50 mb-4" />
                            <h3 className="text-2xl font-bold text-white">لا توجد واجبات تطابق هذا الفلتر</h3>
                            <p className="text-slate-400 mt-2">حاول اختيار فلتر مختلف أو قم بإضافة واجب جديد.</p>
                        </div>
                    ) : (
                        filteredAssignments.map((assignment) => {
                            const isOpen = openAccordionId === assignment.id;
                            const priority = priorityMap[assignment.assignmentPriority] || priorityMap[1];
                            return (
                                <div key={assignment.id} className="bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-lg transition-all duration-300">
                                    <button onClick={() => setOpenAccordionId(isOpen ? null : assignment.id)} className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 text-start">
                                        <div className="flex-grow">
                                            <p className="text-xs text-cyan-300 font-semibold">{assignment.courseName} / {assignment.lessonName}</p>
                                            <h3 className="font-bold text-lg text-white mt-1">{assignment.assignmentDescription}</h3>
                                        </div>
                                        <div className="flex-shrink-0 flex items-center gap-3 text-xs font-semibold w-full sm:w-auto">
                                            <span className={`px-3 py-1 rounded-full flex items-center gap-2 ${priority.className}`}><ShieldAlert size={14}/> {priority.text}</span>
                                            <Countdown dueDate={assignment.dueDate} />
                                        </div>
                                        <svg className={`w-6 h-6 text-slate-400 transition-transform duration-300 flex-shrink-0 self-center ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </button>

                                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[300px]' : 'max-h-0'}`}>
                                        <div className="border-t border-slate-700/50 p-5 space-y-4">
                                            <div className="text-sm text-slate-300 grid grid-cols-2 gap-2">
                                                <p><span className="font-bold text-slate-400">تاريخ الإنشاء:</span> {dayjs(assignment.creationDate).format('YYYY/MM/DD')}</p>
                                                <p><span className="font-bold text-slate-400">تاريخ التسليم:</span> {dayjs(assignment.dueDate).format('YYYY/MM/DD')}</p>
                                            </div>
                                            {assignment.files && (
                                                <a href={assignment.files} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/70 text-cyan-300 font-semibold rounded-lg hover:bg-slate-700 transition-colors">
                                                    <FileDown size={16}/> تحميل ملف الواجب
                                                </a>
                                            )}
                                            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-700/50">
                                                {/* --- 3. هذا هو الزر الذي تم إصلاحه --- */}
                                                <button 
                                                    onClick={() => navigate(`/teacher/assignments/${assignment.id}/submissions`)}
                                                    className="w-full flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-cyan-500/80 text-white font-bold hover:bg-cyan-500 transition-colors">
                                                    <ListChecks size={18}/> عرض التسليمات
                                                </button>
                                                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-slate-700/80 text-white font-bold hover:bg-slate-600/80 transition-colors"><Edit size={16}/> تعديل</button>
                                                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-red-500/20 text-red-300 font-bold hover:bg-red-500/30 transition-colors"><Trash2 size={16}/> حذف</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherAssignments;