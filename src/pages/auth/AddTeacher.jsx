import axios from "../../api/axios";
import React, { useState } from "react";
import { Cookies } from "react-cookie";
import { Link, useNavigate } from "react-router";
import { Helmet } from "react-helmet-async";

export default function AddTeacher() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [teacherImage, setTeacherImage] = useState(null); // changed from "" to null
  const [loading, setLoading] = useState(false);
  const [path] = useState("MMMm");

  const navigate = useNavigate();
  const cookies = new Cookies();
  const token = cookies.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("phone", phone);
    formData.append("subject", subject);
    formData.append("experienceYears", experienceYears);
    formData.append("teacherImage", teacherImage); // File object
    formData.append("path", path);

    try {

      await axios.post("/api/Teacher/addTeacher", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/login");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <Helmet>
        <title>إنشاء حساب جديد</title>
        <meta name="description" content="إنشاء حساب جديد" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="mx-auto w-full max-w-6xl p-4">
        <div className="grid md:grid-cols-2 md:gap-8">
          <main className="max-h-[95vh] overflow-y-auto rounded-2xl border border-white/5 bg-[#0a0a19]/50 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-lg">
            <style jsx>{`
              main::-webkit-scrollbar {
                width: 6px;
              }
              main::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
              }
              main::-webkit-scrollbar-thumb {
                background: #00bfff;
                border-radius: 10px;
              }
              main::-webkit-scrollbar-thumb:hover {
                background: #009acd;
              }
            `}</style>
            <div className="mb-8 text-center">
              <p className="text-3xl font-black text-white text-shadow-[0_0_10px_rgb(0_191_255_/_0.6)]">
                انضم إلى كوكبة المدرسين
              </p>
              <p className="mt-2 text-gray-400">
                كن قائدًا للمعرفة في مجرّتنا التعليمية
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-bold text-gray-300">
                    الاسم الاول
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
                    الاسم الاخير
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-2 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-2 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-bold text-gray-300">
                    سنين الخبرة
                  </label>
                  <input
                    type="number"
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-2 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300">
                    التخصص الأساسي
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-1 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none"
                  >
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
              <div>
                {/* //********************************  */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-300">
                    ارفع الصورة الشخصية
                  </label>
                  <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-600 px-6 pt-5 pb-6">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-500"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-400">
                        <p className="relative cursor-pointer rounded-md bg-gray-800 px-3 py-1 font-medium text-cyan-400 hover:text-cyan-300">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setTeacherImage(e.target.files[0])}
                            required
                          />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* //******************************** */}
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
                هل أنت طالب؟
                <Link
                  to="/signup"
                  className="font-medium text-cyan-400 hover:text-cyan-300"
                >
                  أنشئ حساب طالب من هنا
                </Link>
              </p>
            </div>
          </main>

          <div className="visuals-container relative hidden flex-col items-center justify-center overflow-hidden rounded-2xl p-8 md:flex">
            <canvas id="nebula-canvas"></canvas>
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/30 p-8 text-center">
              <h2 className="title-glow mb-4 text-5xl font-black text-white">
                المجرّة.
              </h2>
              <p className="text-lg text-gray-300">
                كن نجمًا يضيء سماء المعرفة لآلاف الطلاب.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
