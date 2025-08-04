import axios from "../../api/axios";
import React, { useEffect, useState } from "react";
import { Cookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);

  const cookies = new Cookies();
  const token = cookies.get("token");
  const id = cookies.get("teacherId");

  //TODO: id is returned as null , switch for real id from cookies

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(`/api/Quiz/getQuizForTeacher${id}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setQuizzes(response.data);
        console.log("quizzes", response.data);
        console.log("id", id);
      } catch (error) {
        console.log(error);
      }
    };

    fetchQuizzes();
  }, []);
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start bg-opacity-80 p-4"
      style={{ fontFamily: "Cairo, sans-serif" }}
    >
      <h2 className="text-2xl font-bold mb-4">الاختبارات</h2>
      <div className="w-full max-w-2xl mb-8">
        {quizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <svg
              className="mx-auto mb-4 w-16 h-16 text-cyan-500/40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l2 2m8-2A10 10 0 11 2 12a10 10 0 0120 0z"
              />
            </svg>
            <span className="text-lg font-semibold">
              لا توجد اختبارات متاحة حالياً
            </span>
            <span className="text-sm mt-2 text-gray-500">
              لم يتم العثور على أي اختبارات لهذا المعلم بعد.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz, idx) => {
              const isOpen = openAccordion === idx;
              return (
                <div
                  key={quiz.id || idx}
                  className="glass-effect rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/40 to-slate-900/50 backdrop-blur-lg shadow-xl"
                >
                  <button
                    className="w-full flex justify-between items-center p-5 focus:outline-none text-right rounded-2xl"
                    onClick={() => setOpenAccordion(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    style={{ transition: "background 0.2s" }}
                  >
                    <span className="font-bold text-lg text-white truncate max-w-[70%]">
                      {quiz.title}
                    </span>
                    <span className="ml-2 px-3 py-1 rounded-full text-sm m-auto font-bold bg-cyan-600 text-white">
                      درجة النجاح: {quiz.passScore}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 mt-2">
                      <div className="mb-2 text-white">
                        <b>المدة الزمنية:</b> {quiz.timeLimitMinutes} دقيقة
                      </div>
                      <div className="mb-2 text-white">
                        <b>تاريخ الإنشاء:</b>{" "}
                        {new Date(quiz.createdAt).toLocaleString()}
                      </div>
                      <div className="mb-2 text-white">
                        <b>معرّف الاختبار:</b> {quiz.id}
                      </div>
                      <button
                        onClick={() =>
                          navigate(`/teacher/quizzes/${quiz.id}/questions`)
                        }
                        className="mt-4 flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        عرض الأسئلة
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/teacher/quizzes/${quiz.id}/submissions`)
                        }
                        className="mt-4 flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        عرض التسليمات
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <button
        onClick={() => navigate("/teacher/quizzes/create")}
        className=" w-[20%] mb-5 text-center p-3 rounded-lg border-2 border-dashed border-gray-600 hover:border-cyan-400 hover:text-cyan-400 transition-all text-gray-400"
      >
        + إضافة اختبار جديد
      </button>
    </div>
  );
};

export default Quizzes;
