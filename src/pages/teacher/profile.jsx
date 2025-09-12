import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Cookies } from "react-cookie";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom"; // تم التأكد من وجودها

import Loading from "../../Components/Loading";
import { BookCopy, Users, Edit, Camera, Save, X, Check, BookOpen, GraduationCap, PlusCircle, ServerCrash } from "lucide-react";

import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// --- دالة مساعدة لقص الصور (بدون تغيير) ---
function getCroppedImg(image, crop, fileName) { /* ... */ const canvas = document.createElement('canvas'); const scaleX = image.naturalWidth / image.width; const scaleY = image.naturalHeight / image.height; canvas.width = crop.width; canvas.height = crop.height; const ctx = canvas.getContext('2d'); ctx.drawImage( image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height ); return new Promise((resolve) => { canvas.toBlob(blob => { if (!blob) { console.error("Canvas is empty"); return; } blob.name = fileName; resolve(blob); }, 'image/jpeg'); });}

// --- خريطة لترجمة السنة الدراسية ---
const studyYearMap = {
  1: 'الصف الأول الثانوي',
  2: 'الصف الثاني الثانوي',
  3: 'الصف الثالث الثانوي',
};

// --- مكونات مساعدة ---

const StatCard = ({ icon, value, label }) => (
    <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-4 text-center">
        {icon}
        <p className="text-2xl font-bold mt-2">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
    </div>
);

const CourseCard = ({ course, index, onManageClick }) => { // تم إضافة onManageClick
    const variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { delay: index * 0.1 } },
    };
    return (
        <motion.div variants={variants} className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <div className="h-40 bg-slate-800">
                <img 
                    src={course.courseImage} 
                    alt={course.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => e.target.style.display = 'none'}
                />
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <h4 className="font-bold text-lg text-white mb-1 truncate" title={course.title}>{course.title}</h4>
                <p className="text-sm text-slate-400 mb-4 h-10 overflow-hidden">{course.description}</p>
                {/* --- التعديل هنا: إضافة السنة الدراسية --- */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400 text-sm mt-auto pt-4 border-t border-slate-700/50">
                    <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                        <GraduationCap size={16} />
                        {studyYearMap[course.studyYear] || 'سنة غير محددة'}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Users size={16} />
                        {course.stats?.studentsCount || 0} طالب مسجل
                    </span>
                </div>
            </div>
             <div className="p-4 bg-slate-900/60 border-t border-cyan-400/10">
                {/* --- التعديل هنا: تفعيل الزر --- */}
                <button onClick={onManageClick} className="w-full px-4 py-2 text-sm rounded-lg bg-cyan-500/80 hover:bg-cyan-500 text-white font-bold transition">
                    إدارة الكورس
                </button>
            </div>
        </motion.div>
    );
};

const CourseSkeleton = () => (
    <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl shadow-lg overflow-hidden animate-pulse">
        <div className="h-40 bg-slate-800"></div>
        <div className="p-5">
            <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/3"></div>
        </div>
        <div className="p-4 bg-slate-900/60 border-t border-cyan-400/10">
             <div className="h-10 bg-slate-700 rounded w-full"></div>
        </div>
    </div>
);

