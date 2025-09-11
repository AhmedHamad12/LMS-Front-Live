import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../Components/Loading";
import { ArrowLeft, Search, CheckCircle, Clock, FileText, UserCheck, Percent, Download, AlertCircle } from "lucide-react";
import dayjs from "dayjs";

// Helper Component for Stats Cards (Full Implementation)
const StatCard = ({ icon, label, value }) => (
    <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-800/60 rounded-lg">{icon}</div>
            <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="text-2xl font-black text-white">{value}</p>
            </div>
        </div>
    </div>
);

// Map for submission statuses
const statusMap = {
    graded: { text: "تم التصحيح", icon: <CheckCircle size={16} />, className: "bg-green-500/20 text-green-300" },
    ungraded: { text: "يحتاج تصحيح", icon: <Clock size={16} />, className: "bg-cyan-500/20 text-cyan-300" },
    late: { text: "متأخر", icon: <AlertCircle size={16} />, className: "bg-yellow-500/20 text-yellow-300" },
};

const AssignmentSubmissions = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const cookies = new Cookies();
    const token = cookies.get("token");

    // Fetching real data
    const fetchSubmissions = async () => {
        try {
            const response = await axios.get(`/api/SubmitedAssignment/GetSubmitedAssignments`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { assignmentId }
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return []; // Return empty array if no submissions found
            }
            throw error;
        }
    };

    const { data: submissions = [], isLoading, isError } = useQuery({
        queryKey: ["assignmentSubmissions", assignmentId],
        queryFn: fetchSubmissions,
        enabled: !!assignmentId,
    });

    // TODO: You still need an endpoint to get the main assignment's details.
    const [assignmentDetails, setAssignmentDetails] = useState({
        title: "واجب يتم تحميله...",
        dueDate: dayjs().add(3, 'day').toISOString(),
        totalStudents: "..."
    });

    const filteredSubmissions = useMemo(() => {
        return submissions
            .filter(sub => search === '' || (sub.studentName && sub.studentName.toLowerCase().includes(search.toLowerCase())));
    }, [submissions, search]);


    if (isLoading) return <Loading />;
    if (isError) return <div className="text-red-400 text-center p-10">حدث خطأ في تحميل التسليمات.</div>;

    return (
        <div className="text-gray-100 font-[Cairo] p-4 sm:p-6 lg:p-8 h-full">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <button onClick={() => navigate("/teacher/assignments")} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition font-semibold mb-4">
                        <ArrowLeft size={20} />
                        <span>العودة لجميع الواجبات</span>
                    </button>
                    <h1 className="text-4xl font-black text-white" style={{ textShadow: "0 0 15px rgba(0, 191, 255, 0.7)" }}>
                        تسليمات الواجب
                    </h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    <StatCard icon={<UserCheck size={28} className="text-cyan-400"/>} label="إجمالي التسليمات" value={submissions.length} />
                    <StatCard icon={<CheckCircle size={28} className="text-green-400"/>} label="تم تصحيحها" value="N/A" />
                    <StatCard icon={<Clock size={28} className="text-yellow-400"/>} label="تحتاج تصحيح" value="N/A" />
                    <StatCard icon={<Percent size={28} className="text-purple-400"/>} label="متوسط الدرجات" value="N/A" />
                </div>

                <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full">
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
                            {filteredSubmissions.length > 0 ? (
                                filteredSubmissions.map((sub) => (
                                    <tr key={sub.assignmentId} className="border-b border-slate-800 hover:bg-cyan-500/5">
                                        <td className="p-4 flex items-center gap-3">
                                            <img src={`https://placehold.co/40x40/ffffff/000000?text=${sub.studentName.charAt(0)}`} className="w-10 h-10 rounded-full" alt={sub.studentName} />
                                            <span className="font-bold">{sub.studentName}</span>
                                        </td>
                                        <td className="p-4"><span>{dayjs(sub.submissionDate).format('YYYY/MM/DD hh:mm A')}</span></td>
                                        <td className="p-4">
                                            {sub.files ? (
                                                <a href={sub.files} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
                                                    <Download size={16}/> تحميل الملف
                                                </a>
                                            ) : (
                                                <span className="text-slate-500">لا يوجد ملف</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 rounded-full flex items-center gap-2 text-xs font-bold bg-cyan-500/20 text-cyan-300">
                                                <Clock size={16} /> يحتاج تصحيح
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono font-bold">—</td>
                                        <td className="p-4">
                                            <button className="px-4 py-2 text-sm rounded-lg bg-cyan-500/80 hover:bg-cyan-500 text-white font-bold transition">
                                                تصحيح ومراجعة
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-16 text-slate-400">
                                        <FileText size={48} className="mx-auto text-slate-600 mb-4" />
                                        <h3 className="text-xl font-bold text-white">لا توجد تسليمات لهذا الواجب بعد</h3>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AssignmentSubmissions;