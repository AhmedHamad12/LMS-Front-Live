import axios from "../../api/axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Cookies } from "react-cookie";
import { Helmet } from "react-helmet-async";

export default function AddStudent() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [studentYears, setStudentYears] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const cookies = new Cookies();
  const token = cookies.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await axios
      .post(
        "/api/Student/addStudent",
        {
          firstName,
          lastName,
          phone,
          parentName,
          parentPhone,
          studentYears: +studentYears,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        navigate("/login");

      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <Helmet>
        <title>إنشاء حساب جديد</title>
        <meta name="description" content="إنشاء حساب جديد" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full max-w-6xl p-4 md:mx-auto">
        <div className="grid md:grid-cols-2 md:gap-8">
          <div className="rounded-2xl border border-white/5 bg-[#0a0a19]/50 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-lg">
            <div className="mb-8 text-center">
              <p className="text-3xl font-black text-white text-shadow-[0_0_10px_rgb(0_191_255_/_0.6)]">
                إنشاء حساب جديد
              </p>
              <p className="mt-2 text-gray-400">
                انضم إلى المجرّة وابدأ رحلتك نحو التفوق
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-bold text-gray-300">
                    اسم الطالب الاول
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-2 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300">
                    اسم الطالب الاخير
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-2 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300">
                  رقم هاتف الطالب
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-2 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-bold text-gray-300">
                    اسم ولي الأمر
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    required
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-2 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300">
                    رقم هاتف ولي الأمر
                  </label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    required
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-2 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300">
                  السنة الدراسية
                </label>
                <select
                  value={studentYears}
                  onChange={(e) => setStudentYears(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-2 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none"
                >
                  <option value={1}>الصف الأول الثانوي</option>
                  <option value={2}>الصف الثاني الثانوي</option>
                  <option value={3}>الصف الثالث الثانوي</option>
                </select>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex w-full cursor-pointer justify-center rounded-lg border border-transparent bg-[#00BFFF] px-4 py-3 text-sm font-bold text-black shadow-sm shadow-[rgba(0,191,255,0.4)] transition-all duration-300 ease-in-out hover:translate-y-[2px] hover:shadow-[0_0_25px_rgb(0_191_255_/_0.7)] ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "جارى التحميل..." : "إنشاء الحساب"}
                </button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                لديك حساب بالفعل؟
                <Link
                  to="/login"
                  className="font-medium text-cyan-400 hover:text-cyan-300"
                >
                  سجل الدخول من هنا
                </Link>
              </p>
            </div>
          </div>

          {/* <div className="visuals-container relative hidden flex-col items-center justify-center p-8 md:flex">
            <canvas id="solar-system-canvas"></canvas>
          </div> */}
        </div>
      </div>
    </div>
  );
}
