import React, { useState, useRef, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { Cookies } from "react-cookie";
import axios from "../../api/axios";
import { motion } from "framer-motion";

// أيقونات لتحسين التصميم
// --- التعديل الأول: تم تغيير اسم الأيقونة هنا ---
import { UploadCloud, X, Check, ChevronsUpDown } from "lucide-react";

// استيراد مكتبة قص الصور
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// استيراد المكتبة الجديدة للقائمة المنسدلة
import { Listbox, Transition } from '@headlessui/react';


// --- دالة مساعدة لقص الصورة (بدون تغيير) ---
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
        0, 0, crop.width, crop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob(blob => {
            if (!blob) { console.error('Canvas is empty'); return; }
            blob.name = fileName;
            resolve(blob);
        }, 'image/jpeg');
    });
}

// قائمة المواد الدراسية
const subjects = [
    "اللغة العربية", "اللغة الأجنبية الأولى", "اللغة الأجنبية الثانية", "الكيمياء", "الفيزياء", "الأحياء",
    "الجيولوجيا والعلوم البيئية", "الرياضيات البحتة", "الرياضيات التطبيقية", "الرياضيات",
    "علم النفس والمنطق", "الفلسفة", "الجغرافيا والتاريخ", "الاقتصاد والإحصاء",
    "تكنولوجيا المعلومات", "العلوم المتكاملة", "التربية الوطنية", "التربية الدينية", "اللغة الإنجليزية المتخصصة"
];


export default function AddTeacher() {
    // --- State لإدارة الفورم ---
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [subject, setSubject] = useState("");
    const [experienceYears, setExperienceYears] = useState(0);
    const [loading, setLoading] = useState(false);

    // --- State لإدارة عملية رفع وقص الصور (بدون تغيير) ---
    const [originalImageSrc, setOriginalImageSrc] = useState(null);
    const [croppedImageBlob, setCroppedImageBlob] = useState(null);
    const [croppedImagePreview, setCroppedImagePreview] = useState(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    
    const imgRef = useRef(null);
    const fileInputRef = useRef(null);
    
    const { executeRecaptcha } = useGoogleReCaptcha();
    const navigate = useNavigate();
    const cookies = new Cookies();
    const userToken = cookies.get("token");

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setOriginalImageSrc(reader.result.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
            setIsCropperOpen(true);
        }
    };

    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        const crop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height);
        setCrop(crop);
    }
    
    const handleCropConfirm = async () => {
        if (completedCrop?.width && completedCrop?.height && imgRef.current) {
            const croppedBlob = await getCroppedImg(imgRef.current, completedCrop, 'teacher-image.jpg');
            setCroppedImageBlob(croppedBlob);
            setCroppedImagePreview(URL.createObjectURL(croppedBlob));
            setIsCropperOpen(false);
        }
    };
    
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
        if (!subject) {
            toast.error("يرجى اختيار التخصص الأساسي.");
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
        formData.append("teacherImage", croppedImageBlob);
        formData.append("captchaToken", captchaToken);

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
            toast.error(error?.response?.data || "حدث خطأ أثناء إرسال البيانات.");
        } finally {
            setLoading(false);
        }
    };
    
    const inputClasses = "mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-3 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.2)] focus:outline-none";

    return (
        <>
            {/* --- نافذة قص الصور (بدون تغيير) --- */}
            {isCropperOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#0a0a19] border border-white/10 rounded-2xl p-6 w-full max-w-lg"
                    >
                        <h3 className="text-xl font-bold mb-4 text-center">حدد صورتك الشخصية</h3>
                        {originalImageSrc && (
                            <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1} minWidth={150} circularCrop={true}>
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
                <Helmet><title>انضمام مدرس جديد</title></Helmet>
                <div className="mx-auto w-full max-w-2xl">
                    <motion.main
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-h-[95vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a19]/50 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-lg scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-slate-800"
                    >
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-black text-white text-shadow-[0_0_10px_rgba(0,191,255,0.6)]">انضم إلى كوكبة المدرسين</h1>
                            <p className="mt-2 text-gray-400">املأ بياناتك لتصبح قائدًا للمعرفة في منصتنا</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                 <div><label>الاسم الأول</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className={inputClasses}/></div>
                                 <div><label>الاسم الأخير</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required className={inputClasses}/></div>
                             </div>
                             <div><label>رقم الهاتف</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className={inputClasses}/></div>
                             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                 <div><label>سنوات الخبرة</label><input type="number" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} required min="0" className={inputClasses}/></div>
                                 
                                 <div>
                                    <label>التخصص الأساسي</label>
                                    <Listbox value={subject} onChange={setSubject}>
                                        <div className="relative mt-2">
                                            <Listbox.Button className={`${inputClasses} text-right flex items-center justify-between`}>
                                                <span className="block truncate">{subject || "اختر التخصص"}</span>
                                                {/* --- التعديل الثاني: تم تغيير اسم الأيقونة هنا --- */}
                                                <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                                            </Listbox.Button>
                                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#0a0a19] py-1 text-base shadow-lg ring-1 ring-white/10 focus:outline-none sm:text-sm z-10">
                                                    {subjects.map((subj, subjIdx) => (
                                                        <Listbox.Option
                                                            key={subjIdx}
                                                            className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${ active ? 'bg-cyan-500/10 text-cyan-300' : 'text-gray-300' }`}
                                                            value={subj}
                                                        >
                                                            {({ selected }) => (
                                                                <>
                                                                    <span className={`block truncate ${ selected ? 'font-medium text-white' : 'font-normal' }`}>
                                                                        {subj}
                                                                    </span>
                                                                    {selected ? (
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-400">
                                                                            <Check className="h-5 w-5" aria-hidden="true" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                 </div>
                             </div>

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