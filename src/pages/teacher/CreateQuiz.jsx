import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { Cookies } from "react-cookie";
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

// TODO:Replace with actual auth

const TARGET_TYPE_OPTIONS = [
  { label: "كورس", value: 1 },
  { label: "درس", value: 2 },
  { label: "وحدة", value: 3 },
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

const CreateQuiz = () => {
  //TODO: id from cookies

  const cookies = new Cookies();
  const token = cookies.get("token");
  const id = cookies.get("teacherId");

  const [form, setForm] = useState({
    title: "",
    targetType: TARGET_TYPE_OPTIONS[0],
    targetId: null,
    timeLimitMinutes: "",
    passScore: 100,
    maxAttempts: 1,
    startExam:"",
    endExam:"",
  });
  const [targetOptions, setTargetOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [targetLoading, setTargetLoading] = useState(false);
  const navigate = useNavigate();

  //   TODO: authentication implementation when provided from backend teammmm

  // Fetch target options when targetType changes
  useEffect(() => {
    const fetchTargets = async () => {
      setTargetLoading(true);
      // console.log("id", id);

      try {
        const res = await axios.get(
          `/api/Quiz/my-targets?targetType=${form.targetType.value}`
        );
        const options = res.data.items.map((item)=>(
          {
            value:item.id,
            label:item.name
          }
        ))
        setTargetOptions(options);
        // console.log("target type data ", res.data);
      } catch {
        setTargetOptions([]);
        toast.error("error");
      } finally {
        setTargetLoading(false);
      }
    };
    fetchTargets();
    // eslint-disable-next-line
  }, [form.targetType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    
  };

  const handleSelectChange = (selected, { name }) => {
    setForm((prev) => ({ ...prev, [name]: selected }));
    // Reset targetId if targetType changes
    if (name === "targetType") {
      setForm((prev) => ({ ...prev, targetId: null }));
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
        // targetId: form.targetId ? form.targetId.value : "",
        //  form.targetId ? form.targetId.value : "",//TODO: fix for endpoint , or just use 16 //TODO: return to dynamix
        timeLimitMinutes: Number(form.timeLimitMinutes),
        passScore: Number(form.passScore),
        maxAttempts: Number(form.maxAttempts),
        startExam: form.startExam,
        endExam: form.endExam,
      };

      //      axios.post(`/api/Quiz/CreateQuiz?CourseId=${form.targetId ? form.targetId.value : ""}`, payload
      //or just 16
      // console.log("payload",payload);
//TODO: return to dynamic
      const response = await toast.promise(
        axios.post(`/api/Quiz/CreateQuiz?CourseId=${form.targetId ? form.targetId.value : ""}`, payload, {
          withCredentials: true,
        
        }),
        {
          loading: "جاري إنشاء الاختبار...",
          success: "تم إنشاء الاختبار بنجاح!",
          error: "حدث خطأ أثناء إنشاء الاختبار",
        }
      );
      const quizId = response.data.id || response.data.quizId;
      navigate(`/teacher/quizzes/${quizId}/questions`);
    } catch {
      // Error handled by toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col gap-5  items-center justify-center  bg-opacity-80"
      dir="rtl"
      style={{ fontFamily: "Cairo, sans-serif" }}
    >
        <div className="w-[80%] mt-5">
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
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg glass-effect rounded-2xl p-8 border border-white/10 bg-gradient-to-br from-slate-800/40 to-slate-900/50 backdrop-blur-lg shadow-xl"
      >
        <p
          className="text-3xl font-black text-white mb-6 text-center"
          style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
        >
          إنشاء اختبار جديد
        </p>
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">عنوان الاختبار *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full rounded-lg p-3 bg-slate-900/60 text-white border border-cyan-400/20 focus:border-cyan-400 outline-none"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">المجال المطلوب *</label>
          <Select
            name="targetType"
            value={form.targetType}
            onChange={handleSelectChange}
            options={TARGET_TYPE_OPTIONS}
            styles={customSelectStyles}
            placeholder="اختر المجال"
            isRtl
            isSearchable={false}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">
            المجالات المتوفرة *
          </label>
          <Select
            name="targetId"
            value={form.targetId}
            onChange={handleSelectChange}
            options={targetOptions}
            styles={customSelectStyles}
            placeholder={targetLoading ? "جاري التحميل..." : "اختر الهدف"}
            isLoading={targetLoading}
            isRtl
            isSearchable
            noOptionsMessage={() => "لا توجد خيارات متاحة"}
          />
        </div>

{/* Start Date Picker */}
<div>
  <label className="block text-gray-300 my-3">تاريخ بدء الاختبار *</label>
  <input
    type="datetime-local"
    name="startExam"
    value={form.startExam ? form.startExam.slice(0, 16) : ""}
    onChange={(e) =>
      setForm({
        ...form,
        startExam: e.target.value,
      })
    }
    required
    className="w-full p-3 rounded-lg text-lg bg-slate-900/60 border border-cyan-400/20 text-white
               focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30
               transition-all
               [&::-webkit-calendar-picker-indicator]:filter
               [&::-webkit-calendar-picker-indicator]:invert
               [&::-webkit-calendar-picker-indicator]:brightness-0
               [&::-webkit-calendar-picker-indicator]:saturate-100
               [&::-webkit-calendar-picker-indicator]:hue-rotate-[180deg]
               [&::-webkit-calendar-picker-indicator]:brightness-[1.2]
               [&::-webkit-calendar-picker-indicator]:contrast-[1.2]"
  />
</div>

{/* End Date Picker */}
<div>
  <label className="block text-gray-300 my-3">تاريخ نهاية الاختبار *</label>
  <input
    type="datetime-local"
    name="endExam"
    value={form.endExam ? form.endExam.slice(0, 16) : ""}
    onChange={(e) =>
      setForm({
        ...form,
        endExam: e.target.value,
      })
    }
    required
    min={form.startExam ? form.startExam.slice(0, 16) : undefined}
    className="w-full p-3 rounded-lg text-lg bg-slate-900/60 border border-cyan-400/20 text-white
               focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30
               transition-all
               [&::-webkit-calendar-picker-indicator]:filter
               [&::-webkit-calendar-picker-indicator]:invert
               [&::-webkit-calendar-picker-indicator]:brightness-0
               [&::-webkit-calendar-picker-indicator]:saturate-100
               [&::-webkit-calendar-picker-indicator]:hue-rotate-[180deg]
               [&::-webkit-calendar-picker-indicator]:brightness-[1.2]
               [&::-webkit-calendar-picker-indicator]:contrast-[1.2]"
  />
</div>





        <div className="my-6">
          <label className="block text-gray-300 mb-2">المدة (بالدقائق) *</label>
          <input
            type="number"
            name="timeLimitMinutes"
            value={form.timeLimitMinutes}
            onChange={handleChange}
            required
            min={1}
            className="w-full rounded-lg p-3 bg-slate-900/60 text-white border border-cyan-400/20 focus:border-cyan-400 outline-none"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">درجة النجاح *</label>
          <input
            type="number"
            name="passScore"
            value={form.passScore}
            onChange={handleChange}
            required
            min={1}
            className="w-full rounded-lg p-3 bg-slate-900/60 text-white border border-cyan-400/20 focus:border-cyan-400 outline-none"
          />
        </div>
        <div className="mb-8">
          <label className="block text-gray-300 mb-2">عدد المحاولات *</label>
          <input
            type="number"
            name="maxAttempts"
            value={form.maxAttempts}
            onChange={handleChange}
            required
            min={1}
            className="w-full rounded-lg p-3 bg-slate-900/60 text-white border border-cyan-400/20 focus:border-cyan-400 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-lg transition-colors disabled:opacity-60"
        >
          {loading ? "...جاري الإنشاء" : "إنشاء الاختبار"}
        </button>
      </form>
    </div>
  );
};

export default CreateQuiz;
