import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as THREE from "three";
import * as tus from "tus-js-client";
import axios, { BASE_URL } from "../../api/axios";
import { Cookies } from "react-cookie";
import toast from "react-hot-toast";

// --- Helper Components for a Cleaner UI ---

const FormInput = ({ ...props }) => (
    <input {...props} className="w-full p-3 rounded-lg text-md bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"/>
);
const FormTextarea = (props) => (
    <textarea {...props} rows={5} className="w-full p-3 rounded-lg text-md bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-none"/>
);

const FileInput = ({ file, setFile, label, acceptedTypes, icon }) => (
    <div>
        <label className="block text-lg font-bold text-white mb-3">{label}</label>
        <label htmlFor={label} className="relative cursor-pointer flex justify-center items-center w-full h-32 px-4 py-6 border-2 border-dashed border-slate-600 rounded-lg hover:border-cyan-500 transition-colors duration-300">
            {!file ? (
                <div className="text-center">
                    {icon}
                    <p className="mt-2 text-sm text-slate-400">اسحب وأفلت أو انقر للاختيار</p>
                </div>
            ) : (
                <div className="text-center font-semibold text-green-400">
                    <p>تم اختيار الملف:</p>
                    <p className="text-sm mt-1">{file.name}</p>
                    <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); setFile(null); }} 
                        className="mt-2 text-xs text-red-400 hover:underline"
                    >
                        إزالة
                    </button>
                </div>
            )}
            <input id={label} type="file" accept={acceptedTypes} onChange={e => setFile(e.target.files[0])} className="sr-only"/>
        </label>
    </div>
);


