import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Cookies } from "react-cookie";
import axios from "../../api/axios";
import Loading from "../../Components/Loading";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Award, Star, BookCheck, ShieldCheck, User, Mail, Phone, Lock, Bell } from "lucide-react";

// Lazy load the heavy 3D background for a massive performance boost
const StarfieldBackground = lazy(() => import('../../Components/StarfieldBackground')); // Adjust path if needed

// --- Helper Components ---
const StatCard = ({ icon, title, value, colorClass }) => (
    <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        className={`glass-effect p-6 rounded-2xl text-center border ${colorClass}`}
    >
        <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${colorClass.replace('border-', 'bg-').replace('/30', '/10')}`}>
            {icon}
        </div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-black text-white">{value}</p>
    </motion.div>
);

const ActivityItem = ({ item }) => (
    <div className="flex items-start gap-4 border-b border-white/5 pb-4 last:border-b-0">
        <div className="h-fit rounded-full bg-purple-500/20 p-3"><Bell size={20} className="text-purple-400" /></div>
        <div>
            <p className="font-bold text-white">{item.title}</p>
            <p className="text-sm text-gray-400">{item.message}</p>
            <p className="text-xs text-gray-500 mt-1">{item.timeAgo}</p>
        </div>
    </div>
);


// --- Main Profile Component ---
export default function Profile() {
    const mainContentRef = useRef(null);
    const cookies = new Cookies();
    const token = cookies.get("token");
    const queryClient = useQueryClient();

    const [displayName, setDisplayName] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const { data: profileData, isLoading: isProfileLoading } = useQuery({
        queryKey: ["studentProfileData"],
        queryFn: async () => {
            const [userRes, studentRes, scoreRes] = await Promise.all([
                axios.get("/api/Account/GetCurrentUser", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`/api/Student/getStudentById`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("/api/Student/GetStudentRankAndScore", { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            
            const studentId = scoreRes.data.id;
            const notificationsRes = studentId 
                ? await axios.get(`/api/Notification/student/${studentId}`, { headers: { Authorization: `Bearer ${token}` } }) 
                : { data: [] };

            return {
                user: userRes.data,
                student: studentRes.data,
                score: scoreRes.data,
                notifications: notificationsRes.data,
            };
        },
        onSuccess: (data) => {
            if (data?.user?.displayName) {
                setDisplayName(data.user.displayName);
            }
        },
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
            if (error.response?.status === 404) return false;
            return failureCount < 2;
        },
    });

    const updateProfileMutation = useMutation({
        mutationFn: (updatedData) =>
            axios.put("/api/Student/updateStudent", updatedData, {
                headers: { Authorization: `Bearer ${token}` },
            }),
        onSuccess: () => {
            toast.success("تم تحديث ملفك الشخصي بنجاح!");
            setNewPassword(""); // Clear password field
            queryClient.invalidateQueries({ queryKey: ["studentProfileData"] }); // Refetch data
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "فشل تحديث الملف الشخصي.");
        },
    });

    const handleSaveChanges = (e) => {
        e.preventDefault();
        const payload = {};
        if (displayName !== profileData?.user?.displayName) {
            payload.displayName = displayName;
        }
        if (newPassword) {
            payload.newPassword = newPassword;
        }
        if (Object.keys(payload).length > 0) {
            updateProfileMutation.mutate(payload);
        } else {
            toast.error("لم تقم بإجراء أي تغييرات.");
        }
    };

    if (isProfileLoading) {
        return <Loading message="جاري تحميل ملفك الشخصي..." />;
    }

    const { user, student, score, notifications } = profileData || {};

    return (
        <div className="min-h-screen text-gray-100" style={{ fontFamily: "Cairo, sans-serif" }}>
            <Helmet>
                <title>الملف الشخصي</title>
            </Helmet>
            <Suspense fallback={<div className="fixed inset-0 bg-black -z-10" />}>
                <StarfieldBackground mainContentRef={mainContentRef} />
            </Suspense>

            <main ref={mainContentRef} className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-black/20">
                <h1 className="mb-2 text-4xl font-black text-white title-glow">الملف الشخصي</h1>
                <p className="mb-8 text-lg text-gray-400">قم بإدارة بياناتك وتتبع إنجازاتك في المجرة.</p>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="mb-12 flex flex-col items-center gap-6 md:flex-row glass-effect p-8 rounded-3xl">
                        <img src={user?.path || "/avatar.jpg"} alt="صورة المستخدم" className="h-32 w-32 rounded-full border-4 border-cyan-400/50 object-cover" />
                        <div>
                            <h2 className="text-4xl font-black text-white mb-1">{user?.displayName}</h2>
                            <p className="text-lg text-gray-400">{student?.studyYearName}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-4"
                    initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } }, hidden: {} }}
                >
                    <StatCard icon={<Star size={24} className="text-yellow-400"/>} title="مجموع النقاط" value={score?.score || 0} colorClass="border-yellow-500/30" />
                    <StatCard icon={<Award size={24} className="text-cyan-400"/>} title="ترتيبك العام" value={`#${score?.rank || 'N/A'}`} colorClass="border-cyan-500/30" />
                    <StatCard icon={<BookCheck size={24} className="text-green-400"/>} title="كورسات مكتملة" value="0" colorClass="border-green-500/30" />
                    <StatCard icon={<ShieldCheck size={24} className="text-purple-400"/>} title="الأوسمة المحصلة" value="0" colorClass="border-purple-500/30" />
                </motion.div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <form onSubmit={handleSaveChanges} className="lg:col-span-1 space-y-4 rounded-2xl glass-effect p-6">
                         <h2 className="mb-2 text-2xl font-bold">تعديل البيانات</h2>
                        <div className="relative">
                            <User className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500" size={20} />
                            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/20 p-3 pr-10 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 focus:outline-none" />
                        </div>
                        <div className="relative">
                            <Mail className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500" size={20} />
                            <input type="email" value={user?.email} className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-black/30 p-3 pr-10 text-gray-500" disabled />
                        </div>
                        <div className="relative">
                            <Phone className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500" size={20} />
                            <input type="text" value={student?.phone} className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-black/30 p-3 pr-10 text-gray-500" disabled />
                        </div>
                        <div className="relative">
                             <Lock className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500" size={20} />
                            <input type="password" placeholder="•••••••• (اتركه فارغًا لعدم التغيير)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/20 p-3 pr-10 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 focus:outline-none" />
                        </div>
                        <button type="submit" disabled={updateProfileMutation.isPending} className="w-full rounded-lg bg-cyan-500 p-3 font-bold text-black transition-colors hover:bg-cyan-400 disabled:bg-gray-500 disabled:cursor-wait">
                            {updateProfileMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                        </button>
                    </form>

                    <div className="lg:col-span-2 space-y-6 rounded-2xl glass-effect p-6">
                        <h2 className="text-2xl font-bold">سجل النشاط الأخير</h2>
                        <div className="space-y-4 max-h-[22rem] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50 pr-2">
                             {notifications?.length > 0 ? (
                                notifications.map(item => <ActivityItem key={item.id} item={item} />)
                            ) : (
                                <p className="text-gray-400 text-center py-8">لا يوجد نشاط لعرضه حاليًا.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}