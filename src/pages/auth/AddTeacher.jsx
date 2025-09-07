import axios from "../../api/axios";
import React, { useState, useRef } from "react";
import { Cookies } from "react-cookie";
// 1. تصحيح مسار الاستيراد
import { Link, useNavigate } from "react-router-dom";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { UploadCloud, X } from "lucide-react"; // أيقونات لتحسين التصميم

export default function AddTeacher() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [teacherImage, setTeacherImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // 2. State لمعاينة الصورة
  const [loading, setLoading] = useState(false);
  const [path] = useState("MMMm"); // لم أغير هذا لأني لا أعرف الغرض منه

  const { executeRecaptcha } = useGoogleReCaptcha();
  const navigate = useNavigate();
  const cookies = new Cookies();
  const userToken = cookies.get("token");
  const fileInputRef = useRef(null); // للتحكم في حقل الملفات برمجياً

  // دالة لمعالجة تغيير الصورة
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setTeacherImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setTeacherImage(null);
      setImagePreview(null);
      toast.error("يرجى اختيار ملف صورة صالح.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherImage) {
      toast.error("يرجى رفع صورة شخصية.");
      return;
    }
    setLoading(true);

    if (!executeRecaptcha) {
      console.log("reCAPTCHA not ready");
      setLoading(false);
      return;
    }

    const token = await executeRecaptcha("add_teacher_details");

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("phone", phone);
    formData.append("subject", subject);
    formData.append("experienceYears", experienceYears);
    formData.append("teacherImage", teacherImage);
    formData.append("path", path);
    formData.append("captchaToken", token);

    try {
      await axios.post("/api/Teacher/addTeacher", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userToken}`,
        },
      });

      // 3. تحسين تجربة ما بعد الإرسال
      toast.success("تم إرسال بياناتك بنجاح، سيتم مراجعتها.");
      navigate("/waiting");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إرسال البيانات.");
    } finally {
      setLoading(false);
    }
  };
  
  // 4. كلاسات موحدة
  const inputClasses = "mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-2 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none";

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <Helmet>
        <title>استكمال بيانات المدرس</title>
        <meta name="description" content="استكمال بيانات المدرس للانضمام للمنصة" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="mx-auto w-full max-w-2xl p-4"> {/* تعديل العرض ليكون مناسباً أكثر */}
        <main className="max-h-[95vh] overflow-y-auto rounded-2xl border border-white/5 bg-[#0a0a19]/50 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-lg">
          {/* ... استايلات السكرول بار ... */}
          <style jsx>{`
              main::-webkit-scrollbar { width: 6px; }
              main::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
              main::-webkit-scrollbar-thumb { background: #00bfff; border-radius: 10px; }
              main::-webkit-scrollbar-thumb:hover { background: #009acd; }
          `}</style>
          <div className="mb-8 text-center">
            <p className="text-3xl font-black text-white text-shadow-[0_0_10px_rgb(0_191_255_/_0.6)]">
              انضم إلى كوكبة المدرسين
            </p>
            <p className="mt-2 text-gray-400">
              املأ بياناتك لتصبح قائدًا للمعرفة في منصتنا
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-gray-300">الاسم الأول</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputClasses}/>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300">الاسم الأخير</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputClasses}/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300">رقم الهاتف</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputClasses}/>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-gray-300">سنوات الخبرة</label>
                <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} required min="0" className={inputClasses}/>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300">التخصص الأساسي</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} required className={`${inputClasses} p-2.5`}>
                  <option value="">اختر التخصص</option>
                    <option value="الفيزياء">الفيزياء</option>
                    <option value="الكيمياء">الكيمياء</option>
                    <option value="الرياضيات">الرياضيات</option>
                    <option value="الأحياء">الأحياء</option>
                    <option value="اللغة العربية">اللغة العربية</option>
                    <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
                    <option value="أخرى">أخرى</option>
                                    </select>
              </div>
            </div>

            {/* 5. حقل رفع الصور المُحسَّن */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">الصورة الشخصية</label>
              {imagePreview ? (
                // --- حالة وجود صورة مختارة ---
                <div className="relative w-full h-48 rounded-lg border border-dashed border-gray-600 flex items-center justify-center">
                  <img src={imagePreview} alt="معاينة" className="max-h-full max-w-full object-contain rounded-lg" />
                  <button type="button" onClick={() => { setImagePreview(null); setTeacherImage(null); fileInputRef.current.value = null; }}
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 text-white hover:bg-black/80 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                // --- حالة عدم وجود صورة ---
                <div onClick={() => fileInputRef.current.click()} className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-600 px-6 pt-5 pb-6 cursor-pointer hover:border-cyan-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-cyan-400">انقر للرفع</span> أو اسحب وأفلت الصورة هنا
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" ref={fileInputRef} accept="image/*" onChange={handleImageChange}/>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className={`flex w-full cursor-pointer justify-center rounded-lg border border-transparent bg-[#00BFFF] px-4 py-3 text-sm font-bold text-black shadow-sm shadow-[rgba(0,191,255,0.4)] transition-all duration-300 ease-in-out hover:translate-y-[2px] hover:shadow-[0_0_25px_rgb(0_191_255_/_0.7)] disabled:opacity-50 disabled:cursor-not-allowed`}>
              {loading ? "جارى التحميل..." : "إرسال البيانات"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              هل أنت طالب؟{" "}
              <Link to="/signup" className="font-medium text-cyan-400 hover:text-cyan-300">
                أنشئ حساب طالب من هنا
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}