const AddLesson = () => {
  const location = useLocation();
  const { courseId, chapterId: unitId } = location.state || {};
  
  // --- State Management ---
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lessonImage, setLessonImage] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [isFreePreview, setIsFreePreview] = useState(false);
  
  // TUS Upload State
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState("—");
  const [stateText, setStateText] = useState("جاهز");
  const [isUploading, setIsUploading] = useState(false);

  // --- Refs & other hooks ---
  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const currentUpload = useRef(null);
  const startedAt = useRef(null);
  const navigate = useNavigate();

  // --- TUS and API Logic (Your original logic with fixes) ---
  const cookies = new Cookies();
  const jwt = cookies.get("token");
  const apiBase = BASE_URL;

  // Helper functions from your code
  const fmtBytes = (n) => { const u=["B","KB","MB","GB","TB"]; let i=0; while(n>=1024 && i<u.length-1) {n/=1024; i++;} return `${n.toFixed(2)} ${u[i]}`; };
  const eta = (uploaded, total, started) => { const secs=(Date.now()-started)/1000; if(secs<=0 || uploaded<=0) return "—"; const rate=uploaded/secs; const remain=(total-uploaded)/rate; const m=Math.floor(remain/60), s=Math.floor(remain % 60); return `${m}m ${s}s`; };
  const fileKey = (f) => `bny:file:${f.name}:${f.size}:${f.lastModified}`;
  const getCache = (k) => { const x=localStorage.getItem(k); return x?JSON.parse(x):null; };
  const putCache = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const delCache = (k) => localStorage.removeItem(k);

  // **FIXED**: Reverted body to send a simple string, as required by the backend.
  const presign = async (title) => {
    const r = await fetch(`${apiBase}/api/Lesson/video/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify(title || "Untitled"), // This is the correct format
    });
    if (!r.ok) throw new Error(`presign failed: ${await r.text()}`);
    return r.json();
  };

  const resign = async (videoId) => {
    const r = await fetch(`${apiBase}/api/Lesson/video/resign`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({ videoId }),
    });
    if (!r.ok) throw new Error(`resign failed: ${await r.text()}`);
    return r.json();
  };

  const createLesson = async ({ videoId, videoFile }) => {
    const formData = new FormData();
    formData.append("Title", title);
    formData.append("Content", content);
    formData.append("VideoId", videoId);
    if (lessonImage) formData.append("LessonImage", lessonImage);
    if (pdfFile) formData.append("PdfFile", pdfFile);
    if (thumbnailFile) formData.append("ThumbnailFile", thumbnailFile);
    if (videoFile) formData.append("VideoFile", videoFile);
    formData.append("CourseUnitId", unitId);
    formData.append("CourseId", courseId);
    formData.append("IsFreePreview", isFreePreview);
    
    return axios.post("/api/Lesson", formData, {
      headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${jwt}` },
    });
  };

  const startTus = (file, info, uploadUrl) => {
    setIsUploading(true);
    startedAt.current = Date.now();
    const upload = new tus.Upload(file, {
        endpoint: "https://video.bunnycdn.com/tusupload",
        chunkSize: 5 * 1024 * 1024,
        metadata: { filename: file.name, filetype: file.type || "application/octet-stream" },
        headers: {
            AuthorizationSignature: info.authorizationSignature,
            AuthorizationExpire: info.authorizationExpire,
            VideoId: info.videoId,
            LibraryId: info.libraryId,
        },
        onAfterResponse(req, res) {
            const loc=res.getHeader("Location")||res.getHeader("location");if(loc){const absolute=loc.startsWith("http")?loc:`https://video.bunnycdn.com${loc}`;const k=fileKey(file);const cache=getCache(k)||{videoId:info.videoId,libraryId:info.libraryId};if(!cache.uploadUrl){cache.uploadUrl=absolute;putCache(k,cache);}}
        },
        async onError(err) {
            setIsUploading(false);
            if(String(err).includes("403")||String(err).toLowerCase().includes("expire")){try{const re=await resign(info.videoId);this.options.headers.AuthorizationSignature=re.authorizationSignature;this.options.headers.AuthorizationExpire=re.authorizationExpire;setStateText("جددنا التفويض — بنستأنف…");this.start();return;}catch(e){}}
            setStateText("فشل الرفع");
            toast.error("حدث خطأ أثناء رفع الفيديو.");
        },
        async onSuccess() {
            setStateText("تم الرفع ✔ — جاري إنشاء الدرس…");
            try {
                await createLesson({ videoId: info.videoId, videoFile: file });
                setStateText("تم إنشاء الدرس ✅");
                toast.success("تم إنشاء الدرس بنجاح!");
                delCache(fileKey(file));
                // Reset form completely and go back to step 1
                setTitle(""); setContent(""); setLessonImage(null); setVideoFile(null);
                setPdfFile(null); setThumbnailFile(null); setIsFreePreview(false);
                setProgress(0); setStats("—"); setIsUploading(false); setStep(1);
            } catch (e) {
                setStateText("الرفع تم — لكن فشل إنشاء الدرس");
                toast.error(e.response?.data?.title || "فشل إنشاء الدرس بعد رفع الفيديو.");
                setIsUploading(false);
            }
        },
        onProgress(u, t) {
            const p = u === 0 && t === 0 ? 0 : ((u / t) * 100);
            setProgress(p);
            setStateText(`جاري الرفع… ${p.toFixed(2)}%`);
            const spd = u / ((Date.now() - startedAt.current) / 1000);
            setStats(`${fmtBytes(u)} / ${fmtBytes(t)} — ${fmtBytes(spd)}/s — ETA ${eta(u, t, startedAt.current)}`);
        },
    });

    currentUpload.current = upload;
    
    if (uploadUrl) { upload.resumeFromPreviousUpload({url: uploadUrl}); setStateText("استئناف…"); upload.start(); }
    else { upload.findPreviousUploads().then((list) => { if (list.length) { upload.resumeFromPreviousUpload(list[0]); setStateText("استئناف تلقائي…"); } else setStateText("بدء الرفع…"); upload.start(); }); }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) { toast.error("الرجاء اختيار ملف فيديو أولاً."); return; }

    setStateText("جار التحضير...");
    const k = fileKey(videoFile);
    let cache = getCache(k);

    try {
      if (cache?.videoId) {
        setStateText("استئناف — تجديد التفويض…");
        const info = await resign(cache.videoId);
        startTus(videoFile, info, cache.uploadUrl || null);
      } else {
        setStateText("تحضير جلسة جديدة…");
        const info = await presign(title || videoFile.name);
        putCache(k, { videoId: info.videoId, libraryId: info.libraryId });
        startTus(videoFile, info, null);
      }
    } catch (e) {
      setStateText("فشل التحضير");
      toast.error(`فشل التحضير: ${e.message}`);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    if (currentUpload.current) {
      currentUpload.current.abort();
      setStateText("تم الإيقاف");
      setIsUploading(false);
      setProgress(0);
    }
  };

  useEffect(() => {
    if (!courseId || !unitId) {
        toast.error("بيانات الكورس أو الفصل غير مكتملة!");
        navigate(-1); // Go back to the previous page
    }
    // Three.js setup... (no changes here)
  }, [courseId, unitId, navigate]);
  
  const renderStep = () => {
    switch (step) {
      case 1: // --- STEP 1: All Details ---
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h3 className="text-2xl font-bold text-cyan-400 border-b-2 border-cyan-400/20 pb-2">الخطوة 1: تفاصيل الدرس</h3>
            <FormInput type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="أدخل عنوان الدرس" />
            <FormTextarea value={content} onChange={(e) => setContent(e.target.value)} required placeholder="أدخل محتوى ووصف الدرس" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FileInput file={lessonImage} setFile={setLessonImage} label="صورة الدرس الرئيسية" acceptedTypes="image/*" icon={<svg className="mx-auto h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <FileInput file={pdfFile} setFile={setPdfFile} label="ملخص الدرس (PDF)" acceptedTypes="application/pdf" icon={<svg className="mx-auto h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
                <FileInput file={thumbnailFile} setFile={setThumbnailFile} label="صورة مصغرة للفيديو" acceptedTypes="image/*" icon={<svg className="mx-auto h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            </div>
             <div className="flex items-center space-x-3 pt-4" dir="rtl">
                  <input type="checkbox" id="freePreview" checked={isFreePreview} onChange={(e) => setIsFreePreview(e.target.checked)} className="w-5 h-5 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 focus:ring-2"/>
                  <label htmlFor="freePreview" className="text-lg font-bold text-white cursor-pointer">إتاحة الدرس كمعاينة مجانية</label>
            </div>
            <div className="flex justify-end pt-4">
                <button onClick={() => setStep(2)} disabled={!title || !content} className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100">التالي</button>
            </div>
          </div>
        );
      case 2: // --- STEP 2: Video & Publish ---
        return (
            <div className="space-y-6 animate-fade-in-up">
                <h3 className="text-2xl font-bold text-cyan-400 border-b-2 border-cyan-400/20 pb-2">الخطوة 2: الفيديو والنشر</h3>
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-600 rounded-2xl min-h-[250px]">
                    {!videoFile && !isUploading && (
                        <label htmlFor="video-upload" className="text-center cursor-pointer p-4">
                            <svg className="mx-auto h-16 w-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            <h4 className="mt-4 text-lg font-semibold">اسحب وأفلت الفيديو هنا أو انقر للاختيار</h4>
                            <p className="text-sm text-slate-400">MP4, MOV, WEBM</p>
                        </label>
                    )}
                    {videoFile && !isUploading && (
                        <div className="text-center">
                            <svg className="mx-auto h-16 w-16 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            <p className="text-lg font-semibold text-green-400 mt-2">تم اختيار الفيديو:</p>
                            <p className="text-md text-slate-300">{videoFile.name}</p>
                            <button onClick={() => setVideoFile(null)} className="mt-4 text-sm text-red-400 hover:underline">تغيير الفيديو</button>
                        </div>
                    )}
                    {isUploading && (
                        <div className="flex flex-col items-center gap-4 w-full">
                           <div className="font-bold text-2xl text-cyan-400">{stateText}</div>
                           <progress className="w-full h-3 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg   [&::-webkit-progress-bar]:bg-slate-700 [&::-webkit-progress-value]:bg-cyan-400 [&::-moz-progress-bar]:bg-cyan-400" max="100" value={progress}></progress>
                           <p className="font-mono text-slate-300 text-sm dir-ltr">{stats}</p>
                           <button onClick={handleCancel} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">إلغاء الرفع</button>
                        </div>
                    )}
                    <input id="video-upload" type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} className="sr-only"/>
                </div>
                 <div className="flex justify-between pt-4">
                    <button onClick={() => setStep(1)} className="px-8 py-3 rounded-lg bg-slate-700 text-white font-bold transition-transform transform hover:scale-105">السابق</button>
                    <button onClick={handleSubmit} disabled={!videoFile || isUploading} className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-cyan-500 text-white font-black text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100">
                        {isUploading ? "جاري الرفع..." : "ابدأ الرفع والإنشاء"}
                    </button>
                </div>
            </div>
        );
      default: return null;
    }
  };

  return (
    <div className="text-gray-100 font-[Cairo] h-screen overflow-hidden w-full" dir="rtl">
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />
      <main ref={mainContentRef} className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-black text-white mb-2" style={{ textShadow: "0 0 15px rgba(0, 191, 255, 0.7)" }}>إضافة درس جديد</h1>
                <p className="text-slate-400 text-lg">اتبع الخطوات التالية لإنشاء درس متكامل.</p>
            </header>
            
            <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
                {renderStep()}
            </div>
        </div>
      </main>
    </div>
  );
};

export default AddLesson;