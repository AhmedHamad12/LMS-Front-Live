import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as tus from "tus-js-client";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  UploadCloud,
  X,
  Check,
  Paperclip,
  ImageIcon,
  PlayCircle,
  PauseCircle,
} from "lucide-react";

// --- مكونات واجهة المستخدم المساعدة ---

const FormInput = ({ ...props }) => (
  <input
    {...props}
    className="w-full p-3 rounded-lg text-md bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
  />
);

const FormTextarea = (props) => (
  <textarea
    {...props}
    rows={5}
    className="w-full p-3 rounded-lg text-md bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-none"
  />
);

const FileInput = ({ file, setFile, label, acceptedTypes, icon }) => (
  <div>
    <label className="block text-lg font-bold text-white mb-3">{label}</label>
    <label
      htmlFor={label}
      className="relative cursor-pointer flex justify-center items-center w-full h-32 px-4 py-6 border-2 border-dashed border-slate-600 rounded-lg hover:border-cyan-500 transition-colors duration-300"
    >
      {!file ? (
        <div className="text-center">
          {icon}
          <p className="mt-2 text-sm text-slate-400">
            اسحب وأفلت أو انقر للاختيار
          </p>
        </div>
      ) : (
        <div className="text-center font-semibold text-green-400">
          <p>تم اختيار الملف:</p>
          <p className="text-sm mt-1">{file.name}</p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setFile(null);
            }}
            className="mt-2 text-xs text-red-400 hover:underline"
          >
            إزالة
          </button>
        </div>
      )}
      <input
        id={label}
        type="file"
        accept={acceptedTypes}
        onChange={(e) => setFile(e.target.files[0])}
        className="sr-only"
      />
    </label>
  </div>
);

const Stepper = ({ currentStep }) => (
  <div className="flex items-center justify-center mb-12">
    <div className="flex items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
          currentStep >= 1
            ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/50"
            : "bg-slate-700 text-slate-400"
        }`}
      >
        1
      </div>
      <span
        className={`mr-3 font-semibold transition-colors duration-300 ${
          currentStep >= 1 ? "text-white" : "text-slate-500"
        }`}
      >
        تفاصيل الدرس
      </span>
    </div>
    <div
      className={`flex-auto border-t-2 mx-4 transition-colors duration-300 ${
        currentStep >= 2 ? "border-cyan-500" : "border-slate-700"
      }`}
    ></div>
    <div className="flex items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
          currentStep >= 2
            ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/50"
            : "bg-slate-700 text-slate-400"
        }`}
      >
        2
      </div>
      <span
        className={`mr-3 font-semibold transition-colors duration-300 ${
          currentStep >= 2 ? "text-white" : "text-slate-500"
        }`}
      >
        رفع الفيديو
      </span>
    </div>
  </div>
);