// --- المكون الرئيسي ---
export default function MyTeacherProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [imagePreview, setImagePreview] = useState('');
    const [croppedImageBlob, setCroppedImageBlob] = useState(null);
    const [originalImageSrc, setOriginalImageSrc] = useState(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);
    const fileInputRef = useRef(null);

    const queryClient = useQueryClient();
    const cookies = new Cookies();
    const token = cookies.get("token");
    const navigate = useNavigate(); // تم استدعاء useNavigate

    // --- جلب بيانات المدرس ---
    const { data: teacher, isLoading: isLoadingTeacher, isError: isErrorTeacher } = useQuery({
        queryKey: ["teacherProfile"],
        queryFn: async () => {
            const { data } = await axios.get(`/api/Teacher/getTeacherByid`, { headers: { Authorization: `Bearer ${token}` } });
            return data;
        },
        enabled: !!token,
    });
    
    // --- جلب بيانات كورسات المدرس ---
    const { data: coursesData, isLoading: isLoadingCourses, isError: isErrorCourses } = useQuery({
        queryKey: ["teacherCourses"],
        queryFn: async () => {
            const { data } = await axios.get(`/api/teacher/courses`, { headers: { Authorization: `Bearer ${token}` } });
            return {
                items: Array.isArray(data.items) ? data.items : [],
                total: data.total || 0
            };
        },
        enabled: !!token,
        initialData: { items: [], total: 0 }
    });

    // ... (باقي الدوال والـ hooks لم تتغير) ...
    useEffect(() => { if (teacher) { setFormData({ firstName: teacher.firstName || '', lastName: teacher.lastName || '', phone: teacher.phone || '', subject: teacher.subject || '', experienceYears: teacher.experienceYears || 0, }); setImagePreview(teacher.path || `https://placehold.co/160x160/0f172a/38bdf8?text=${teacher.firstName.charAt(0)}`); setCroppedImageBlob(null); setNewPassword(""); setConfirmPassword(""); } }, [teacher, isEditing]);
    const mutation = useMutation({ mutationFn: (dataPayload) => axios.put('/api/Teacher/updateTeacher', dataPayload, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['teacherProfile', 'teacherProfileData'] }); toast.success("تم تحديث الملف الشخصي بنجاح!"); setIsEditing(false); }, onError: (error) => toast.error(error.response?.data?.message || "فشل في حفظ التعديلات."), });
    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const onSelectFile = (e) => { if (e.target.files && e.target.files.length > 0) { const reader = new FileReader(); reader.addEventListener('load', () => setOriginalImageSrc(reader.result?.toString() || '')); reader.readAsDataURL(e.target.files[0]); setIsCropperOpen(true); } };
    function onImageLoad(e) { const { width, height } = e.currentTarget; const crop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height); setCrop(crop); }
    const handleCropConfirm = async () => { if (completedCrop?.width && completedCrop?.height && imgRef.current) { const croppedBlob = await getCroppedImg(imgRef.current, completedCrop, 'teacher-image.jpg'); setCroppedImageBlob(croppedBlob); setImagePreview(URL.createObjectURL(croppedBlob)); setIsCropperOpen(false); } };
    const handleSave = () => { if (newPassword !== confirmPassword) { toast.error("كلمات المرور الجديدة غير متطابقة."); return; } const dataPayload = new FormData(); dataPayload.append('FirstName', formData.firstName); dataPayload.append('LastName', formData.lastName); dataPayload.append('DisplayName', `${formData.firstName} ${formData.lastName}`); dataPayload.append('Phone', formData.phone); dataPayload.append('ExperienceYears', formData.experienceYears); if (newPassword) { dataPayload.append('NewPassword', newPassword); } if (croppedImageBlob) { dataPayload.append('TeacherImage', croppedImageBlob); } mutation.mutate(dataPayload); };


    if (isLoadingTeacher) return <Loading message="جاري تحميل ملفك الشخصي..." />;
    if (isErrorTeacher || !teacher) return <div className="p-8 text-center text-red-400">حدث خطأ في تحميل بيانات الملف الشخصي.</div>;

    const inputStyle = "w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 placeholder-gray-500 transition-colors focus:border-cyan-400 focus:outline-none";

    return (
        <>
            {isCropperOpen && ( <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0a0a19] border border-white/10 rounded-2xl p-6 w-full max-w-lg"><h3 className="text-xl font-bold mb-4 text-center">حدد صورتك الشخصية</h3>{originalImageSrc && ( <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1} minWidth={150} circularCrop={true}><img ref={imgRef} alt="Crop me" src={originalImageSrc} onLoad={onImageLoad} style={{maxHeight: '70vh'}}/></ReactCrop> )}<div className="flex items-center justify-center gap-4 mt-6"><button onClick={() => setIsCropperOpen(false)} className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">إلغاء</button><button onClick={handleCropConfirm} className="px-6 py-2 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors flex items-center gap-2"><Check size={18}/> تأكيد</button></div></motion.div></div> )}

            <div className="text-gray-100 font-[Cairo] p-4 sm:p-6 lg:p-8 h-full">
                <Helmet><title>ملفي الشخصي - {teacher.firstName}</title></Helmet>
                <div className="max-w-7xl mx-auto">
                    <header className="mb-10 flex items-center justify-between">
                         <h1 className="text-4xl font-black text-white" style={{ textShadow: "0 0 15px rgba(0, 191, 255, 0.7)" }}>الملف الشخصي</h1>
                         {!isEditing && ( <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold"><Edit size={18} /> تعديل</motion.button> )}
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10 text-center">
                                <div className="relative w-40 h-40 mx-auto group">
                                    <img src={imagePreview} alt="الملف الشخصي" className="w-40 h-40 rounded-full border-4 border-cyan-500/30 object-cover object-top" />
                                    {isEditing && ( <button onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Camera size={32} /><input type="file" ref={fileInputRef} onChange={onSelectFile} accept="image/*" className="hidden" /></button> )}
                                </div>
                                <h2 className="text-3xl font-bold text-white mt-6">{teacher.firstName} {teacher.lastName}</h2>
                                <p className="text-cyan-400 font-semibold">{teacher.subject}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <StatCard icon={<BookCopy className="mx-auto text-cyan-400 mb-1" size={28}/>} value={coursesData.total} label="كورس" />
                                <StatCard icon={<Users className="mx-auto text-cyan-400 mb-1" size={28}/>} value={teacher.uniqueStudentCount || 0} label="طالب" />
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
                            {isEditing ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                    {/* ... نموذج التعديل (لم يتغير) ... */}
                                    <h3 className="text-xl font-bold text-white border-b-2 border-cyan-400/20 pb-2">تعديل البيانات الأساسية</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-6"><div><label className="block text-slate-300 mb-2 font-semibold">الاسم الأول</label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className={inputStyle} /></div><div><label className="block text-slate-300 mb-2 font-semibold">الاسم الأخير</label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputStyle} /></div></div><div><label className="block text-slate-300 mb-2 font-semibold">رقم الهاتف</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputStyle} /></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-6"><div><label className="block text-slate-300 mb-2 font-semibold">سنوات الخبرة</label><input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleInputChange} className={inputStyle} min="0" /></div><div><label className="block text-slate-500 mb-2 font-semibold">المادة (غير قابلة للتغيير)</label><select name="subject" value={formData.subject || ""} className={`${inputStyle} appearance-none bg-slate-900/50 cursor-not-allowed text-slate-400`} disabled><option value="" disabled>{formData.subject || "..."}</option></select></div></div><div className="pt-4 border-t border-slate-700/50"><h3 className="text-lg font-bold text-white mb-2">تغيير كلمة المرور</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-6"><div><label className="block text-slate-400 mb-2 text-sm">كلمة المرور الجديدة</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputStyle} placeholder="اتركه فارغًا لعدم التغيير" /></div><div><label className="block text-slate-400 mb-2 text-sm">تأكيد كلمة المرور</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputStyle} /></div></div></div><div className="flex justify-end gap-4 pt-6"><button onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-lg bg-slate-700 text-white font-bold hover:bg-slate-600 transition">إلغاء</button><button onClick={handleSave} disabled={mutation.isPending} className="px-8 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 transition flex items-center gap-2 disabled:bg-gray-500 disabled:cursor-wait"><Save size={18}/> {mutation.isPending ? "جاري الحفظ..." : "حفظ"}</button></div>
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                    <div className="pb-4 border-b border-slate-700/50"><h3 className="text-lg font-bold text-cyan-400">البريد الإلكتروني</h3><p className="text-lg text-slate-200">{teacher.email}</p></div>
                                    <div className="pb-4 border-b border-slate-700/50"><h3 className="text-lg font-bold text-cyan-400">رقم الهاتف</h3><p className="text-lg text-slate-200">{teacher.phone || 'لم يتم إضافته'}</p></div>
                                    <div className="pb-4 border-b border-slate-700/50"><h3 className="text-lg font-bold text-cyan-400">المادة</h3><p className="text-lg text-slate-200">{teacher.subject || 'لم يتم تحديدها'}</p></div>
                                    <div className="pb-4"><h3 className="text-lg font-bold text-cyan-400">سنوات الخبرة</h3><p className="text-lg text-slate-200">{teacher.experienceYears || 0} سنوات</p></div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12">
                         <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-black text-white" style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.5)" }}>الكورسات الخاصة بي</h2>
                            {/* --- التعديل هنا: تفعيل الزر --- */}
                            <motion.button onClick={() => navigate('/teacher/addcourse')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-slate-800/70 border border-cyan-400/20 text-cyan-300 font-bold hover:bg-slate-700/70">
                                <PlusCircle size={18} /> إضافة كورس
                            </motion.button>
                        </div>

                        {isLoadingCourses && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <CourseSkeleton /> <CourseSkeleton /> <CourseSkeleton />
                            </div>
                        )}
                        
                        {isErrorCourses && (
                             <div className="bg-slate-900/50 border border-red-500/20 rounded-2xl p-12 text-center">
                                <ServerCrash size={48} className="mx-auto text-red-500/50 mb-4" />
                                <h3 className="text-xl font-bold text-white">حدث خطأ في تحميل الكورسات</h3>
                                <p className="text-slate-400 mt-2">يرجى المحاولة مرة أخرى لاحقاً.</p>
                            </div>
                        )}

                        {!isLoadingCourses && !isErrorCourses && coursesData.items.length === 0 && (
                            <div className="bg-slate-900/50 border border-cyan-400/10 rounded-2xl p-12 text-center">
                                <GraduationCap size={64} className="mx-auto text-cyan-500/40 mb-4" />
                                <h3 className="text-xl font-bold text-white">لم تقم بإضافة أي كورسات بعد</h3>
                                <p className="text-slate-400 mt-2">ابدأ الآن بإضافة أول كورس لك لتعرضه على الطلاب.</p>
                            </div>
                        )}

                        {!isLoadingCourses && !isErrorCourses && coursesData.items.length > 0 && (
                             <motion.div 
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                initial="hidden" animate="visible"
                                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                             >
                                {coursesData.items.map((course, index) => (
                                    <CourseCard 
                                        key={course.id || index} 
                                        course={course} 
                                        index={index} 
                                        // --- التعديل هنا: تمرير دالة التنقل ---
                                        onManageClick={() => navigate('/teacher/course/mange', { state: { courseId: course.id } })}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}