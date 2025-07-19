import React from "react";
import { Link } from "react-router";

export default function TeacherSignup() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
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
              <h1 className="text-3xl font-black text-white text-shadow-[0_0_10px_rgb(0_191_255_/_0.6)]">
                انضم إلى كوكبة المدرسين
              </h1>
              <p className="mt-2 text-gray-400">
                كن قائدًا للمعرفة في مجرّتنا التعليمية
              </p>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-bold text-gray-300">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-2 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300">
                    التخصص الأساسي
                  </label>
                  <select className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-1 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none">
                    <option>الفيزياء</option>
                    <option>الكيمياء</option>
                    <option>الرياضيات</option>
                    <option>الأحياء</option>
                    <option>اللغة العربية</option>
                    <option>اللغة الإنجليزية</option>
                    <option>أخرى</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-2 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300">
                  نبذة عن خبراتك
                </label>
                <textarea
                  rows="3"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-2 placeholder-gray-500 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none"
                  placeholder="اذكر خبراتك السابقة في التدريس..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300">
                  ارفع السيرة الذاتية (CV)
                </label>
                <div className="mt-1 rounded-md border-2 border-dashed border-gray-600 px-6 pt-5 pb-6">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-500"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                        // stroke-width="2"
                        // stroke-linecap="round"
                        // stroke-linejoin="round"
                      ></path>
                    </svg>
                    <div className="text-sm text-gray-400">
                      {/* <p className="cursor-pointer rounded-md bg-gray-800 font-medium text-cyan-400 hover:text-cyan-300"> */}
                      {/* <label className="custom-file-upload">اضغط للرفع</label> */}

                      <input
                        type="file"
                        className="w-[180px] cursor-pointer rounded-md bg-gray-800 px-3 py-1 font-medium text-cyan-400 hover:text-cyan-300"
                      />
                      {/* </p> */}
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOCX up to 5MB</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-bold text-gray-300">
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    required
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-2 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300">
                    تأكيد كلمة المرور
                  </label>
                  <input
                    type="password"
                    required
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 p-2 transition-all duration-300 ease-in-out focus:border focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0_191_255_/_0.3)] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="flex w-full cursor-pointer justify-center rounded-lg border border-transparent bg-[#00BFFF] px-4 py-3 text-sm font-bold text-black shadow-sm shadow-[rgba(0,191,255,0.4)] transition-all duration-300 ease-in-out hover:translate-y-[2px] hover:shadow-[0_0_25px_rgb(0_191_255_/_0.7)]"
                >
                  إرسال طلب الانضمام
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
