import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { Cookies } from "react-cookie";
import axios from "../../api/axios";
import { motion } from "framer-motion";

// أيقونات لتحسين التصميم
import { UploadCloud, X, Crop, Check } from "lucide-react";

// استيراد مكتبة قص الصور
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


// --- دالة مساعدة لقص الصورة (مهمة جداً) ---
function getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob(blob => {
            if (!blob) {
                console.error('Canvas is empty');
                return;
            }
            blob.name = fileName;
            resolve(blob);
        }, 'image/jpeg');
    });
}


export default function AddTeacher() {
    // --- State لإدارة الفورم ---
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [subject, setSubject] = useState("");
    const [experienceYears, setExperienceYears] = useState(0);
    const [loading, setLoading] = useState(false);

    // --- State لإدارة عملية رفع وقص الصور ---
    const [originalImageSrc, setOriginalImageSrc] = useState(null); // الصورة الأصلية التي يختارها المستخدم
    const [croppedImageBlob, setCroppedImageBlob] = useState(null); // الصورة المقصوصة الجاهزة للرفع
    const [croppedImagePreview, setCroppedImagePreview] = useState(null); // رابط معاينة الصورة المقصوصة
    const [isCropperOpen, setIsCropperOpen] = useState(false); // للتحكم في ظهور نافذة القص
    const [crop, setCrop] = useState(); // إحداثيات القص الحالية
    const [completedCrop, setCompletedCrop] = useState(null); // الإحداثيات النهائية بعد انتهاء المستخدم
    
    const imgRef = useRef(null);
    const fileInputRef = useRef(null);
    
    const { executeRecaptcha } = useGoogleReCaptcha();
    const navigate = useNavigate();
    const cookies = new Cookies();
    const userToken = cookies.get("token");

    // دالة عند اختيار المستخدم لملف الصورة
    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setOriginalImageSrc(reader.result.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
            setIsCropperOpen(true); // فتح نافذة القص
        }
    };

    // دالة عند تحميل الصورة داخل أداة القص
    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        // إنشاء مربع قص افتراضي 1:1 في المنتصف
        const crop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
            width, height
        );
        setCrop(crop);
    }
    
    // دالة تأكيد القص
    const handleCropConfirm = async () => {
        if (completedCrop?.width && completedCrop?.height && imgRef.current) {
            const croppedBlob = await getCroppedImg(imgRef.current, completedCrop, 'teacher-image.jpg');
            setCroppedImageBlob(croppedBlob);
            setCroppedImagePreview(URL.createObjectURL(croppedBlob));
            setIsCropperOpen(false); // إغلاق النافذة
        }
    };
    
    // دالة إزالة الصورة المختارة
    const clearImage = () => {
        setCroppedImageBlob(null);
        setCroppedImagePreview(null);
        setOriginalImageSrc(null);
        if(fileInputRef.current) fileInputRef.current.value = null;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!croppedImageBlob) {
            toast.error("يرجى رفع وقص الصورة الشخصية.");
            return;
        }
        setLoading(true);

        const captchaToken = await executeRecaptcha("add_teacher_details");

        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("phone", phone);
        formData.append("subject", subject);
        formData.append("experienceYears", experienceYears);
        formData.append("teacherImage", croppedImageBlob); // إرسال الصورة المقصوصة
        formData.append("captchaToken", captchaToken);
        // تم حذف حقل "path" لأنه يجب أن يتم إنشاؤه بواسطة الخادم

        try {
            await axios.post("/api/Teacher/addTeacher", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${userToken}`,
                },
            });

            toast.success("تم إرسال بياناتك بنجاح، سيتم مراجعتها.");
            navigate("/waiting");
        } catch (error) {
            toast.error(error?.response?.data?.message || "حدث خطأ أثناء إرسال البيانات.");
        } finally {
            setLoading(false);
        }
    };
    
    const inputClasses = "mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-3 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.2)] focus:outline-none";

    return (
        <>
            {/* --- نافذة قص الصور --- */}
            {isCropperOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#0a0a19] border border-white/10 rounded-2xl p-6 w-full max-w-lg"
                    >
                        <h3 className="text-xl font-bold mb-4 text-center">حدد صورتك الشخصية</h3>
                        {originalImageSrc && (
                            <ReactCrop
                                crop={crop}
                                onChange={c => setCrop(c)}
                                onComplete={c => setCompletedCrop(c)}
                                aspect={1} // نسبة 1:1 (مربع)
                                minWidth={150}
                                circularCrop={true}
                            >
                                <img ref={imgRef} alt="Crop me" src={originalImageSrc} onLoad={onImageLoad} />
                            </ReactCrop>
                        )}
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <button onClick={() => setIsCropperOpen(false)} className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">إلغاء</button>
                            <button onClick={handleCropConfirm} className="px-6 py-2 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors flex items-center gap-2">
                                <Check size={18}/> تأكيد
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            
            {/* --- الفورم الرئيسي --- */}
            <div className="flex min-h-screen items-center justify-center bg-black text-white font-[Cairo] p-4">
                <Helmet>
                    <title>انضمام مدرس جديد</title>
                </Helmet>
                <div className="mx-auto w-full max-w-2xl">
                    <motion.main
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-h-[95vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a19]/50 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-lg scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-slate-800"
                    >
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-black text-white text-shadow-[0_0_10px_rgba(0,191,255,0.6)]">
                                انضم إلى كوكبة المدرسين
                            </h1>
                            <p className="mt-2 text-gray-400">
                                املأ بياناتك لتصبح قائدًا للمعرفة في منصتنا
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* ... حقول البيانات الشخصية ... */}
                             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div><label>الاسم الأول</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className={inputClasses}/></div>
                                <div><label>الاسم الأخير</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required className={inputClasses}/></div>
                            </div>
                            <div><label>رقم الهاتف</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className={inputClasses}/></div>
                             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div><label>سنوات الخبرة</label><input type="number" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} required min="0" className={inputClasses}/></div>
                                <div>
                                    <label>التخصص الأساسي</label>
                                     <select value={subject} onChange={e => setSubject(e.target.value)} required className={`${inputClasses} p-3.5`}>
                                        <option value="">اختر التخصص</option>
                                        <option value="اللغة العربية">اللغة العربية</option>
                                        <option value="اللغة الاجنبية الاولة">اللغة الاجنبية الاولة</option>
                                        <option value="الكيمياء">الكيمياء</option>
                                        <option value="الفيزياء">الفيزياء</option>
                                        <option value="الأحياء">الأحياء</option>
                                        <option value="الرياضيات">الرياضيات</option>
                                        <option value="الجغرافيا والتاريخ">الجغرافيا والتاريخ</option>
                                        <option value="الفلسفة">الفلسفة</option>
                                        <option value="علم النفس والمنطق">علم النفس والمنطق</option>
                                     </select>
                                 </div>
                            </div>

                            {/* --- حقل رفع الصور المُحسَّن --- */}
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">الصورة الشخصية (يفضل أن تكون مربعة)</label>
                                {croppedImagePreview ? (
                                    <div className="relative w-48 h-48 mx-auto rounded-full border-2 border-dashed border-cyan-400 p-2">
                                        <img src={croppedImagePreview} alt="معاينة" className="w-full h-full object-cover rounded-full" />
                                        <button type="button" onClick={clearImage} className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5 text-white hover:bg-red-500/80 transition-colors">
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div onClick={() => fileInputRef.current.click()} className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-600 px-6 pt-10 pb-10 cursor-pointer hover:border-cyan-400 transition-colors">
                                        <div className="space-y-1 text-center">
                                            <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
                                            <p className="text-sm text-gray-400"><span className="font-medium text-cyan-400">انقر للرفع</span></p>
                                            <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
                                            <input type="file" className="sr-only" ref={fileInputRef} accept="image/*" onChange={onSelectFile}/>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button type="submit" disabled={loading} className={`flex w-full cursor-pointer justify-center rounded-lg border border-transparent bg-cyan-500 px-4 py-3 text-base font-bold text-black shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {loading ? "جارى الإرسال..." : "إرسال البيانات للمراجعة"}
                            </button>
                        </form>
                    </motion.main>
                </div>
            </div>
        </>
    );
}