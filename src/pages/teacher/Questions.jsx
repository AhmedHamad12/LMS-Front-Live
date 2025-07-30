import { Cookies } from "react-cookie";
import axios from "../../api/axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import Select from "react-select";

const QUESTION_TYPE_OPTIONS = [
  { value: 1, label: "اختيار من متعدد" },
  { value: 2, label: "صح أو خطأ" },
  { value: 3, label: "إجابة نصية" },
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
  const { quizId } = useParams();
  const [questions, setquestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextQuestions, setNextQuestions] = useState([]);
  const [openAccordion, setOpenAccordion] = useState(null);



  const cookies = new Cookies
  const token = cookies.get("token");
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `/api/Quiz/${quizId}/questions`, {
            withCredentials:true, headers :{
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setquestions(response.data);
        console.log(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchQuestions();
  }, []);

  const handleQuestionChange = (idx, field, value) => {
    setNextQuestions((prev) =>
      prev.map((q, i) =>
        i === idx
          ? { ...q, [field]: value }
          : q
      )
    );
  };

  const handleQuestionTypeChange = (idx, selected) => {
    setNextQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== idx) return q;
        if (selected.value === 1) {
          return {
            ...q,
            type: selected,
            options: [
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
            ],
          };
        } else if (selected.value === 2) {
          return {
            ...q,
            type: selected,
            options: [
              { text: "صح", isCorrect: false },
              { text: "خطأ", isCorrect: false },
            ],
          };
        } else {
          return { ...q, type: selected, options: [] };
        }
      })
    );
  };

  const handleQuestionOptionChange = (qIdx, optIdx, value) => {
    setNextQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === optIdx ? { ...opt, text: value } : opt
              ),
            }
          : q
      )
    );
  };

  const handleQuestionCorrectChange = (qIdx, optIdx) => {
    setNextQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((opt, j) => ({
                ...opt,
                isCorrect: j === optIdx,
              })),
            }
          : q
      )
    );
  };

  const handleQuestionTFChange = (qIdx, optIdx) => {
    setNextQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((opt, j) => ({
                ...opt,
                isCorrect: j === optIdx,
              })),
            }
          : q
      )
    );
  };

  const handleQuestionImageChange = (qIdx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setNextQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, imageUrl: url } : q
      )
    );
  };

  const handleDeleteQuestion = (idx) => {
    setNextQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitAll = async () => {
    if (nextQuestions.length === 0) return;
    setLoading(true);
    try {
      
      const payload = nextQuestions.map(q => ({ ...q, type: typeof q.type === 'object' ? q.type.value : q.type }));
      console.log("Payload to submit:", payload);
      //TODO: implement API call to submit questions
      setNextQuestions([]);
      // Optionally, refetch questions
      const response = await axios.get(
        `/api/Quiz/${quizId}/questions`
      );
      setquestions(response.data);
    } catch (error) {
      toast.error(error.data.detail)
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
                <div key={q.id || idx} className="glass-effect rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/40 to-slate-900/50 backdrop-blur-lg  shadow-xl">
                  <button
                    className="w-full flex justify-between items-center p-5 focus:outline-none text-right rounded-2xl"
                    onClick={() => setOpenAccordion(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    style={{ transition: 'background 0.2s' }}
                  >
                    <span className="font-bold text-lg text-white truncate max-w-[70%]">{q.text}</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm m-auto font-bold ${q.type === 1 ? 'bg-cyan-600 text-white' : q.type === 2 ? 'bg-green-600 text-white' : 'bg-gray-500 text-white'}`}>{q.type === 1 ? 'اختيار من متعدد' : q.type === 2 ? 'صح أو خطأ' : 'إجابة نصية'}</span>
                    <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 mt-2 ">
                      {q.imageUrl && <img src={q.imageUrl} alt="صورة السؤال" className="mb-2 max-h-32 rounded-lg  object-contain" />}
                      {q.type === 1 && q.options && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {q.options.map((opt, i) => (
                            <span key={i} className={`px-3 py-1 rounded-lg text-sm font-medium ${opt.isCorrect ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-800'}`}>{opt.text}</span>
                          ))}
                        </div>
                      )}
                      {q.type === 2 && q.options && (
                        <div className="flex gap-2 mb-2">
                          {q.options.map((opt, i) => (
                            <span key={i} className={`px-3 py-1 rounded-lg text-sm font-medium ${opt.isCorrect ? 'bg-green-500 text-white' : 'bg-red-400 text-white'}`}>{opt.text}</span>
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

      {/* Render forms for each next question */}
      {nextQuestions.map((q, idx) => (
        <form
          key={idx}
          className="w-full max-w-lg glass-effect rounded-2xl p-8 border border-white/10 bg-gradient-to-br from-slate-800/40 to-slate-900/50 backdrop-blur-lg shadow-xl mb-8 relative"
          onSubmit={e => e.preventDefault()}
        >
          <button
            type="button"
            onClick={() => handleDeleteQuestion(idx)}
            className="absolute left-4 top-4 text-red-500 hover:text-red-700 text-xl"
            title="حذف السؤال"
          >
            ×
          </button>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">نوع السؤال *</label>
            <Select
              value={q.type}
              onChange={selected => handleQuestionTypeChange(idx, selected)}
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
              value={q.text}
              onChange={e => handleQuestionChange(idx, 'text', e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">الصورة (اختياري)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full rounded-lg p-3 bg-slate-900/60 text-white border border-cyan-400/20 focus:border-cyan-400 outline-none mb-2"
              onChange={e => handleQuestionImageChange(idx, e)}
            />
            {q.imageUrl && (
              <img src={q.imageUrl} alt="صورة السؤال" className="mb-2 max-h-32 rounded" />
            )}
          </div>
          {q.type.value === 1 && (
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">الخيارات *</label>
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name={`mcq-correct-${idx}`}
                    checked={opt.isCorrect}
                    onChange={() => handleQuestionCorrectChange(idx, optIdx)}
                  />
                  <input
                    type="text"
                    className="rounded-lg p-2 bg-slate-900/60 text-white border border-cyan-400/20 flex-1"
                    placeholder={`الخيار ${optIdx + 1}`}
                    value={opt.text}
                    onChange={e => handleQuestionOptionChange(idx, optIdx, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
          )}
          {q.type.value === 2 && (
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">الإجابة الصحيحة *</label>
              <div className="flex gap-4">
                {q.options.map((opt, optIdx) => (
                  <label key={optIdx} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name={`tf-correct-${idx}`}
                      checked={opt.isCorrect}
                      onChange={() => handleQuestionTFChange(idx, optIdx)}
                    />
                    {opt.text}
                  </label>
                ))}
              </div>
            </div>
          )}
        </form>
      ))}

            {/* Add Question Button */}
      <button
        onClick={() => setNextQuestions(prev => [...prev, {
          text: "",
          imageUrl: "",
          type: QUESTION_TYPE_OPTIONS[0],
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        }])}
        className="w-[20%] mb-5 text-center p-3 rounded-lg border-2 border-dashed border-gray-600 hover:border-cyan-400 hover:text-cyan-400 transition-all text-gray-400"
      >
        + إضافة سؤال جديد
      </button>

      {/* Summary of questions to be submitted */}
      {nextQuestions.length > 0 && (
        <div className="w-full max-w-2xl mb-8">
          <h3 className="text-lg font-bold mb-4 text-cyan-400">ملخص الأسئلة التي ستتم إضافتها:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nextQuestions.map((q, idx) => (
              <div key={idx} className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-cyan-400/20 rounded-xl p-4 shadow relative">
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(idx)}
                  className="absolute left-3 top-3 text-red-500 hover:text-red-700 text-lg"
                  title="حذف السؤال"
                >
                  ×
                </button>
                <div className="font-semibold text-white mb-2">{q.text}</div>
                {q.imageUrl && <img src={q.imageUrl} alt="صورة السؤال" className="mb-2 max-h-24 rounded" />}
                <div className="mb-1 text-cyan-300">{q.type.value === 1 ? 'اختيار من متعدد' : q.type.value === 2 ? 'صح أو خطأ' : 'إجابة نصية'}</div>
                {q.type.value === 1 && q.options && (
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt, i) => (
                      <span key={i} className={`px-2 py-1 rounded ${opt.isCorrect ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>{opt.text}</span>
                    ))}
                  </div>
                )}
                {q.type.value === 2 && q.options && (
                  <div className="flex gap-2 mt-2">
                    {q.options.map((opt, i) => (
                      <span key={i} className={`px-2 py-1 rounded ${opt.isCorrect ? 'bg-green-500 text-white' : 'bg-red-400'}`}>{opt.text}</span>
                    ))}
                  </div>
                )}
                {q.type.value === 3 && (
                  <div className="mt-2 text-gray-300">إجابة نصية</div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleSubmitAll}
            className="w-full mt-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-lg transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "جاري الإرسال..." : "إرسال جميع الأسئلة"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Questions;