// --- المكون الرئيسي ---
export default function AddLesson() {
  const location = useLocation();
  const { courseId, chapterId: unitId } = location.state || {};
  const navigate = useNavigate();

  // إدارة الحالة
  const [step, setStep] = useState(1);
  const [lessonId, setLessonId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حالة النموذج
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lessonImage, setLessonImage] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [isFreePreview, setIsFreePreview] = useState(false);

  // حالة رفع TUS
  const [uploadDetails, setUploadDetails] = useState({
    progress: 0,
    speed: 0,
    eta: 0,
    uploadedBytes: 0,
    totalBytes: 0,
    stateText: "جاهز",
    isUploading: false,
    isPaused: false,
  });
  const currentUpload = useRef(null);
  const startedAt = useRef(null);

  const cookies = new Cookies();
  const jwt = cookies.get("token");

  // دوال مساعدة لتنسيق الأرقام
  const fmtBytes = (n) => {
    if (n === 0) return "0 Bytes";
    const u = ["بايت", "ك.ب", "م.ب", "ج.ب"];
    const i = Math.floor(Math.log(n) / Math.log(1024));
    return `${parseFloat((n / Math.pow(1024, i)).toFixed(2))} ${u[i]}`;
  };
  const fmtEta = (s) => {
    if (s < 60) return `${Math.floor(s)} ث`;
    const m = Math.floor(s / 60);
    const rs = Math.floor(s % 60);
    return `${m} د ${rs} ث`;
  };

  // معالجة الخطوة الأولى: إنشاء تفاصيل الدرس
  const handleCreateLesson = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading("جاري حفظ تفاصيل الدرس...");
    try {
      const formData = new FormData();
      formData.append("Title", title);
      formData.append("Content", content);
      if (lessonImage) formData.append("LessonImage", lessonImage);
      if (pdfFile) formData.append("PdfFile", pdfFile);
      formData.append("CourseUnitId", unitId);
      formData.append("CourseId", courseId);
      formData.append("IsFreePreview", isFreePreview);

      const response = await axios.post("/api/Lesson", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${jwt}`,
        },
      });

      const newLessonId = response.data.id;
      setLessonId(newLessonId);
      // حفظ بيانات الرفع غير المكتمل في حالة إغلاق الصفحة
      localStorage.setItem('unfinishedUpload', JSON.stringify({ lessonId: newLessonId, courseId, unitId }));
      toast.success("تم حفظ التفاصيل بنجاح!", { id: toastId });
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.title || "فشل حفظ تفاصيل الدرس.", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // معالجة الخطوة الثانية: بدء عملية الرفع
  const handleInitiateUpload = async () => {
    if (!videoFile) {
      toast.error("الرجاء اختيار ملف فيديو أولاً.");
      return;
    }
    setUploadDetails((prev) => ({
      ...prev,
      isUploading: true,
      stateText: "جاري التحضير للرفع...",
    }));

    try {
      const response = await axios.post(
        `/api/Lesson/${lessonId}/initiate-upload`,
        {},
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      const uploadInfo = response.data;
      
      // تحديث بيانات الرفع غير المكتمل لتشمل videoId
      localStorage.setItem('unfinishedUpload', JSON.stringify({ lessonId, courseId, unitId, videoId: uploadInfo.videoId }));
      
      startTus(videoFile, uploadInfo);
    } catch (error) {
      setUploadDetails((prev) => ({
        ...prev,
        isUploading: false,
        stateText: "فشل التحضير",
      }));
      toast.error(
        error.response?.data?.message || "فشل الحصول على توقيع الرفع."
      );
    }
  };

  // دالة TUS الرئيسية
  const startTus = (file, info) => {
    startedAt.current = Date.now();
    const upload = new tus.Upload(file, {
      endpoint: "https://video.bunnycdn.com/tusupload",
      chunkSize: 5 * 1024 * 1024,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: {
        filename: file.name,
        filetype: file.type || "application/octet-stream",
      },
      headers: {
        AuthorizationSignature: info.authorizationSignature,
        AuthorizationExpire: String(info.authorizationExpire),
        VideoId: info.videoId,
        LibraryId: info.libraryId,
      },
      onError(err) {
        const status = err.originalRequest ? err.originalRequest.getStatus() : 0;
        // معالجة خطأ انتهاء صلاحية التوقيع
        if (status === 401) {
          setUploadDetails(prev => ({ ...prev, stateText: "انتهت صلاحية الجلسة، جاري التجديد..." }));
          resignAndResume(info.videoId, upload);
          return;
        }
        setUploadDetails((prev) => ({
          ...prev, isUploading: false, isPaused: false, stateText: `فشل الرفع: ${err.message}`
        }));
        toast.error("حدث خطأ أثناء رفع الفيديو.");
      },
      onSuccess() {
        setUploadDetails((prev) => ({
          ...prev, progress: 100, stateText: "اكتمل الرفع ✔ — جاري تأكيد الدرس..."
        }));
        // إزالة بيانات الرفع عند النجاح
        localStorage.removeItem('unfinishedUpload');
        finalizeUpload(info.videoId);
      },
      onProgress(uploaded, total) {
        const percentage = total === 0 ? 0 : (uploaded / total) * 100;
        const secondsElapsed = (Date.now() - startedAt.current) / 1000;
        const speed = secondsElapsed > 0 ? uploaded / secondsElapsed : 0;
        const eta = speed > 0 ? (total - uploaded) / speed : 0;

        setUploadDetails((prev) => ({
          ...prev, progress: percentage, uploadedBytes: uploaded, totalBytes: total,
          speed: speed, eta: eta, stateText: "جاري الرفع...", isPaused: false,
        }));
      },
    });

    currentUpload.current = upload;
    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
        toast.success("تم العثور على تقدم سابق، سيتم استكمال الرفع.");
      }
      upload.start();
      setUploadDetails(prev => ({ ...prev, isUploading: true, stateText: "بدء الرفع..." }));
    });
  };
  
  // تجديد التوقيع والمتابعة
  const resignAndResume = async (videoId, uploadInstance) => {
    try {
      const { data } = await axios.post(`/api/Lesson/video/resign`, { videoId }, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      uploadInstance.setOptions({
        headers: {
          ...uploadInstance.options.headers,
          AuthorizationSignature: data.authorizationSignature,
          AuthorizationExpire: String(data.authorizationExpire),
        }
      });
      toast.success("تم تجديد جلسة الرفع بنجاح.");
      uploadInstance.start(); // استئناف الرفع
    } catch (error) {
      toast.error("فشل تجديد جلسة الرفع. يرجى المحاولة مرة أخرى.");
      setUploadDetails(prev => ({ ...prev, isUploading: false, stateText: "فشل التجديد" }));
    }
  };


  // إنهاء الرفع وتأكيد الدرس
  const finalizeUpload = async (videoId) => {
    try {
      await axios.post(`/api/Lesson/${lessonId}/finalize-upload`, { videoId }, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setUploadDetails((prev) => ({ ...prev, stateText: "تم إنشاء الدرس بنجاح ✅" }));
      toast.success("تم إنشاء الدرس ورفع الفيديو بنجاح!");
      navigate(-1); // العودة للصفحة السابقة
    } catch (error) {
      setUploadDetails((prev) => ({ ...prev, isUploading: false, stateText: "فشل تأكيد الدرس" }));
      toast.error(error.response?.data?.message || "فشل تأكيد الدرس بعد رفع الفيديو.");
    }
  };
  
  // التحكم في الإيقاف المؤقت والاستئناف
  const togglePause = () => {
    if (!currentUpload.current) return;
    if (uploadDetails.isPaused) {
      currentUpload.current.start();
      setUploadDetails((prev) => ({ ...prev, isPaused: false, stateText: "جاري الرفع..." }));
    } else {
      currentUpload.current.abort(true); // true to allow resume
      setUploadDetails((prev) => ({ ...prev, isPaused: true, stateText: "متوقف مؤقتاً" }));
    }
  };

  // التأكد من وجود بيانات الكورس عند تحميل الصفحة
  useEffect(() => {
    if (!courseId || !unitId) {
      const unfinished = JSON.parse(localStorage.getItem('unfinishedUpload'));
      if (unfinished) {
        if (window.confirm('تم العثور على رفع غير مكتمل. هل تريد استكماله؟')) {
          navigate(location.pathname, { state: { courseId: unfinished.courseId, chapterId: unfinished.unitId }, replace: true });
          setLessonId(unfinished.lessonId);
          setStep(2);
        } else {
          localStorage.removeItem('unfinishedUpload');
          toast.error("بيانات الكورس أو الوحدة غير مكتملة!");
          navigate(-1);
        }
      } else {
        toast.error("بيانات الكورس أو الوحدة غير مكتملة!");
        navigate(-1);
      }
    }
  }, [courseId, unitId, navigate, location.pathname]);


  // عرض الخطوات
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <FormInput id="lesson-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="عنوان الدرس" />
            <FormTextarea id="lesson-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="اكتب وصفًا تفصيليًا للدرس..." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileInput file={lessonImage} setFile={setLessonImage} label="صورة الدرس (اختياري)" acceptedTypes="image/*" icon={<ImageIcon className="mx-auto h-8 w-8 text-slate-400" />} />
              <FileInput file={pdfFile} setFile={setPdfFile} label="ملف PDF مرفق (اختياري)" acceptedTypes="application/pdf" icon={<Paperclip className="mx-auto h-8 w-8 text-slate-400" />} />
            </div>
            <div className="flex items-center pt-4">
              <input type="checkbox" id="freePreview" checked={isFreePreview} onChange={(e) => setIsFreePreview(e.target.checked)} className="w-5 h-5 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500" />
              <label htmlFor="freePreview" className="text-lg font-bold text-white cursor-pointer mr-3">اجعل هذا الدرس معاينة مجانية</label>
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t border-slate-700">
              <button onClick={handleCreateLesson} disabled={!title || isSubmitting} className="px-8 py-3 rounded-lg bg-cyan-600 text-white font-bold transition-all transform hover:bg-cyan-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? "جاري الحفظ..." : "حفظ ومتابعة"}
              </button>
            </div>
          </motion.div>
        );
      case 2:
        const { progress, speed, eta, uploadedBytes, totalBytes, stateText, isUploading, isPaused } = uploadDetails;
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {!isUploading ? (
              <label htmlFor="video-upload" className="relative cursor-pointer flex flex-col justify-center items-center w-full min-h-[250px] p-8 border-2 border-dashed border-slate-600 rounded-lg hover:border-cyan-500 bg-slate-800/40 hover:bg-slate-800/80 transition-all group">
                {videoFile ? (
                  <div className="text-center">
                    <Check size={48} className="mx-auto text-green-500 mb-2" />
                    <p className="text-lg font-semibold text-white">تم اختيار الفيديو:</p>
                    <p className="text-md text-slate-300 truncate max-w-xs">{videoFile.name}</p>
                    <span className="mt-4 text-sm text-cyan-400 group-hover:underline">اضغط لتغيير الفيديو</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadCloud size={48} className="mx-auto text-slate-400 group-hover:text-cyan-400 mb-2 transition-colors" />
                    <h4 className="mt-4 text-lg font-semibold text-white">اسحب وأفلت الفيديو هنا</h4>
                    <p className="text-sm text-slate-400">أو اضغط للتصفح من جهازك</p>
                  </div>
                )}
                <input id="video-upload" type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="sr-only" />
              </label>
            ) : (
              <div className="w-full p-6 md:p-8 border border-slate-700 rounded-lg bg-slate-800/60 text-center">
                <div className="font-bold text-xl text-cyan-400 mb-4">{stateText}</div>
                <div className="relative w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                  <div className="bg-cyan-500 h-4 rounded-full" style={{ width: `${progress}%`, transition: "width 0.3s ease-in-out" }}></div>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-screen">{Math.round(progress)}%</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-sm">
                  <div className="p-3 bg-slate-900/50 rounded-md border border-slate-700"><div className="font-bold text-slate-300">السرعة</div><div className="text-white">{fmtBytes(speed)}/ث</div></div>
                  <div className="p-3 bg-slate-900/50 rounded-md border border-slate-700"><div className="font-bold text-slate-300">الوقت المتبقي</div><div className="text-white">{eta > 0 ? fmtEta(eta) : "..."}</div></div>
                  <div className="p-3 bg-slate-900/50 rounded-md border border-slate-700 col-span-2 md:col-span-1"><div className="font-bold text-slate-300">الحجم</div><div className="text-white">{fmtBytes(uploadedBytes)} / {fmtBytes(totalBytes)}</div></div>
                </div>
                <div className="mt-6">
                  <button onClick={togglePause} className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white transition">
                    {isPaused ? <PlayCircle size={24} /> : <PauseCircle size={24} />}
                  </button>
                </div>
              </div>
            )}
            <div className="flex justify-between pt-4 mt-4 border-t border-slate-700">
              <button onClick={() => setStep(1)} disabled={isUploading} className="px-8 py-3 rounded-lg bg-slate-600 text-white font-bold hover:bg-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">السابق</button>
              <button onClick={handleInitiateUpload} disabled={!videoFile || isUploading} className="px-8 py-3 rounded-lg bg-green-600 text-white font-bold text-lg transition-all transform hover:bg-green-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                {isUploading ? stateText : "ابدأ الرفع والنشر"}
              </button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-gray-100 font-[Cairo] bg-slate-900" dir="rtl">
      <Helmet><title>إضافة درس جديد</title></Helmet>
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2" style={{ textShadow: "0 0 15px rgba(34, 211, 238, 0.5)" }}>إضافة درس جديد</h1>
          <p className="text-slate-400 text-lg">اتبع الخطوات التالية لإنشاء درس متكامل لكورسك.</p>
        </header>
        <div className="bg-slate-800/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
          <Stepper currentStep={step} />
          {renderStep()}
        </div>
      </main>
    </div>
  );
}