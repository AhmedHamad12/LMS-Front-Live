import axios from "../../api/axios";
import React, { useState } from "react";
import { Cookies } from "react-cookie";
import { Link, useNavigate } from "react-router";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Helmet } from "react-helmet-async";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const navigate = useNavigate();

  const cookies = new Cookies();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!executeRecaptcha) {
      console.log("reCAPTCHA not ready");
      return;
    }

    const token = await executeRecaptcha("login");

    await axios
      .post("/api/Account/Login", { email, password, captchaToken: token })
      .then((response) => {
        cookies.set("token", response.data.token);
        navigate(`/${response.data.role}/dashboard`);

      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      {/* <canvas id="bg-canvas"></canvas> */}
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <Helmet>
          <title>تسجيل الدخول</title>
          <meta name="description" content="تسجيل الدخول" />
          
        </Helmet>
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/5 bg-[#0a0a19]/50 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-lg">
            <div className="mb-8 text-center">
              <p className="text-4xl font-black text-white text-shadow-[0_0_10px_rgb(0_191_255_/_0.6)]">
                المحاضرة.
              </p>
              <p className="mt-2 text-gray-400">
                بوابة الدخول إلى محطة المعرفة
              </p>
            </div>


              <form onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm font-bold text-gray-300">
                    البريد الإلكتروني
                  </label>
                  <div className="mt-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="البريد الإلكتروني"
                      required
                      className="w-full rounded-lg border border-white/10 bg-black/20 p-3 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-bold text-gray-300">
                    كلمة المرور
                  </label>
                  <div className="mt-3">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-lg border border-white/10 bg-black/20 p-3 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <Link
                    to="/reset/email"
                    className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>

                <div className="mt-5">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex w-full cursor-pointer justify-center rounded-lg border border-transparent bg-[#00BFFF] px-4 py-3 text-sm font-bold text-black shadow-sm shadow-[rgba(0,191,255,0.4)] transition-all duration-300 ease-in-out hover:translate-y-[2px] hover:shadow-[0_0_25px_rgb(0_191_255_/_0.7)] ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "جارى التحميل..." : "تسجيل الدخول"}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-[#0a0a19] px-2 text-gray-500">
                      ليس لديك حساب؟
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    to="/student-signup"
                    className="inline-flex w-full cursor-pointer justify-center rounded-lg border border-gray-700 bg-white/5 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-white/10"
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
