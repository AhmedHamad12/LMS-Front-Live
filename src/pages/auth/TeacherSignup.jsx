import axios from "../../api/axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cookies } from "react-cookie";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function TeacherSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { executeRecaptcha } = useGoogleReCaptcha();
  const navigate = useNavigate();
  const cookies = new Cookies();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }
    setLoading(true);

    if (!executeRecaptcha) {
      console.log("reCAPTCHA not ready");
      setLoading(false);
      return;
    }

    const token = await executeRecaptcha("register_teacher");
    const today = new Date();
    const joinedAt = today.toLocaleDateString("en-CA");

    await axios
      .post("/api/Account/Register/Teacher", {
        displayName: name,
        email,
        password,
        joinedAt,
        captchaToken: token,
      })
      // --== التعديل هنا في الجزء التالي ==--
      .then((response) => {
        // 1. حفظ التوكن للسماح للمستخدم بالوصول لصفحة "add-teacher"
        cookies.set("token", response.data.token, { path: "/" });

        // 2. إعطاء رسالة واضحة للخطوة التالية
        toast.success("تم إنشاء حسابك بنجاح! قم الآن باستكمال بياناتك.");
        
        // 3. توجيه المستخدم لصفحة استكمال البيانات وليس صفحة الانتظار
        navigate("/add-teacher");
      })
      .catch((error) => {
        console.error(error);
        const errorMessage = error?.response?.data?.message || "حدث خطأ ما، يرجى المحاولة مرة أخرى.";
        toast.error(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const inputClasses = "mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-2 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none";

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <Helmet>
        <title>إنشاء حساب مدرس جديد</title>
        <meta name="description" content="انضم كـ مدرس في منصة المحاضرة التعليمية" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full max-w-6xl p-4 md:mx-auto">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border border-white/5 bg-[#0a0a19]/50 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-lg">
            <div className="mb-8 text-center">
              <p className="text-3xl font-black text-white text-shadow-[0_0_10px_rgb(0_191_255_/_0.6)]">
                طلب انضمام كـ مدرس
              </p>
              <p className="mt-2 text-gray-400">
                الخطوة الأولى: إنشاء حسابك الأساسي
              </p>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* ... باقي حقول الفورم كما هي بدون تغيير ... */}
              <div>
                <label className="block text-sm font-bold text-gray-300">
                  الاسم بالكامل
                </label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClasses}/>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300">
                  البريد الإلكتروني
                </label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses}/>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-bold text-gray-300">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className={`${inputClasses} pl-10`}/>
                    <span onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={`${inputClasses} pl-10`}/>
                    <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white">
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <button type="submit" disabled={loading} className={`flex w-full cursor-pointer justify-center rounded-lg border border-transparent bg-[#00BFFF] px-4 py-3 text-sm font-bold text-black shadow-sm shadow-[rgba(0,191,255,0.4)] transition-all duration-300 ease-in-out hover:translate-y-[2px] hover:shadow-[0_0_25px_rgb(0_191_255_/_0.7)] disabled:opacity-50 disabled:cursor-not-allowed`}>
                  {loading ? "جارى الإنشاء..." : "إنشاء الحساب والمتابعة"}
                </button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                لديك حساب بالفعل؟{" "}
                <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300">
                  سجل الدخول من هنا
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherSignup;