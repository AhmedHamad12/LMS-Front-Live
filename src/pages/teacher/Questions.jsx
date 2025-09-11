import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as THREE from "three";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import toast from "react-hot-toast";
import Select from "react-select";

// --- Constants and Styles ---
const QUESTION_TYPE_OPTIONS = [
  { value: 1, label: "اختيار من متعدد" },
  { value: 2, label: "صح أو خطأ" },
];

const customSelectStyles = {
  control: (p, s) => ({...p, backgroundColor:"#1e293b", borderColor:s.isFocused?"#22d3ee":"#334155", color:"#fff", borderRadius:"0.5rem", minHeight:"48px", boxShadow:s.isFocused?"0 0 0 1px #22d3ee":"none", fontFamily:"Cairo, sans-serif", '&:hover':{borderColor:"#0891b2"}}),
  menu: (p) => ({...p, backgroundColor:"#1e293b", borderRadius:"0.5rem", zIndex:20}),
  option: (p, s) => ({...p, backgroundColor:s.isSelected?"#06b6d4":s.isFocused?"#334155":"#1e293b", color:s.isSelected?"#fff":"#e2e8f0", fontWeight:s.isSelected?"bold":"normal", borderRadius:"0.5rem", padding:"10px 16px", cursor:"pointer"}),
  singleValue: (p) => ({...p, color:"#fff"}),
  input: (p) => ({...p, color:"#fff"}),
  placeholder: (p) => ({...p, color:"#94a3b8"}),
  dropdownIndicator: (p) => ({...p, color:"#0891b2", '&:hover':{color:"#22d3ee"}}),
};

// --- Main Component ---
const Questions = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  // --- State ---
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    imageFile: null,
    imageUrl: "",
    type: QUESTION_TYPE_OPTIONS[0],
    options: [
      { text: "", isCorrect: false }, { text: "", isCorrect: false },
      { text: "", isCorrect: false }, { text: "", isCorrect: false },
    ],
  });

  // --- Refs ---
  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const cookies = new Cookies();
  const token = cookies.get("token");

  // --- Data Fetching ---
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`/api/Quiz/${quizId}/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuestions(response.data);
      } catch (error) {
        console.log(error);
        toast.error("فشل في تحميل الأسئلة الحالية.");
      }
    };
    fetchQuestions();
  }, [quizId, token]);

  // --- Handlers ---
  const handleInputChange = (field, value) => setNewQuestion(p => ({ ...p, [field]: value }));
  const handleOptionChange = (idx, value) => setNewQuestion(p => ({ ...p, options: p.options.map((opt, i) => i === idx ? { ...opt, text: value } : opt) }));
  const handleCorrectChange = (idx) => setNewQuestion(p => ({ ...p, options: p.options.map((opt, i) => ({ ...opt, isCorrect: i === idx })) }));
  
  const handleTypeChange = (selected) => {
    let options;
    if (selected.value === 1) {
      options = [ { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false } ];
    } else if (selected.value === 2) {
      options = [ { text: "صح", isCorrect: false }, { text: "خطأ", isCorrect: false } ];
    } else {
      options = [];
    }
    setNewQuestion({ ...newQuestion, type: selected, options });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewQuestion(p => ({ ...p, imageFile: file, imageUrl: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newQuestion.type.value === 1 || newQuestion.type.value === 2) {
      if (newQuestion.options.findIndex(opt => opt.isCorrect) === -1) {
        setValidationError("يجب اختيار إجابة صحيحة واحدة على الأقل.");
        return;
      }
    }
    setValidationError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("Text", newQuestion.text);
      formData.append("type", newQuestion.type.value);
      if (newQuestion.imageFile) {
        formData.append("QuestionImage", newQuestion.imageFile);
      }
      newQuestion.options.forEach(opt => formData.append("Option", opt.text));
      formData.append("CorrectAnswerIndex", newQuestion.options.findIndex(opt => opt.isCorrect));

      await axios.post(`/api/Quiz/${quizId}/questions`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      
      toast.success("تمت إضافة السؤال بنجاح");
      const response = await axios.get(`/api/Quiz/${quizId}/questions`, { headers: { Authorization: `Bearer ${token}` } });
      setQuestions(response.data);
      setNewQuestion({
        text: "", imageFile: null, imageUrl: "", type: QUESTION_TYPE_OPTIONS[0],
        options: [ { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false } ],
      });
    } catch {
      toast.error("حدث خطأ أثناء الإضافة");
    } finally {
      setLoading(false);
    }
  };

  const handleFinishQuiz = () => {
    // This is where you will call the "end quiz" endpoint in the future.
    toast.success("تم إنهاء الاختبار وهو جاهز الآن للطلاب!");
    navigate("/teacher/quizzes");
  };

  // --- Three.js Effect ---
  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    const createStarfield = (count, size, color) => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i*3+0] = (Math.random() - 0.5) * 200;
            positions[i*3+1] = (Math.random() - 0.5) * 200;
            positions[i*3+2] = (Math.random() - 0.5) * 200;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ size, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.7 });
        return new THREE.Points(geometry, material);
    };
    const stars = [createStarfield(8000, 0.05, 0x888888), createStarfield(5000, 0.1, 0xbbbbbb), createStarfield(1500, 0.15, 0xffffff)];
    stars.forEach(s => scene.add(s));
    const clock = new THREE.Clock();
    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        stars[0].rotation.y = elapsedTime * 0.01;
        stars[1].rotation.y = elapsedTime * 0.02;
        stars[2].rotation.y = elapsedTime * 0.03;
        renderer.render(scene, camera);
    };
    animate();
  }, []);

  return (
    <div className="text-gray-100 font-[Cairo] h-screen overflow-hidden w-full" dir="rtl">
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-black" />
      <main ref={mainContentRef} className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#00BFFF rgba(0,0,0,0.2)" }}>
        <div className="max-w-7xl mx-auto">
          <header className="mb-10">
            <button onClick={() => navigate("/teacher/quizzes")} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition font-semibold mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              <span>العودة لجميع الاختبارات</span>
            </button>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h1 className="text-4xl font-black text-white" style={{ textShadow: "0 0 15px rgba(0, 191, 255, 0.7)" }}>إدارة الأسئلة</h1>
              <button onClick={handleFinishQuiz} className="mt-4 sm:mt-0 flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-700/80 text-white font-bold hover:bg-slate-600/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                إنهاء وإعداد الاختبار
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Side: Add Question Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10 space-y-6">
              <h2 className="text-2xl font-bold text-white mb-2">إضافة سؤال جديد</h2>
              <div>
                <label className="block text-slate-300 mb-2 font-semibold">نوع السؤال *</label>
                <Select value={newQuestion.type} onChange={handleTypeChange} options={QUESTION_TYPE_OPTIONS} styles={customSelectStyles} placeholder="اختر نوع السؤال" isRtl isSearchable={false} />
              </div>
              <div>
                <label className="block text-slate-300 mb-2 font-semibold">نص السؤال *</label>
                <textarea rows="3" className="w-full rounded-lg p-3 bg-slate-800/60 text-white border border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50 outline-none transition" value={newQuestion.text} onChange={(e) => handleInputChange("text", e.target.value)} required />
              </div>
              <div>
                <label className="block text-slate-300 mb-2 font-semibold">صورة (اختياري)</label>
                <label htmlFor="image-upload" className="relative cursor-pointer flex flex-col justify-center items-center w-full h-32 px-4 py-6 border-2 border-dashed border-slate-600 rounded-lg hover:border-cyan-500 transition-colors">
                  {newQuestion.imageUrl ? (
                    <img src={newQuestion.imageUrl} alt="Preview" className="h-full w-full object-contain rounded-md" />
                  ) : (
                    <div className="text-center text-slate-400"><svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><p className="mt-1 text-sm">اختر صورة</p></div>
                  )}
                </label>
                <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="sr-only"/>
              </div>
              
              {newQuestion.type.value === 1 && (
                <div className="space-y-3">
                  <label className="block text-slate-300 font-semibold">الخيارات (اختر الإجابة الصحيحة) *</label>
                  {newQuestion.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-3">
                      <button type="button" onClick={() => handleCorrectChange(optIdx)} className={`flex-shrink-0 w-6 h-6 rounded-full border-2 ${opt.isCorrect ? 'border-cyan-400 bg-cyan-400' : 'border-slate-500'} flex items-center justify-center transition`}>
                        {opt.isCorrect && <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </button>
                      <input type="text" className="w-full rounded-lg p-2 bg-slate-800/60 text-white border border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50 outline-none transition" placeholder={`الخيار ${optIdx + 1}`} value={opt.text} onChange={(e) => handleOptionChange(optIdx, e.target.value)} required />
                    </div>
                  ))}
                </div>
              )}
              {newQuestion.type.value === 2 && (
                <div>
                  <label className="block text-slate-300 mb-3 font-semibold">الإجابة الصحيحة *</label>
                  <div className="flex gap-4">
                    {newQuestion.options.map((opt, optIdx) => (
                      <button type="button" key={optIdx} onClick={() => handleCorrectChange(optIdx)} className={`flex items-center gap-2 p-3 rounded-lg border-2 transition ${opt.isCorrect ? 'bg-cyan-500/20 border-cyan-400' : 'bg-slate-800 border-slate-600 hover:border-slate-500'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 ${opt.isCorrect ? 'border-cyan-400 bg-cyan-400' : 'border-slate-500'}`} /> {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {validationError && <p className="text-red-400 text-sm">{validationError}</p>}
              <button type="submit" className="w-full mt-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-cyan-500 text-white font-black text-lg transition-all transform hover:scale-105 disabled:opacity-60" disabled={loading}>
                {loading ? "جاري الإضافة..." : "إضافة السؤال"}
              </button>
            </form>

            {/* Right Side: Existing Questions */}
            <div className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold text-white mb-2">الأسئلة الحالية ({questions.length})</h2>
                {questions.length === 0 ? (
                    <div className="text-center text-slate-400 bg-slate-900/50 rounded-xl p-8">لا توجد أسئلة بعد. ابدأ بإضافة سؤالك الأول!</div>
                ) : (
                    questions.map((q, idx) => {
                        const isOpen = openAccordion === idx;
                        return (
                            <div key={q.id || idx} className="bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-lg">
                                <button onClick={() => setOpenAccordion(isOpen ? null : idx)} className="w-full flex items-center gap-4 p-4 text-start">
                                    <span className="flex-grow font-semibold text-white">{idx + 1}. {q.text}</span>
                                    <span className={`px-2 py-1 text-xs rounded-full font-bold ${q.type===1 ? 'bg-cyan-900 text-cyan-300' : 'bg-green-900 text-green-300'}`}>{q.type === 1 ? "اختيار متعدد" : "صح/خطأ"}</span>
                                    <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
                                    <div className="border-t border-slate-700/50 p-4 space-y-3">
                                        {q.imageUrl && <a href={q.imageUrl} target="_blank" rel="noopener noreferrer"><img src={q.imageUrl} alt="صورة السؤال" className="max-h-40 rounded-lg object-contain mb-3 cursor-pointer" /></a>}
                                        <div className="space-y-2">
                                            {q.options.map((opt, i) => (
                                                <div key={i} className="flex items-center gap-3 p-2 rounded-md text-sm font-semibold bg-slate-800/50 text-slate-300">
                                                    <div className="w-2 h-2 rounded-full bg-slate-500 flex-shrink-0"></div>
                                                    <span>{opt.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Questions;