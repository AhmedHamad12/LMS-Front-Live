import axios from "axios";
import React, { useState } from "react";
import { Cookies } from "react-cookie";
import { Link, useNavigate } from "react-router";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const cookies = new Cookies();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios
      .post(
        "https://api.elmohdra.com/api/Account/LoginAdmin",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        cookies.set("token", response.data.token);
        navigate("/home");
        console.log(response);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      {/* <canvas id="bg-canvas"></canvas> */}

      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/5 bg-[#0a0a19]/50 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-lg">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-black text-white text-shadow-[0_0_10px_rgb(0_191_255_/_0.6)]">
                المجرّة.
              </h1>
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
                    placeholder="name@domain.com"
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
                <a
                  href="#"
                  className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                >
                  نسيت كلمة المرور؟
                </a>
              </div>

              <div className="mt-5">
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-lg border border-transparent bg-[#00BFFF] px-4 py-3 text-sm font-bold text-black shadow-sm shadow-[rgba(0,191,255,0.4)] transition-all duration-300 ease-in-out hover:translate-y-[2px] hover:shadow-[0_0_25px_rgb(0_191_255_/_0.7)]"
                >
                  تسجيل الدخول
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
                  to="/signup"
                  className="inline-flex w-full cursor-pointer justify-center rounded-lg border border-gray-700 bg-white/5 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-white/10"
                >
                  أنشئ محطة جديدة
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
