import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Cookies } from "react-cookie";
import axios from "../../api/axios"; // Corrected Path
import * as THREE from "three";
import { toast } from "react-hot-toast";
import Loading from "../../Components/Loading";
import { BookCopy, Users, Edit, Camera, X } from "lucide-react"; // All icons imported

const TeacherProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        bio: '',
        experienceYears: 0,
    });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const queryClient = useQueryClient(); // Correctly initialized

    const cookies = new Cookies();
    const token = cookies.get("token");

    // --- Data Fetching ---
    const fetchTeacherData = async () => {
        const { data } = await axios.get(`/api/Teacher/getTeacherByid`, { headers: { Authorization: `Bearer ${token}` } });
        return data;
    };

    const { data: teacher, isLoading, isError } = useQuery({
        queryKey: ["teacherProfile"],
        queryFn: fetchTeacherData,
        enabled: !!token,
    });

    // --- Populate form when data loads or editing is cancelled ---
    useEffect(() => {
        if (teacher) {
            setFormData({
                firstName: teacher.firstName || '',
                lastName: teacher.lastName || '',
                phone: teacher.phone || '',
                bio: teacher.bio || '',
                experienceYears: teacher.experienceYears || 0,
            });
            setImagePreview(teacher.path || '');
            setProfileImage(null);
        }
    }, [teacher, isEditing]);


    // --- Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // useEffect will reset the form state
    };

    const handleSave = async () => {
        const updateToast = toast.loading("جاري حفظ التعديلات...");
        const dataPayload = new FormData();
        
        dataPayload.append('FirstName', formData.firstName);
        dataPayload.append('LastName', formData.lastName);
        dataPayload.append('Phone', formData.phone);
        dataPayload.append('Bio', formData.bio);
        dataPayload.append('ExperienceYears', formData.experienceYears);
        if (profileImage) {
            dataPayload.append('ProfileImage', profileImage);
        }

        try {
            await axios.put('/api/Teacher/updateProfile', dataPayload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            
            await queryClient.invalidateQueries({ queryKey: ['teacherProfile'] });
            
            toast.success("تم تحديث الملف الشخصي بنجاح!", { id: updateToast });
            setIsEditing(false);

        } catch (error) {
            toast.error("فشل في حفظ التعديلات.", { id: updateToast });
            console.error("Profile update error:", error);
        }
    };

    // --- Three.js Effect ---
    useEffect(() => {
        // ... (Your Three.js setup code goes here if needed)
    }, []);

    if (isLoading) return <Loading />;
    if (isError) return <div className="p-8 text-center text-red-400">حدث خطأ في تحميل بيانات الملف الشخصي.</div>;
    if (!teacher) return <div className="p-8 text-center">لا توجد بيانات.</div>;


    return (
        <div className="text-gray-100 font-[Cairo] p-4 sm:p-6 lg:p-8 h-full">
            <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-black" />
            <div className="max-w-7xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-white" style={{ textShadow: "0 0 15px rgba(0, 191, 255, 0.7)" }}>
                        الملف الشخصي
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- Left Side: Profile Card --- */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10 text-center">
                            <div className="relative w-40 h-40 mx-auto">
                                <img src={imagePreview || 'https://placehold.co/160x160/000000/FFF?text=User'} alt="الملف الشخصي" className="w-40 h-40 rounded-full border-4 border-cyan-500/30 object-cover" />
                                {isEditing && (
                                    <button onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                                        <Camera size={32} />
                                        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                    </button>
                                )}
                            </div>
                            <h2 className="text-3xl font-bold text-white mt-6">{teacher.firstName} {teacher.lastName}</h2>
                            <p className="text-cyan-400 font-semibold">{teacher.subject || 'مدرس'}</p>
                            
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} className="w-full mt-8 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold transition-all transform hover:scale-105">
                                    <Edit size={18} /> تعديل الملف الشخصي
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-4 text-center">
                                <BookCopy className="mx-auto text-cyan-400 mb-2" size={28}/>
                                <p className="text-2xl font-bold">{teacher.coursesCount || 0}</p>
                                <p className="text-sm text-slate-400">كورس</p>
                            </div>
                             <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-4 text-center">
                                <Users className="mx-auto text-cyan-400 mb-2" size={28}/>
                                <p className="text-2xl font-bold">{teacher.studentsCount || 0}</p>
                                <p className="text-sm text-slate-400">طالب</p>
                            </div>
                        </div>
                    </div>

                    {/* --- Right Side: Details Panel --- */}
                    <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
                        {isEditing ? (
                            // --- Edit Mode ---
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white border-b-2 border-cyan-400/20 pb-2">تعديل البيانات الأساسية</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div><label className="block text-slate-300 mb-2 font-semibold">الاسم الأول</label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full input-style" /></div>
                                    <div><label className="block text-slate-300 mb-2 font-semibold">الاسم الأخير</label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full input-style" /></div>
                                </div>
                                <div><label className="block text-slate-300 mb-2 font-semibold">رقم الهاتف</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full input-style" /></div>
                                <div><label className="block text-slate-300 mb-2 font-semibold">سنوات الخبرة</label><input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleInputChange} className="w-full input-style" /></div>
                                <div><label className="block text-slate-300 mb-2 font-semibold">نبذة تعريفية</label><textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="5" className="w-full input-style resize-none" /></div>
                                <div className="flex justify-end gap-4 pt-4 border-t border-slate-700/50">
                                    <button onClick={handleCancel} className="px-6 py-2 rounded-lg bg-slate-700 text-white font-bold hover:bg-slate-600 transition">إلغاء</button>
                                    <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition">حفظ التعديلات</button>
                                </div>
                            </div>
                        ) : (
                            // --- View Mode ---
                            <div className="space-y-6">
                                <div className="pb-4 border-b border-slate-700/50">
                                    <h3 className="text-xl font-bold text-cyan-400">البريد الإلكتروني</h3>
                                    <p className="text-lg text-slate-300">{teacher.email}</p>
                                </div>
                                <div className="pb-4 border-b border-slate-700/50">
                                    <h3 className="text-xl font-bold text-cyan-400">رقم الهاتف</h3>
                                    <p className="text-lg text-slate-300">{teacher.phone || 'لم يتم إضافته'}</p>
                                </div>
                                <div className="pb-4 border-b border-slate-700/50">
                                    <h3 className="text-xl font-bold text-cyan-400">سنوات الخبرة</h3>
                                    <p className="text-lg text-slate-300">{teacher.experienceYears || 0} سنوات</p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-cyan-400">نبذة تعريفية</h3>
                                    <p className="text-lg text-slate-300 whitespace-pre-wrap mt-2">{teacher.bio || 'لا توجد نبذة تعريفية.'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherProfile;