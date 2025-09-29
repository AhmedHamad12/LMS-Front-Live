import axios from "../../api/axios";
import React, { useState } from "react";
// 1. تصحيح مسار الاستيراد
import { Link, useNavigate } from "react-router-dom";
import { Cookies } from "react-cookie";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";

export default function AddStudent() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [studentYears, setStudentYears] = useState(1); // القيمة الافتراضية
  const [loading, setLoading] = useState(false);

  const { executeRecaptcha } = useGoogleReCaptcha();
  const navigate = useNavigate();
  const cookies = new Cookies();
  const userToken = cookies.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!executeRecaptcha) {
      console.log("reCAPTCHA not ready");
      setLoading(false);
      return;
    }

    const token = await executeRecaptcha("add_student_details");

    try {
      await axios.post(
        "/api/Student/addStudent",
        {
          firstName,
          lastName,
          phone,
          parentName,
          parentPhone,
          studentYears: +studentYears, // تحويل القيمة إلى رقم
          captchaToken: token,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      
      // 2. تحسين تجربة ما بعد الإرسال
      toast.success("تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.");
      navigate("/login");

    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data || "حدث خطأ ما، يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  // 3. كلاسات موحدة
  const inputClasses = "mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-2 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none";

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <Helmet>
        <title>استكمال بيانات الطالب</title>
        <meta name="description" content="استكمال بيانات الطالب للانضمام للمنصة" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full max-w-2xl p-4 md:mx-auto"> {/* تعديل العرض ليكون مناسباً */}
        <div className="rounded-2xl border border-white/5 bg-[#0a0a19]/50 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-lg">
          <div className="mb-8 text-center">
            <p className="text-3xl font-black text-white text-shadow-[0_0_10px_rgb(0_191_255_/_0.6)]">
              استكمال البيانات الشخصية
            </p>
            <p className="mt-2 text-gray-400">
              خطوة أخيرة لبدء رحلتك نحو التفوق
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-gray-300">اسم الطالب الأول</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputClasses}/>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300">اسم الطالب الأخير</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputClasses}/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300">رقم هاتف الطالب</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputClasses}/>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-gray-300">اسم ولي الأمر</label>
                <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} required className={inputClasses}/>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300">رقم هاتف ولي الأمر</label>
                <input type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} required className={inputClasses}/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300">السنة الدراسية</label>
              <select value={studentYears} onChange={(e) => setStudentYears(e.target.value)} className={`${inputClasses} p-2.5`}>
                <option value={1}>الصف الأول الثانوي</option>
                <option value={2}>الصف الثاني الثانوي</option>
                <option value={3}>الصف الثالث الثانوي</option>
              </select>
            </div>
            <div>
              <button type="submit" disabled={loading} className={`flex w-full cursor-pointer justify-center rounded-lg border border-transparent bg-[#00BFFF] px-4 py-3 text-sm font-bold text-black shadow-sm shadow-[rgba(0,191,255,0.4)] transition-all duration-300 ease-in-out hover:translate-y-[2px] hover:shadow-[0_0_25px_rgb(0_191_255_/_0.7)] disabled:opacity-50 disabled:cursor-not-allowed`}>
                {loading ? "جارى التحميل..." : "تأكيد وإنشاء الحساب"}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              هل أنت مدرس؟{" "}
              <Link to="/teacher-signup" className="font-medium text-cyan-400 hover:text-cyan-300">
                أنشئ حساب مدرس من هنا
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}