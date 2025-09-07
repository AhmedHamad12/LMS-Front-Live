import React, { useState } from "react";
import { Cookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import { Eye, EyeOff, Mail, Lock } from "lucide-react"; // استيراد الأيقونات

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const navigate = useNavigate();
  const cookies = new Cookies();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!executeRecaptcha) {
      console.log("reCAPTCHA not ready");
      setLoading(false);
      return;
    }

    try {
      const captchaToken = await executeRecaptcha("login");

      const response = await axios.post("/api/Account/Login", {
        email,
        password,
        captchaToken,
      });

      cookies.set("token", response.data.token, { path: "/" });

      if (response.data.role === "Teacher") {
        // ====================  START: التعديل المطلوب  ====================
        // نفترض أن الـ API يرجع teacherId في response.data
        const { teacherId, status } = response.data;

        // 1. التحقق أولاً إذا كان المدرس بحاجة لإكمال بياناته
        if (teacherId === null) {
          // إذا كان teacherId فارغًا، وجهه لصفحة إكمال البيانات
          navigate("/add-teacher"); // تأكد من وجود هذا المسار في react-router
        } 
        // 2. إذا كانت البيانات مكتملة، تحقق من حالة الحساب
        else if (status === 0) { // Pending
          navigate("/waiting");
        } else if (status === 2) { // Rejected
          toast.error("تم رفض طلب انضمامك.");
          setLoading(false);
        } else { // Approved (status === 1 or any other case)
          window.location.href = `/teacher/dashboard`;
        }
        // =====================  END: التعديل المطلوب  =====================

      } else {
        // توجيه الطالب يبقى كما هو
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "بريد إلكتروني أو كلمة مرور خاطئة"
      );
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex h-screen items-center justify-center bg-black text-white p-4">
        <Helmet>
          <title>تسجيل الدخول</title>
          <meta name="description" content="تسجيل الدخول إلى منصة المحاضرة" />
        </Helmet>
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-[#0a0a19]/50 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-lg">
            <div className="mb-8 text-center">
              <p className="text-4xl font-black text-white text-shadow-[0_0_10px_rgb(0_191_255_/_0.6)]">
                المحاضرة.
              </p>
              <p className="mt-2 text-gray-400">
                أهلاً بعودتك! بوابة الدخول إلى محطة المعرفة.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-bold text-gray-300">
                  البريد الإلكتروني
                </label>
                <div className="relative mt-2">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 p-3 pl-10 text-white placeholder-slate-400 transition-all duration-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-300">
                  كلمة المرور
                </label>
                <div className="relative mt-2">
                  <Lock
                    className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {isPasswordVisible ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                  <input
                    type={isPasswordVisible ? "password" : "text"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 p-3 pl-20 text-white placeholder-slate-400 transition-all duration-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="text-left">
                <Link
                  to="/reset/email"
                  className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-lg bg-cyan-500 px-4 py-3 text-sm font-bold text-black shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "جارى التحميل..." : "تسجيل الدخول"}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[#0a0a19] px-2 text-slate-500">
                    ليس لديك حساب؟
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  to="/student-signup"
                  className="inline-flex w-full justify-center rounded-lg border border-slate-700 bg-white/5 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-white/10"
                >
                  أنشئ حساب جديد
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}