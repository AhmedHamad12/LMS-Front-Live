import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as THREE from "three";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import toast from "react-hot-toast";
import Loading from "../../Components/Loading";
import Select from "react-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  X,
  Image as ImageIcon,
  Check,
} from "lucide-react";

// --- Constants and Styles ---
const QUESTION_TYPE_OPTIONS = [
  { value: 1, label: "اختيار من متعدد" },
  { value: 2, label: "صح أو خطأ" },
];
const customSelectStyles = {
  control: (p, s) => ({
    ...p,
    backgroundColor: "#1e293b",
    borderColor: s.isFocused ? "#22d3ee" : "#334155",
    color: "#fff",
    borderRadius: "0.5rem",
    minHeight: "48px",
    boxShadow: s.isFocused ? "0 0 0 1px #22d3ee" : "none",
    fontFamily: "Cairo, sans-serif",
    "&:hover": { borderColor: "#0891b2" },
  }),
  menu: (p) => ({
    ...p,
    backgroundColor: "#1e293b",
    borderRadius: "0.5rem",
    zIndex: 20,
  }),
  option: (p, s) => ({
    ...p,
    backgroundColor: s.isSelected
      ? "#06b6d4"
      : s.isFocused
      ? "#334155"
      : "#1e293b",
    color: s.isSelected ? "#fff" : "#e2e8f0",
    fontWeight: s.isSelected ? "bold" : "normal",
    borderRadius: "0.5rem",
    padding: "10px 16px",
    cursor: "pointer",
  }),
  singleValue: (p) => ({ ...p, color: "#fff" }),
  input: (p) => ({ ...p, color: "#fff" }),
  placeholder: (p) => ({ ...p, color: "#94a3b8" }),
  dropdownIndicator: (p) => ({
    ...p,
    color: "#0891b2",
    "&:hover": { color: "#22d3ee" },
  }),
};

