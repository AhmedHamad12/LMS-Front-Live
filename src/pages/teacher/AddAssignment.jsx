import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Cookies } from "react-cookie";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import Select from "react-select";
import { ArrowLeft, FileUp } from "lucide-react";

// --- Styles for React-Select ---
const customSelectStyles = {
  control: (p, s) => ({...p, backgroundColor:"#1e293b", borderColor:s.isFocused?"#22d3ee":"#334155", color:"#fff", borderRadius:"0.5rem", minHeight:"52px", boxShadow:s.isFocused?"0 0 0 1px #22d3ee":"none", fontFamily:"Cairo, sans-serif", '&:hover':{borderColor:"#0891b2"}}),
  menu: (p) => ({...p, backgroundColor:"#1e293b", borderRadius:"0.5rem", zIndex:20}),
  option: (p, s) => ({...p, backgroundColor:s.isSelected?"#06b6d4":s.isFocused?"#334155":"#1e293b", color:s.isSelected?"#fff":"#e2e8f0", fontWeight:s.isSelected?"bold":"normal", borderRadius:"0.5rem", padding:"10px 16px", cursor:"pointer"}),
  singleValue: (p) => ({...p, color:"#fff"}),
  placeholder: (p) => ({...p, color:"#94a3b8"}),
};

const PRIORITY_OPTIONS = [
  { value: 1, label: "منخفضة" },
  { value: 2, label: "متوسطة" },
  { value: 3, label: "عالية" },
];

const FileInput = ({ file, setFile }) => (
    <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700">
        <label htmlFor="assignment-file" className="relative cursor-pointer flex justify-center items-center w-full h-24 px-4 py-6 border-2 border-dashed border-slate-600 rounded-lg hover:border-cyan-500 transition-colors duration-300">
            {!file ? (
                <div className="text-center text-slate-400">
                    <FileUp className="mx-auto h-8 w-8" />
                    <p className="mt-1 text-sm">اختر ملف الواجب (PDF, DOCX)</p>
                </div>
            ) : (
                <div className="text-center font-semibold text-green-400">
                    <p className="text-sm mt-1">{file.name}</p>
                    <button type="button" onClick={(e) => { e.preventDefault(); setFile(null); }} className="mt-2 text-xs text-red-400 hover:underline">إزالة</button>
                </div>
            )}
            <input id="assignment-file" type="file" accept="application/pdf,.doc,.docx" onChange={e => setFile(e.target.files[0])} className="sr-only"/>
        </label>
    </div>
);

export default function AddAssignment() {
  const location = useLocation();
  const navigate = useNavigate();

  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(PRIORITY_OPTIONS[0]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const { courseId, unitId: chapterId, lessonId } = location.state || {};

  const cookies = new Cookies();
  const token = cookies.get("token");

  // **FIXED:** Ensured form submission logic matches the Swagger definition
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    
    // Append all fields as per the screenshot
    formData.append("CourseId", +courseId);
    formData.append("UnitCourseId", +chapterId);
    formData.append("LessonId", +lessonId);
    
    // Fixed: Using ISOString to match the required `date-time` format
    formData.append("CreationDate", new Date().toISOString());
    // Fixed: Converting DueDate to ISOString format as well
    if (dueDate) {
        formData.append("DueDate", new Date(dueDate).toISOString());
    }
    
    if (file) {
        formData.append("Files", file);
    }
    
    // Added: Missing AssignmentDescription field
    formData.append("AssignmentDescription", description);
    
    formData.append("AssignmentPriority", +priority.value);
    formData.append("AssignmentCategory", 1); // Default category as per screenshot

    await toast.promise(
        axios.post(`/api/Assignment/AddAssignmemt`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        }),
        {
            loading: "جاري إضافة الواجب...",
            success: () => {
                navigate(-1); // Go back to the previous page
                return "تمت إضافة الواجب بنجاح!";
            },
            error: (err) => {
                console.error(err);
                // Providing more specific error feedback if available
                return err.response?.data?.title || err.response?.data || "فشل في إضافة الواجب.";
            },
        }
    );

    setLoading(false);
  };

  return (
    <div className="text-gray-100 font-[Cairo] p-4 sm:p-6 lg:p-8 h-full">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition font-semibold mb-4">
                <ArrowLeft size={20} />
                <span>العودة للدرس</span>
            </button>
            <h1 className="text-4xl font-black text-white" style={{ textShadow: "0 0 15px rgba(0, 191, 255, 0.7)" }}>
                إضافة واجب جديد
            </h1>
            <p className="text-slate-400 text-lg mt-2">
                قم بتعبئة تفاصيل الواجب المطلوب من الطلاب.
            </p>
        </header>

        <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10 space-y-8">
            <fieldset>
                <legend className="text-xl font-bold text-white border-b-2 border-cyan-400/20 pb-2 mb-4 w-full">تفاصيل الواجب</legend>
                <div>
                    <label className="block text-slate-300 mb-2 font-semibold">وصف الواجب *</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={5}
                        className="w-full rounded-lg p-3 bg-slate-800/60 text-white border border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50 outline-none transition"
                        placeholder="اكتب هنا شرحًا تفصيليًا للواجب، وما هو المطلوب من الطالب..."
                    />
                </div>
            </fieldset>

            <fieldset>
                <legend className="text-xl font-bold text-white border-b-2 border-cyan-400/20 pb-2 mb-4 w-full">الإعدادات والملفات</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-slate-300 mb-2 font-semibold">تاريخ التسليم النهائي *</label>
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required
                            className="w-full p-3 rounded-lg text-lg bg-slate-800/60 border border-slate-600 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50 transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 mb-2 font-semibold">الأولوية *</label>
                        <Select value={priority} onChange={setPriority} options={PRIORITY_OPTIONS} styles={customSelectStyles} placeholder="اختر الأولوية" isRtl isSearchable={false} />
                    </div>
                </div>
                <div className="mt-6">
                    <label className="block text-slate-300 mb-2 font-semibold">إرفاق ملف (اختياري)</label>
                    <FileInput file={file} setFile={setFile} />
                </div>
            </fieldset>
            
            <div className="border-t border-slate-700/50 pt-6">
                <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-lg transition-all transform hover:scale-105 disabled:opacity-60">
                    {loading ? "جاري الإضافة..." : "إضافة الواجب"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}