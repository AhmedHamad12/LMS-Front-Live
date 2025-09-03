import { Cookies } from "react-cookie";
import axios from "../../api/axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";

const QUESTION_TYPE_OPTIONS = [
  { value: 1, label: "اختيار من متعدد" },
  { value: 2, label: "صح أو خطأ" },
  // { value: 3, label: "إجابة نصية" },
];

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#0f172a",
    borderColor: state.isFocused ? "#22d3ee" : "#0891b2",
    color: "#fff",
    borderRadius: "0.75rem",
    minHeight: "48px",
    boxShadow: state.isFocused ? "0 0 0 2px #22d3ee55" : "none",
    fontFamily: "Cairo, sans-serif",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#0f172a",
    borderRadius: "0.75rem",
    zIndex: 20,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#22d3ee"
      : state.isFocused
      ? "#164e63"
      : "#0f172a",
    color: state.isSelected ? "#0f172a" : "#fff",
    fontWeight: state.isSelected ? "bold" : "normal",
    borderRadius: "0.5rem",
    padding: "12px 16px",
    cursor: "pointer",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#fff",
  }),
  input: (provided) => ({
    ...provided,
    color: "#fff",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#94a3b8",
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? "#22d3ee" : "#0891b2",
  }),
};

const Questions = () => {
  //TODO: fix apis
  const { quizId } = useParams();
  const [questions, setquestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [validationError, setValidationError] = useState("");

  const cookies = new Cookies();
  const token = cookies.get("token");
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`/api/Quiz/${quizId}/questions`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setquestions(response.data);
        // console.log("fetched questions", response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchQuestions();
  }, []);

  const [newQuestion, setNewQuestion] = useState({
    text: "",
    imageFile: null,
    imageUrl: "",
    type: QUESTION_TYPE_OPTIONS[0],
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  const handleInputChange = (field, value) => {
    setNewQuestion((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (idx, value) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === idx ? { ...opt, text: value } : opt
      ),
    }));
  };

  const handleCorrectChange = (idx) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => ({
        ...opt,
        isCorrect: i === idx,
      })),
    }));
  };

  const handleTypeChange = (selected) => {
    if (selected.value === 1) {
      setNewQuestion((prev) => ({
        ...prev,
        type: selected,
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      }));
    } else if (selected.value === 2) {
      setNewQuestion((prev) => ({
        ...prev,
        type: selected,
        options: [
          { text: "صح", isCorrect: false },
          { text: "خطأ", isCorrect: false },
        ],
      }));
    } else {
      setNewQuestion((prev) => ({
        ...prev,
        type: selected,
        options: [],
      }));
    }
  };
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewQuestion((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("Text", newQuestion.text);
      formData.append("type", newQuestion.type.value);
      if (newQuestion.imageFile) {
        formData.append("QuestionImage", newQuestion.imageFile);
      }
      if (newQuestion.type.value === 1 || newQuestion.type.value === 2) {
        for (const opt of newQuestion.options) {
          formData.append("Option", opt.text);
        }
        formData.append(
          "CorrectAnswerIndex",
          newQuestion.options.findIndex((opt) => opt.isCorrect)
        );
      }

      // inside handleSubmit before sending request
      if (newQuestion.type.value === 1 || newQuestion.type.value === 2) {
        const correctIndex = newQuestion.options.findIndex(
          (opt) => opt.isCorrect
        );
        if (correctIndex === -1) {
          setValidationError("يجب اختيار إجابة صحيحة واحدة على الأقل");
          setLoading(false);
          return;
        }
      }
      setValidationError("");

      await axios.post(`/api/Quiz/${quizId}/questions`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      toast.success("تمت إضافة السؤال بنجاح");
      setNewQuestion({
        text: "",
        imageFile: null,
        imageUrl: "",
        type: QUESTION_TYPE_OPTIONS[0],
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      });
      // Optionally refetch questions here
      const response = await axios.get(`/api/Quiz/${quizId}/questions`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setquestions(response.data);
    } catch {
      toast.error("حدث خطأ أثناء الإضافة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start bg-opacity-80 p-4"
      dir="rtl"
      style={{ fontFamily: "Cairo, sans-serif" }}
    >
      
      <div className="w-[80%]">
      <button
          onClick={() => navigate("/teacher/quizzes")}
          className="self-start flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>العودة للاختبارات</span>
        </button>
      </div>
      

      {/* Modern Card Grid for fetched questions */}
      <h2 className="text-2xl font-bold mb-4">الأسئلة الحالية</h2>
      <div className="w-full max-w-2xl mb-8">
        {questions.length === 0 ? (
          <div className="text-gray-400">لا توجد أسئلة بعد.</div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const isOpen = openAccordion === idx;
              return (
                <div
                  key={q.id || idx}
                  className="glass-effect rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/40 to-slate-900/50 backdrop-blur-lg  shadow-xl"
                >
                  <button
                    className="w-full flex justify-between items-center p-5 focus:outline-none text-right rounded-2xl"
                    onClick={() => setOpenAccordion(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    style={{ transition: "background 0.2s" }}
                  >
                    <span className="font-bold text-lg text-white truncate max-w-[70%]">
                      {q.text}
                    </span>
                    <span
                      className={`ml-2 px-3 py-1 rounded-full text-sm m-auto font-bold ${
                        q.type === 1
                          ? "bg-cyan-600 text-white"
                          : q.type === 2
                          ? "bg-green-600 text-white"
                          : "bg-gray-500 text-white"
                      }`}
                    >
                      {q.type === 1
                        ? "اختيار من متعدد"
                        : q.type === 2
                        ? "صح أو خطأ"
                        : "إجابة نصية"}
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
                    <div className="p-5 pt-0 mt-2 ">
                      {q.imageUrl && (
                        <img
                          onClick={() => {
                            window.open(q.imageUrl, "_blank");
                          }}
                          src={q.imageUrl}
                          alt="صورة السؤال"
                          className="mb-2 max-h-32 rounded-lg  object-contain"
                        />
                      )}
                      {q.type === 1 && q.options && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {q.options.map((opt, i) => (
                            <span
                              key={i}
                              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                opt.isCorrect
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-300 text-gray-800"
                              }`}
                            >
                              {opt.text}
                            </span>
                          ))}
                        </div>
                      )}
                      {q.type === 2 && q.options && (
                        <div className="flex gap-2 mb-2">
                          {q.options.map((opt, i) => (
                            <span
                              key={i}
                              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                opt.isCorrect
                                  ? "bg-green-500 text-white"
                                  : "bg-red-400 text-white"
                              }`}
                            >
                              {opt.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Question Form */}
      <form
        className="w-full max-w-lg glass-effect rounded-2xl p-8 border border-white/10 bg-gradient-to-br from-slate-800/40 to-slate-900/50 backdrop-blur-lg shadow-xl mb-8 relative"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">نوع السؤال *</label>
          <Select
            value={newQuestion.type}
            onChange={handleTypeChange}
            options={QUESTION_TYPE_OPTIONS}
            styles={customSelectStyles}
            placeholder="اختر نوع السؤال"
            isRtl
            isSearchable={false}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">نص السؤال *</label>
          <input
            type="text"
            className="w-full rounded-lg p-3 bg-slate-900/60 text-white border border-cyan-400/20 focus:border-cyan-400 outline-none"
            value={newQuestion.text}
            onChange={(e) => handleInputChange("text", e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">الصورة (اختياري)</label>
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-lg p-3 bg-slate-900/60 text-white border border-cyan-400/20 focus:border-cyan-400 outline-none mb-2"
            onChange={handleImageChange}
          />
          {newQuestion.imageUrl && (
            <img
              src={newQuestion.imageUrl}
              alt="صورة السؤال"
              className="mb-2 max-h-32 rounded"
            />
          )}
        </div>
        {newQuestion.type.value === 1 && (
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">الخيارات *</label>
            {newQuestion.options.map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name="mcq-correct"
                  checked={opt.isCorrect}
                  onChange={() => handleCorrectChange(optIdx)}
                />
                <input
                  type="text"
                  className="rounded-lg p-2 bg-slate-900/60 text-white border border-cyan-400/20 flex-1"
                  placeholder={`الخيار ${optIdx + 1}`}
                  value={opt.text}
                  onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                  required
                />
              </div>
            ))}
          </div>
        )}
        {newQuestion.type.value === 2 && (
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">
              الإجابة الصحيحة *
            </label>
            <div className="flex gap-4">
              {newQuestion.options.map((opt, optIdx) => (
                <label key={optIdx} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="tf-correct"
                    checked={opt.isCorrect}
                    onChange={() => handleCorrectChange(optIdx)}
                  />
                  {opt.text}
                </label>
              ))}
            </div>
          </div>
        )}
        {validationError && (
          <p className="text-red-500 text-sm mb-2">{validationError}</p>
        )}
        <button
          type="submit"
          className="w-full mt-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-lg transition-colors disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "جاري الإرسال..." : "إضافة السؤال"}
        </button>
      </form>

      {/* Summary of questions to be submitted */}
      {/* Removed the summary section and any code that renders questions.length > 0 as a summary of questions to be added */}
    </div>
  );
};

export default Questions;
