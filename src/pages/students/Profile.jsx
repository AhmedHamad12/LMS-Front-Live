import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Cookies } from "react-cookie";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import Loading from "../../Components/Loading";
// تم التأكد من استيراد كل الأيقونات المطلوبة بما في ذلك Users
import { Award, Star, BookCheck, Clock, RefreshCw, ArrowLeft, Bell, User, Users, Mail, Lock, Edit, Save, ShoppingCart, AlertCircle } from "lucide-react";

// --- مكون فرعي لبطاقة الإحصائيات ---
const StatCard = ({ icon, title, value, colorClass }) => (
    <div className="glass-effect p-6 rounded-2xl flex items-center gap-4">
        <div className={`w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center ${colorClass.bg}`}>
            {React.cloneElement(icon, { className: colorClass.icon })}
        </div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-black text-white">{value}</p>
        </div>
    </div>
);

// --- مكون فرعي لبطاقة الكورس ---
const CourseCard = ({ course }) => {
    const queryClient = useQueryClient();
    const cookies = new Cookies();
    const token = cookies.get("token");

    const renewSubscriptionMutation = useMutation({
        mutationFn: (courseId) => 
            axios.post(`/api/StudentCourse/Enroll?courseId=${courseId}`, { courseId }, { headers: { Authorization: `Bearer ${token}` } }),
        onSuccess: (response) => {
            if (response.data?.url) {
                toast.success("جارِ توجيهك للدفع...");
                window.location.href = response.data.url;
            } else {
                toast.success("تم تجديد الاشتراك بنجاح!");
                queryClient.invalidateQueries({ queryKey: ["myCompleteStudentProfile"] });
            }
        },
        onError: (error) => toast.error(error.response?.data?.message || "فشل تجديد الاشتراك.")
    });

    const isExpired = course.remainingDays <= 0 && !course.isActive;

    return (
        <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="glass-effect rounded-2xl overflow-hidden border border-white/10 h-full flex flex-col group"
        >
            <div className="relative">
                <img src={course.courseImage} alt={course.title} className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <span className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${isExpired ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {isExpired ? <Clock size={12}/> : <BookCheck size={12}/>}
                    {isExpired ? 'الاشتراك منتهي' : 'فعال'}
                </span>
                <h3 className="absolute bottom-4 right-4 text-2xl font-bold text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">{course.title}</h3>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-bold text-cyan-400">تقدمك</span>
                        <span className="text-gray-300 font-semibold">{Math.round(course.progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                    </div>
                </div>
                <p className="text-sm text-gray-400 mb-4">أكملت {course.completedLessons} من {course.totalLessons} درس</p>
                <div className="mt-auto pt-4 border-t border-white/10">
                    {isExpired ? (
                        <button onClick={() => renewSubscriptionMutation.mutate(course.id)} disabled={renewSubscriptionMutation.isPending} className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 text-base font-bold text-black transition-all hover:bg-cyan-400 hover:scale-105 disabled:bg-gray-600 disabled:cursor-wait">
                            <RefreshCw size={18} className={renewSubscriptionMutation.isPending ? 'animate-spin' : ''} />
                            {renewSubscriptionMutation.isPending ? 'لحظات...' : 'جدد اشتراكك'}
                        </button>
                    ) : (
                        <Link to={`/student/course/data/${course.id}`} className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-6 py-3 text-base font-bold text-white transition-all hover:bg-slate-600 hover:text-cyan-300">
                            متابعة التعلم <ArrowLeft size={20} />
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// --- المكون الرئيسي للصفحة ---
export default function MyStudentProfile() {
    const cookies = new Cookies();
    const token = cookies.get("token");
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const { data: profileData, isLoading, isError } = useQuery({
        queryKey: ["myCompleteStudentProfile"],
        queryFn: async () => {
            const [userRes, studentRes, coursesRes] = await Promise.all([
                axios.get("/api/Account/GetCurrentUser", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`/api/Student/getStudentById`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("/api/StudentCourse/MyCourses", { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            return {
                user: userRes.data,
                student: studentRes.data,
                courses: coursesRes.data,
            };
        },
        enabled: !!token,
        refetchOnWindowFocus: false,
    });
    
    useEffect(() => {
        if (profileData) {
            setFormData({
                displayName: profileData.user?.displayName || '',
                phone: profileData.student?.phone || '',
                parentName: profileData.student?.parentName || '',
                parentPhone: profileData.student?.parentPhone || '',
            });
            setNewPassword("");
            setConfirmPassword("");
        }
    }, [profileData, isEditing]);

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const updateProfileMutation = useMutation({
        mutationFn: (updatedData) =>
            axios.put("/api/Student/updateStudent", updatedData, {
                headers: { Authorization: `Bearer ${token}` },
            }),
        onSuccess: () => {
            toast.success("تم تحديث ملفك الشخصي بنجاح!");
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ["myCompleteStudentProfile"] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "فشل تحديث الملف الشخصي.");
        },
    });

    const handleSaveChanges = (e) => {
        e.preventDefault();
        if (newPassword && newPassword !== confirmPassword) {
            return toast.error("كلمات المرور الجديدة غير متطابقة.");
        }
        
        const payload = { ...formData };
        if (newPassword) {
            payload.newPassword = newPassword;
        }
        updateProfileMutation.mutate(payload);
    };

    if (isLoading) return <Loading message="جاري تحميل ملفك الشخصي..." />;
    if (isError) return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-4 text-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">حدث خطأ</h2>
            <p className="text-gray-400">لم نتمكن من تحميل بياناتك. يرجى المحاولة مرة أخرى.</p>
        </div>
    );
        
    const { user, student, courses } = profileData || {};
    const inputStyle = "w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 placeholder-gray-500 transition-colors focus:border-cyan-400 focus:outline-none";

    return (
        <div className="min-h-screen bg-black text-white font-[Cairo]" dir="rtl">
            <Helmet><title>ملفي الشخصي - {user?.displayName}</title></Helmet>

            <main className="container mx-auto px-4 py-8">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-8 glass-effect rounded-3xl flex flex-col md:flex-row items-center gap-6"
                >
                    <img src={user?.path || "/avatar.jpg"} alt="صورة المستخدم" className="h-32 w-32 rounded-full border-4 border-cyan-400/50 object-cover" />
                    <div className="text-center md:text-right">
                        <h1 className="text-4xl font-black text-white mb-1">{user?.displayName}</h1>
                        <p className="text-lg text-gray-400">{student?.studyYearName}</p>
                    </div>
                    <div className="mt-4 md:mt-0 md:mr-auto">
                        {!isEditing && (
                             <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 text-black font-bold">
                                <Edit size={18} /> تعديل بياناتي
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* --- عمود تعديل/عرض البيانات --- */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <div className="glass-effect rounded-2xl p-6 h-full">
                            <h2 className="text-2xl font-bold text-white mb-6">بياناتي الشخصية</h2>
                            {isEditing ? (
                                <form onSubmit={handleSaveChanges} className="space-y-6">
                                    <div><label className="block text-slate-300 mb-2 font-semibold">الاسم المعروض</label><input type="text" name="displayName" value={formData.displayName} onChange={handleInputChange} className={inputStyle} /></div>
                                    <div><label className="block text-slate-300 mb-2 font-semibold">رقم الهاتف</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputStyle} /></div>
                                    <div><label className="block text-slate-300 mb-2 font-semibold">اسم ولي الأمر</label><input type="text" name="parentName" value={formData.parentName} onChange={handleInputChange} className={inputStyle} /></div>
                                    <div><label className="block text-slate-300 mb-2 font-semibold">رقم هاتف ولي الأمر</label><input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleInputChange} className={inputStyle} /></div>
                                    <div className="pt-4 border-t border-slate-700/50">
                                        <h3 className="text-lg font-bold text-white mb-2">تغيير كلمة المرور</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div><label className="block text-slate-400 mb-2 text-sm">كلمة المرور الجديدة</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputStyle} placeholder="اتركه فارغًا" /></div>
                                            <div><label className="block text-slate-400 mb-2 text-sm">تأكيد كلمة المرور</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputStyle} /></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-4">
                                        <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-lg bg-slate-700 text-white font-bold hover:bg-slate-600 transition">إلغاء</button>
                                        <button type="submit" disabled={updateProfileMutation.isPending} className="px-8 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 transition flex items-center gap-2 disabled:bg-gray-500 disabled:cursor-wait"><Save size={18}/> {updateProfileMutation.isPending ? "جاري الحفظ..." : "حفظ"}</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4"><Mail size={20} className="text-cyan-400"/><p>{user?.email}</p></div>
                                    <div className="flex items-center gap-4"><User size={20} className="text-cyan-400"/><p>{student?.phone}</p></div>
                                    <div className="flex items-center gap-4"><Users size={20} className="text-cyan-400"/><p>{student?.parentName} (ولي الأمر)</p></div>
                                    <div className="flex items-center gap-4"><Users size={20} className="text-cyan-400"/><p>{student?.parentPhone} (هاتف ولي الأمر)</p></div>
                                    <div className="flex items-center gap-4"><Star size={20} className="text-yellow-400"/><p>{student?.score} نقطة</p></div>
                                    <div className="flex items-center gap-4"><Award size={20} className="text-purple-400"/><p>الترتيب: #{student?.rank}</p></div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* --- عمود الكورسات --- */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                         <div className="glass-effect rounded-2xl p-6 h-full">
                            <h2 className="text-2xl font-bold text-white mb-6">كورساتي المشترك بها</h2>
                            <div className="space-y-6 max-h-[40rem] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 pr-2">
                            {courses && courses.length > 0 ? (
                                courses.map(course => <CourseCard key={course.id} course={course} />)
                            ) : (
                                <div className="text-center py-10">
                                    <BookCheck size={40} className="mx-auto text-gray-500 mb-4" />
                                    <h3 className="text-lg font-bold text-white">لم تشترك في أي كورس بعد</h3>
                                    <p className="text-gray-400 mb-4 text-sm">ابدأ رحلتك التعليمية الآن!</p>
                                    <Link to="/student/allcourses" className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 font-bold text-black transition-all hover:bg-cyan-400 text-sm">
                                        <ShoppingCart size={18} />
                                        تصفح كل الكورسات
                                    </Link>
                                </div>
                            )}
                            </div>
                         </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}