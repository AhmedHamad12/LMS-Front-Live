import React, { useState } from "react";
import { Cookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import axios from "../../api/axios";

// استيراد الأيقونات الموحدة من lucide-react
import { Eye, EyeOff, Mail, Lock, User, Home } from "lucide-react";

export default function StudentRegister() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // الحالة الافتراضية لكلمات المرور (مخفية)
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const navigate = useNavigate();
    const { executeRecaptcha } = useGoogleReCaptcha();
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

        try {
            const token = await executeRecaptcha("register");
            const today = new Date();
            const joinedAt = today.toLocaleDateString("en-CA"); // YYYY-MM-DD

            const response = await axios.post("/api/Account/Register/Student", {
                displayName: name,
                email,
                password,
                joinedAt,
                captchaToken: token,
            });

            cookies.set("token", response.data.token, { path: '/' });
            navigate("/add-student");
            toast.success("تم إنشاء الحساب بنجاح!");

        } catch (error) {
            const errorMessage = error?.response?.data?.message || "حدث خطأ ما، يرجى المحاولة مرة أخرى.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // كلاسات موحدة ومحسّنة
    const inputContainerClasses = "relative mt-2";
    const iconClasses = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400";
    const inputClasses = "w-full rounded-lg border border-slate-700 bg-slate-800/50 p-3 pl-10 text-white placeholder-slate-400 transition-all duration-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 focus:outline-none";

    return (
        <div className="flex min-h-screen items-center justify-center bg-black text-white p-4 font-[Cairo]">
            <Helmet>
                <title>إنشاء حساب طالب</title>
                <meta name="description" content="إنشاء حساب طالب جديد في منصة المحاضرة." />
            </Helmet>
            <div className="w-full max-w-md">
                <div className="relative rounded-2xl border border-white/10 bg-[#0a0a19]/50 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-lg">
                    
                    {/* أيقونة العودة للرئيسية */}
                    <Link to="/" title="العودة للصفحة الرئيسية" className="absolute top-4 right-4 text-slate-400 hover:text-cyan-400 transition-colors">
                        <Home size={24} />
                    </Link>
                    
                    <div className="mb-8 text-center">
                        <p className="text-3xl font-black text-white text-shadow-[0_0_10px_rgba(0,191,255,0.6)]">
                            إنشاء حساب جديد
                        </p>
                        <p className="mt-2 text-gray-400">
                            انضم إلينا وابدأ رحلتك نحو التفوق
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm font-bold text-gray-300">الاسم الكامل</label>
                            <div className={inputContainerClasses}>
                                <User className={iconClasses} size={20} />
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClasses} placeholder="مثال: أحمد محمد"/>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-300">البريد الإلكتروني</label>
                            <div className={inputContainerClasses}>
                                <Mail className={iconClasses} size={20} />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} placeholder="example@mail.com"/>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-300">كلمة المرور</label>
                            <div className={inputContainerClasses}>
                                <Lock className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                                <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className={`${iconClasses} hover:text-cyan-400`}>
                                    {isPasswordVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                                <input type={isPasswordVisible ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className={`${inputClasses} pl-20`} placeholder="••••••••"/>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-300">تأكيد كلمة المرور</label>
                            <div className={inputContainerClasses}>
                                <Lock className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                                <button type="button" onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} className={`${iconClasses} hover:text-cyan-400`}>
                                    {isConfirmPasswordVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                                <input type={isConfirmPasswordVisible ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={`${inputClasses} pl-20`} placeholder="••••••••"/>
                            </div>
                        </div>
                        <div>
                            <button type="submit" disabled={loading} className="flex w-full justify-center rounded-lg bg-cyan-500 px-4 py-3 text-sm font-bold text-black shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-400 space-y-4">
                        <p>
                            لديك حساب بالفعل؟{" "}
                            <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300">
                                سجل الدخول
                            </Link>
                        </p>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-[#0a0a19] px-2 text-slate-500">أو</span>
                            </div>
                        </div>
                        <p>
                            هل أنت مدرس؟{" "}
                            <Link to="/teacher-signup" className="font-medium text-cyan-400 hover:text-cyan-300">
                                انضم إلينا كمدرس
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}