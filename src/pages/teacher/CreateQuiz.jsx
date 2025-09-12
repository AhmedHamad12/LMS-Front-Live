import React, { useState, useEffect, useRef } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { Cookies } from "react-cookie";
import * as THREE from "three";

// MUI Date Time Picker Imports
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// --- Constants and Styles ---
const TARGET_TYPE_OPTIONS = [
  { label: "كورس", value: 1 },
  { label: "وحدة", value: 3 },
  { label: "درس", value: 2},
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

// Custom MUI Theme for Dark Mode Date Picker
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#22d3ee' },
    background: { paper: '#1e293b' },
  },
  typography: { fontFamily: 'Cairo, sans-serif' },
});

// --- Main Component ---
const CreateQuiz = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const id = cookies.get("teacherId");
  
  const [form, setForm] = useState({
    title: "",
    targetType: TARGET_TYPE_OPTIONS[0],
    targetId: null,
    timeLimitMinutes: 60,
    passScore: 50,
    maxAttempts: 1,
    startExam: dayjs(),
    endExam: dayjs().add(1, 'day'),
  });
  const [targetOptions, setTargetOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [targetLoading, setTargetLoading] = useState(false);
  const navigate = useNavigate();

  // --- Logic (Unaltered) ---
  useEffect(() => {
    const fetchTargets = async () => {
      if (!form.targetType) return;
      setTargetLoading(true);
      try {
        const res = await axios.get(`/api/Quiz/my-targets?targetType=${form.targetType.value}`, { headers: { Authorization: `Bearer ${token}` } });
        const options = res.data.items.map(item => ({ value: item.id, label: item.name }));
        setTargetOptions(options);
      } catch {
        setTargetOptions([]);
        toast.error("خطأ في تحميل الأهداف");
      } finally {
        setTargetLoading(false);
      }
    };
    fetchTargets();
  }, [form.targetType, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleSelectChange = (selected, { name }) => {
    setForm(prev => ({ ...prev, [name]: selected }));
    if (name === "targetType") {
      setForm(prev => ({ ...prev, targetId: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        teacherId: id,
        targetType: form.targetType.value,
        targetId: form.targetId ? form.targetId.value : null,
        timeLimitMinutes: Number(form.timeLimitMinutes),
        passScore: Number(form.passScore),
        maxAttempts: Number(form.maxAttempts),
        startExam: form.startExam.toISOString(),
        endExam: form.endExam.toISOString(),
      };

      const response = await toast.promise(
        axios.post(`/api/Quiz/CreateQuiz?CourseId=${payload.targetId || ''}`, payload, { headers: { Authorization: `Bearer ${token}` } }),
        { loading: "جاري إنشاء الاختبار...", success: "تم إنشاء الاختبار بنجاح!", error: "حدث خطأ أثناء الإنشاء" }
      );
      
      const quizId = response.data.id || response.data.quizId;
      navigate(`/teacher/quizzes/${quizId}/questions`);
    } catch {
      // Error handled by toast
    } finally {
      setLoading(false);
    }
  };
  
  // --- Three.js Refs and Effects ---
  const canvasRef = useRef(null);
  useEffect(() => { /* ... (Three.js setup as before) ... */ }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="text-gray-100 font-[Cairo] h-screen overflow-hidden w-full" dir="rtl">
          <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-black" />
          <main className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#00BFFF rgba(0,0,0,0.2)" }}>
            <div className="max-w-3xl mx-auto">
              <header className="mb-8">
                <button onClick={() => navigate("/teacher/quizzes")} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition font-semibold mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  <span>العودة لجميع الاختبارات</span>
                </button>
                <h1 className="text-4xl font-black text-white" style={{ textShadow: "0 0 15px rgba(0, 191, 255, 0.7)" }}>
                  إنشاء اختبار جديد
                </h1>
              </header>
              <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10 space-y-6">
                
                {/* --- Section 1: Basic Info --- */}
                <fieldset className="space-y-6">
                  <legend className="text-xl font-bold text-white border-b-2 border-cyan-400/20 pb-2 mb-4">المعلومات الأساسية</legend>
                  <div>
                    <label className="block text-slate-300 mb-2 font-semibold">عنوان الاختبار *</label>
                    <input type="text" name="title" value={form.title} onChange={handleChange} required className="w-full rounded-lg p-3 bg-slate-800/60 text-white border border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50 outline-none transition" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-300 mb-2 font-semibold">ربط الاختبار بـ *</label>
                      <Select name="targetType" value={form.targetType} onChange={handleSelectChange} options={TARGET_TYPE_OPTIONS} styles={customSelectStyles} placeholder="اختر المجال" isRtl isSearchable={false} />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-2 font-semibold">تحديد {form.targetType.label} *</label>
                      <Select name="targetId" value={form.targetId} onChange={handleSelectChange} options={targetOptions} styles={customSelectStyles} placeholder={targetLoading ? "جاري التحميل..." : `اختر ${form.targetType.label}`} isLoading={targetLoading} isRtl isSearchable noOptionsMessage={() => "لا توجد خيارات"} />
                    </div>
                  </div>
                </fieldset>
                
                {/* --- Section 2: Timing --- */}
                <fieldset className="space-y-6">
                  <legend className="text-xl font-bold text-white border-b-2 border-cyan-400/20 pb-2 mb-4">توقيت الاختبار</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-300 mb-2 font-semibold">تاريخ ووقت البدء *</label>
                      <DateTimePicker value={form.startExam} onChange={(newValue) => setForm(p => ({ ...p, startExam: newValue }))} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-2 font-semibold">تاريخ ووقت النهاية *</label>
                      <DateTimePicker value={form.endExam} onChange={(newValue) => setForm(p => ({ ...p, endExam: newValue }))} minDateTime={form.startExam} className="w-full" />
                    </div>
                  </div>
                </fieldset>

                {/* --- Section 3: Rules --- */}
                <fieldset>
                  <legend className="text-xl font-bold text-white border-b-2 border-cyan-400/20 pb-2 mb-4">قواعد الاختبار</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-slate-300 mb-2 font-semibold">المدة (بالدقائق) *</label>
                      <input type="number" name="timeLimitMinutes" value={form.timeLimitMinutes} onChange={handleChange} required min={1} className="w-full rounded-lg p-3 bg-slate-800/60 text-white border border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50 outline-none transition" />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-2 font-semibold">درجة النجاح *</label>
                      <input type="number" name="passScore" value={form.passScore} onChange={handleChange} required min={0} className="w-full rounded-lg p-3 bg-slate-800/60 text-white border border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50 outline-none transition" />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-2 font-semibold">عدد المحاولات *</label>
                      <input type="number" name="maxAttempts" value={form.maxAttempts} onChange={handleChange} required min={1} className="w-full rounded-lg p-3 bg-slate-800/60 text-white border border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50 outline-none transition" />
                    </div>
                  </div>
                </fieldset>
                
                <button type="submit" disabled={loading} className="w-full mt-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-lg transition-all transform hover:scale-105 disabled:opacity-60">
                  {loading ? "جاري الإنشاء..." : "إنشاء والتالي: إضافة الأسئلة"}
                </button>
              </form>
            </div>
          </main>
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default CreateQuiz;