// --- Confirmation Modal Component ---
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title,
  message,
  confirmText,
  confirmIcon,
}) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-slate-900 border border-yellow-500/20 rounded-2xl shadow-2xl w-full max-w-md p-6 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-500/10 mb-4">
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-slate-400 mb-1">{message}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold transition disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="px-4 py-3 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white font-bold transition disabled:bg-yellow-800 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  "جاري التنفيذ..."
                ) : (
                  <>
                    {confirmIcon}
                    {confirmText}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Main Component ---
const Questions = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [openAccordion, setOpenAccordion] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [isEndQuizModalOpen, setIsEndQuizModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

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

  const canvasRef = useRef(null);
  const cookies = new Cookies();
  const token = cookies.get("token");

  // --- Data Fetching using React Query ---
  const { data: questionsData, isLoading: isLoadingQuestions, isFetching: isFetchingQuestions } = useQuery({
    queryKey: ["quizQuestions", quizId],
    queryFn: async () => {
      try {
        // First try the endpoint with correct answers parameter
        const { data } = await axios.get(`/api/Quiz/${quizId}/questions`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { includeCorrectAnswers: true }
        });
        return Array.isArray(data) ? data : [];
      } catch {
        console.log("Trying alternative endpoint...");
        // Fallback to original endpoint if the parameter doesn't work
        const { data } = await axios.get(`/api/Quiz/${quizId}/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return Array.isArray(data) ? data : [];
      }
    },
    enabled: !!quizId && !!token,
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache data
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, // Always refetch on mount
  });

  const isQuizFinished = useMemo(
    () => questionsData?.[0]?.isQuizEnd || false,
    [questionsData]
  );
  const questions = useMemo(() => questionsData || [], [questionsData]);

  // --- Mutations ---
  const addQuestionMutation = useMutation({
    mutationFn: (formData) =>
      axios.post(`/api/Quiz/${quizId}/questions`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }),
    onSuccess: () => {
      toast.success("تمت إضافة السؤال بنجاح");
      
      // Refetch fresh data from API instead of using stale cache
      queryClient.invalidateQueries({ queryKey: ["quizQuestions", quizId] });
      
      // Reset form
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
    },
    onError: (error) => {
      console.error("Add question error:", error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.title || 
                          "حدث خطأ أثناء الإضافة";
      toast.error(errorMessage);
    },
  });

  const endQuizMutation = useMutation({
    // ---!!! هذا هو السطر الذي تم تصحيحه نهائياً بناءً على cURL ---
    mutationFn: () =>
      axios.post(
        `/api/Quiz/endExamFromTeacher`, // الرابط الأساسي
        null, // Body فارغ
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { quizId: parseInt(quizId) }, // quizId كـ Query Parameter
        }
      ),
    onSuccess: () => {
      toast.success("تم إنهاء الاختبار وهو جاهز الآن للطلاب!");
      // Refetch fresh data from API to get updated isQuizEnd status
      queryClient.invalidateQueries({ queryKey: ["quizQuestions", quizId] });
      setIsEndQuizModalOpen(false);
    },
    onError: (error) => {
      console.error("End quiz error:", error);
      toast.error("فشل في إنهاء الاختبار.");
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId) =>
      axios.delete(`/api/Quiz/question/${questionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      toast.success("تم حذف السؤال بنجاح");
      // Refetch fresh data from API instead of using stale cache
      queryClient.invalidateQueries({ queryKey: ["quizQuestions", quizId] });
      setQuestionToDelete(null);
    },
    onError: () => toast.error("فشل في حذف السؤال."),
  });

  // --- Handlers & Effects (بدون تغيير) ---
  const handleInputChange = (field, value) =>
    setNewQuestion((p) => ({ ...p, [field]: value }));
  const handleOptionChange = (idx, value) =>
    setNewQuestion((p) => ({
      ...p,
      options: p?.options?.map((opt, i) =>
        i === idx ? { ...opt, text: value } : opt
      ),
    }));
  const handleCorrectChange = (idx) =>
    setNewQuestion((p) => ({
      ...p,
      options: p?.options?.map((opt, i) => ({ ...opt, isCorrect: i === idx })),
    }));
  const handleTypeChange = (selected) => {
    let options;
    if (selected.value === 1) {
      options = [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ];
    } else if (selected.value === 2) {
      options = [
        { text: "صح", isCorrect: false },
        { text: "خطأ", isCorrect: false },
      ];
    } else {
      options = [];
    }
    setNewQuestion({ ...newQuestion, type: selected, options });
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewQuestion((p) => ({
      ...p,
      imageFile: file,
      imageUrl: URL.createObjectURL(file),
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (addQuestionMutation.isPending) {
      return;
    }
    
    // Validate question text
    if (!newQuestion.text.trim()) {
      setValidationError("يجب إدخال نص السؤال.");
      return;
    }
    
    // Validate question text length
    if (newQuestion.text.trim().length < 5) {
      setValidationError("نص السؤال يجب أن يكون 5 أحرف على الأقل.");
      return;
    }
    
    // Validate question type
    if (!newQuestion?.type?.value) {
      setValidationError("يجب اختيار نوع السؤال.");
      return;
    }
    
    // Validate options for multiple choice questions
    if (newQuestion?.type?.value === 1) {
      const validOptions = newQuestion.options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        setValidationError("يجب إدخال خيارين على الأقل للاختيار من متعدد.");
        return;
      }
      
      // Check if all options have text
      const emptyOptions = newQuestion.options.filter(opt => !opt.text.trim());
      if (emptyOptions.length > 0) {
        setValidationError("جميع الخيارات يجب أن تحتوي على نص.");
        return;
      }
      
      // Check if correct answer is selected
      if (newQuestion?.options?.findIndex((opt) => opt.isCorrect) === -1) {
        setValidationError("يجب اختيار الإجابة الصحيحة.");
        return;
      }
    }
    
    // Validate true/false questions
    if (newQuestion?.type?.value === 2) {
      if (newQuestion?.options?.findIndex((opt) => opt.isCorrect) === -1) {
        setValidationError("يجب اختيار الإجابة الصحيحة (صح أو خطأ).");
        return;
      }
    }
    
    setValidationError("");
    
    const formData = new FormData();
    formData.append("Text", newQuestion.text.trim());
    formData.append("Type", newQuestion.type.value); // Fixed: capitalized field name
    if (newQuestion.imageFile)
      formData.append("QuestionImage", newQuestion.imageFile);
    
    // Only append non-empty options
    const validOptions = newQuestion.options.filter(opt => opt.text.trim());
    validOptions.forEach((opt) => formData.append("Option", opt.text.trim()));
    
    formData.append(
      "CorrectAnswerIndex",
      newQuestion.options.findIndex((opt) => opt.isCorrect)
    );
    
    addQuestionMutation.mutate(formData);
  };
  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    const createStarfield = (count, size, color) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      }
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      const material = new THREE.PointsMaterial({
        size,
        color,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.7,
      });
      return new THREE.Points(geometry, material);
    };
    const stars = [
      createStarfield(8000, 0.05, 0x888888),
      createStarfield(5000, 0.1, 0xbbbbbb),
      createStarfield(1500, 0.15, 0xffffff),
    ];
    stars.forEach((s) => scene.add(s));
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

  if (isLoadingQuestions)
    return (
      <div className="fixed inset-0 bg-black">
        <Loading message="جاري تحميل الأسئلة..." />
      </div>
    );

  return (
    <>
      <ConfirmModal
        isOpen={isEndQuizModalOpen}
        onClose={() => setIsEndQuizModalOpen(false)}
        onConfirm={() => endQuizMutation.mutate()}
        isLoading={endQuizMutation.isPending}
        title="هل أنت متأكد من إنهاء الاختبار؟"
        message="بمجرد الإنهاء، لن تتمكن من إضافة أو تعديل أو حذف أي أسئلة أخرى. سيصبح الاختبار متاحاً للطلاب."
        confirmText="نعم، قم بالإنهاء"
        confirmIcon={<CheckCircle size={18} />}
      />
      <ConfirmModal
        isOpen={!!questionToDelete}
        onClose={() => setQuestionToDelete(null)}
        onConfirm={() => deleteQuestionMutation.mutate(questionToDelete.id)}
        isLoading={deleteQuestionMutation.isPending}
        title="هل أنت متأكد من حذف السؤال؟"
        message={`سيتم حذف السؤال "${questionToDelete?.text}" بشكل نهائي.`}
        confirmText="نعم، قم بالحذف"
        confirmIcon={<Trash2 size={18} />}
      />

      <div
        className="text-gray-100 font-[Cairo] h-screen overflow-hidden w-full"
        dir="rtl"
      >
        <canvas
          ref={canvasRef}
          className="fixed top-0 left-0 w-full h-full -z-10 bg-black"
        />
        <main
          className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#00BFFF rgba(0,0,0,0.2)",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <header className="mb-10">
              <button
                onClick={() => navigate("/teacher/quizzes")}
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition font-semibold mb-4"
              >
                <ArrowRight size={18} />
                <span>العودة لجميع الاختبارات</span>
              </button>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h1
                  className="text-4xl font-black text-white"
                  style={{ textShadow: "0 0 15px rgba(0, 191, 255, 0.7)" }}
                >
                  إدارة الأسئلة
                </h1>
                {!isQuizFinished && (
                  <button
                    onClick={() => setIsEndQuizModalOpen(true)}
                    className="mt-4 sm:mt-0 flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-700/80 text-white font-bold hover:bg-slate-600/80 transition-colors"
                  >
                    <CheckCircle size={20} />
                    إنهاء وإعداد الاختبار
                  </button>
                )}
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <AnimatePresence>
                {!isQuizFinished ? (
                  <motion.form
                    key="add-form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="lg:col-span-3 bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10 space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-white mb-2">
                      إضافة سؤال جديد
                    </h2>
                    {/* Form fields... */}
                    <div>
                      <label className="block text-slate-300 mb-2 font-semibold">
                        نوع السؤال *
                      </label>
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
                    <div>
                      <label className="block text-slate-300 mb-2 font-semibold">
                        نص السؤال *
                      </label>
                      <textarea
                        rows="3"
                        className="w-full rounded-lg p-3 bg-slate-800/60 text-white border border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50 outline-none transition"
                        value={newQuestion.text}
                        onChange={(e) =>
                          handleInputChange("text", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-2 font-semibold">
                        صورة (اختياري)
                      </label>
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer flex flex-col justify-center items-center w-full h-32 px-4 py-6 border-2 border-dashed border-slate-600 rounded-lg hover:border-cyan-500 transition-colors"
                      >
                        {newQuestion.imageUrl ? (
                          <img
                            src={newQuestion.imageUrl}
                            alt="Preview"
                            className="h-full w-full object-contain rounded-md"
                          />
                        ) : (
                          <div className="text-center text-slate-400">
                            <ImageIcon className="mx-auto h-8 w-8" />
                            <p className="mt-1 text-sm">اختر صورة</p>
                          </div>
                        )}
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </div>
                    {newQuestion.type.value === 1 && (
                      <div className="space-y-3">
                        <label className="block text-slate-300 font-semibold">
                          الخيارات (اختر الإجابة الصحيحة) *
                        </label>
                        {newQuestion?.options?.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleCorrectChange(optIdx)}
                              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 ${
                                opt.isCorrect
                                  ? "border-cyan-400 bg-cyan-400"
                                  : "border-slate-500"
                              } flex items-center justify-center transition`}
                            >
                              {opt.isCorrect && (
                                <Check
                                  className="w-4 h-4 text-slate-900"
                                  strokeWidth={3}
                                />
                              )}
                            </button>
                            <input
                              type="text"
                              className="w-full rounded-lg p-2 bg-slate-800/60 text-white border border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50 outline-none transition"
                              placeholder={`الخيار ${optIdx + 1}`}
                              value={opt.text}
                              onChange={(e) =>
                                handleOptionChange(optIdx, e.target.value)
                              }
                              required
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {newQuestion.type.value === 2 && (
                      <div>
                        <label className="block text-slate-300 mb-3 font-semibold">
                          الإجابة الصحيحة *
                        </label>
                        <div className="flex gap-4">
                          {newQuestion?.options?.map((opt, optIdx) => (
                            <button
                              type="button"
                              key={optIdx}
                              onClick={() => handleCorrectChange(optIdx)}
                              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition ${
                                opt.isCorrect
                                  ? "bg-cyan-500/20 border-cyan-400"
                                  : "bg-slate-800 border-slate-600 hover:border-slate-500"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full border-2 ${
                                  opt.isCorrect
                                    ? "border-cyan-400 bg-cyan-400"
                                    : "border-slate-500"
                                }`}
                              />{" "}
                              {opt.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {validationError && (
                      <p className="text-red-400 text-sm">{validationError}</p>
                    )}
                    <button
                      type="submit"
                      className="w-full mt-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-cyan-500 text-white font-black text-lg transition-all transform hover:scale-105 disabled:opacity-60"
                      disabled={addQuestionMutation.isPending}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {addQuestionMutation.isPending ? (
                          "جاري الإضافة..."
                        ) : (
                          <>
                            <Plus size={20} /> إضافة السؤال
                          </>
                        )}
                      </div>
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="quiz-finished"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="lg:col-span-3 bg-slate-900/50 backdrop-blur-lg border border-green-400/20 rounded-2xl p-8 shadow-2xl shadow-green-500/10 flex flex-col items-center justify-center text-center"
                  >
                    <CheckCircle size={64} className="text-green-400 mb-4" />
                    <h2 className="text-2xl font-bold text-white">
                      تم إنهاء الاختبار
                    </h2>
                    <p className="text-slate-300 mt-2">
                      هذا الاختبار مغلق الآن وجاهز للطلاب. لا يمكن إضافة أو
                      تعديل المزيد من الأسئلة.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className={`transition-all duration-500 ${
                  isQuizFinished ? "lg:col-span-5" : "lg:col-span-2"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white">
                      الأسئلة الحالية ({questions.length})
                    </h2>
                    {isFetchingQuestions && (
                      <div className="flex items-center gap-2 text-cyan-400 text-sm">
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري التحديث...</span>
                      </div>
                    )}
                  </div>
                  {questions.length === 0 ? (
                    <div className="text-center text-slate-400 bg-slate-900/50 rounded-xl p-8">
                      لا توجد أسئلة بعد. ابدأ بإضافة سؤالك الأول!
                    </div>
                  ) : (
                    questions?.map((q, idx) => {
                      const isOpen = openAccordion === idx;
                      return (
                        <div
                          key={q.id || idx}
                          className="bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-lg"
                        >
                          <button
                            onClick={() =>
                              setOpenAccordion(isOpen ? null : idx)
                            }
                            className="w-full flex items-center gap-4 p-4 text-start"
                          >
                            <span className="flex-grow font-semibold text-white">
                              {idx + 1}. {q.text}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-bold ${
                                q.type === 1
                                  ? "bg-cyan-900 text-cyan-300"
                                  : "bg-green-900 text-green-300"
                              }`}
                            >
                              {q.type === 1 ? "اختيار متعدد" : "صح/خطأ"}
                            </span>
                            <svg
                              className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-slate-700/50 p-4 space-y-3">
                                  {q.imageUrl && (
                                    <a
                                      href={q.imageUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <img
                                        src={q.imageUrl}
                                        alt="صورة السؤال"
                                        className="max-h-40 rounded-lg object-contain mb-3 cursor-pointer"
                                      />
                                    </a>
                                  )}
                                  <div className="space-y-2">
                                    {q?.options?.map((opt, i) => (
                                      <div
                                        key={opt.optionId || i}
                                        className={`flex items-center gap-3 p-2 rounded-md text-sm font-semibold text-slate-200 ${
                                          opt.isCorrect
                                            ? "bg-green-500/20"
                                            : "bg-slate-800/50"
                                        }`}
                                      >
                                        {opt.isCorrect ? (
                                          <CheckCircle
                                            size={14}
                                            className="text-green-400 flex-shrink-0"
                                          />
                                        ) : (
                                          <div className="w-2 h-2 rounded-full bg-slate-500 flex-shrink-0 ml-1.5"></div>
                                        )}
                                        <span>{opt.text}</span>
                                      
                                      </div>
                                    ))}
                                  </div>
                                  {/* {!isQuizFinished && (
                                    <div className="flex gap-2 pt-3 border-t border-slate-700/50">
                                      <button className="flex items-center justify-center gap-2 text-sm px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 transition">
                                        <Edit size={14} /> تعديل
                                      </button>
                                      <button
                                        onClick={() => setQuestionToDelete(q)}
                                        className="flex items-center justify-center gap-2 text-sm px-3 py-1.5 rounded-md text-red-300 bg-red-500/10 hover:bg-red-500/20 transition"
                                      >
                                        <Trash2 size={14} /> حذف
                                      </button>
                                    </div>
                                  )} */}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Questions;
