import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as THREE from "three";
import * as tus from "tus-js-client";
import axios, { BASE_URL } from "../../api/axios";
import { Cookies } from "react-cookie";
import toast from "react-hot-toast";

// --- Reusable Helper Components ---
const FormInput = ({ ...props }) => ( <input {...props} className="w-full p-3 rounded-lg text-md bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"/> );
const FormTextarea = (props) => ( <textarea {...props} rows={5} className="w-full p-3 rounded-lg text-md bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-none"/> );
const FileInput = ({ file, setFile, label, acceptedTypes, icon, currentFileUrl }) => {
    const fileName = currentFileUrl ? currentFileUrl.split('/').pop() : null;
    return (
        <div>
            <label className="block text-lg font-bold text-white mb-3">{label}</label>
            <div className="bg-slate-800/40 rounded-lg p-4">
                <label htmlFor={label} className="relative cursor-pointer flex justify-center items-center w-full h-24 px-4 py-6 border-2 border-dashed border-slate-600 rounded-lg hover:border-cyan-500 transition-colors duration-300">
                    {!file ? (
                        <div className="text-center">{icon}<p className="mt-1 text-sm text-slate-400">اختر ملف جديد</p></div>
                    ) : (
                        <div className="text-center font-semibold text-green-400">
                            <p className="text-sm mt-1">{file.name}</p>
                            <button type="button" onClick={(e) => { e.preventDefault(); setFile(null); }} className="mt-2 text-xs text-red-400 hover:underline">إزالة</button>
                        </div>
                    )}
                    <input id={label} type="file" accept={acceptedTypes} onChange={e => setFile(e.target.files[0])} className="sr-only"/>
                </label>
                {fileName && !file && ( <div className="text-xs text-slate-400 mt-2 text-center">الملف الحالي: <span className="font-semibold text-cyan-300">{decodeURIComponent(fileName)}</span></div> )}
            </div>
        </div>
    );
};


const UpdateLesson = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const lessonDataFromState = location.state?.lessonData;
    const lessonId = lessonDataFromState?.id;

    // --- State ---
    const [activeTab, setActiveTab] = useState('details');
    const [showUploader, setShowUploader] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [lessonImage, setLessonImage] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [isFreePreview, setIsFreePreview] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [videoFile, setVideoFile] = useState(null);
    
    // TUS State
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState("—");
    const [stateText, setStateText] = useState("جاهز");
    const [isUploading, setIsUploading] = useState(false);

    // --- Refs ---
    const canvasRef = useRef(null);
    const mainContentRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const starFieldsRef = useRef([]);
    const currentUpload = useRef(null);
    const startedAt = useRef(null);

    const cookies = new Cookies();
    const jwt = cookies.get("token");
    const apiBase = BASE_URL;

    // --- Data Population ---
    useEffect(() => {
        if (lessonDataFromState) {
            setTitle(lessonDataFromState.title || "");
            setContent(lessonDataFromState.content || "");
            setIsFreePreview(lessonDataFromState.isFreePreview || false);
        } else {
            toast.error("لم يتم العثور على بيانات الدرس!");
            navigate(-1);
        }
    }, [lessonId, lessonDataFromState, navigate]);
    
    // --- Handlers & Logic ---
    const handleDetailsUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        const toastId = toast.loading("جاري تحديث البيانات...");
        try {
            const formData = new FormData();
            formData.append("id", lessonId);
            formData.append("Title", title);
            formData.append("Content", content);
            if (lessonImage) formData.append("LessonImage", lessonImage);
            if (pdfFile) formData.append("PdfFile", pdfFile);
            if (thumbnailFile) formData.append("ThumbnailFile", thumbnailFile);
            formData.append("IsFreePreview", isFreePreview);
            
            await axios.put("/api/Lesson/update", formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${jwt}` } });
            toast.success("تم تحديث التفاصيل بنجاح", { id: toastId });
            setLessonImage(null); setPdfFile(null); setThumbnailFile(null);
        } catch (error) {
            toast.error("خطأ في تحديث التفاصيل", { id: toastId });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleVideoFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoFile(file);
        }
    };

    // --- TUS Logic (Using "presign" - Create then Delete Flow) ---
    const fmtBytes = (n) => { const u=["B","KB","MB","GB","TB"]; let i=0; while(n>=1024&&i<u.length-1){n/=1024;i++} return`${n.toFixed(2)} ${u[i]}`};
    const eta = (u, t, s) => { const e=(Date.now()-s)/1e3; if(e<=0||u<=0)return"—"; const r=u/e, a=(t-u)/r, n=Math.floor(a/60), o=Math.floor(a%60); return`${n}m ${o}s`};
    const fileKey = (f) => `bny:file:${f.name}:${f.size}:${f.lastModified}`;
    const getCache = (k) => {const x=localStorage.getItem(k); return x?JSON.parse(x):null};
    const putCache = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    const delCache = (k) => localStorage.removeItem(k);

    const presign = async (title) => {
        const r = await fetch(`${apiBase}/api/Lesson/video/presign`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
            body: JSON.stringify(title || "Untitled"),
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
    
    const updateLessonWithVideo = async ({ videoId }) => {
        const formData = new FormData();
        formData.append("id", lessonId);
        formData.append("Title", title);
        formData.append("Content", content);
        formData.append("VideoId", videoId);
        // Note: We don't send other files here as they are handled by the details update.
        // The backend will only update the fields present in the form data.
        formData.append("IsFreePreview", isFreePreview);
        return axios.put("/api/Lesson/update", formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${jwt}` } });
    };

    const startTus = (file, info, uploadUrl) => {
        setIsUploading(true);
        startedAt.current = Date.now();
        const upload = new tus.Upload(file, {
            endpoint: "https://video.bunnycdn.com/tusupload",
            chunkSize: 5 * 1024 * 1024,
            metadata: { filename: file.name, filetype: file.type || "application/octet-stream" },
            headers: { AuthorizationSignature: info.authorizationSignature, AuthorizationExpire: info.authorizationExpire, VideoId: info.videoId, LibraryId: info.libraryId },
            onAfterResponse(req, res){ const loc=res.getHeader("Location")||res.getHeader("location"); if(loc){ const abs=loc.startsWith("http")?loc:`https://video.bunnycdn.com${loc}`; const k=fileKey(file); const cache=getCache(k)||{videoId:info.videoId,libraryId:info.libraryId}; if(!cache.uploadUrl){cache.uploadUrl=abs;putCache(k,cache)} } },
            async onError(err) { setIsUploading(false); if(String(err).includes("403")||String(err).toLowerCase().includes("expire")){try{const re=await resign(info.videoId);this.options.headers.AuthorizationSignature=re.authorizationSignature;this.options.headers.AuthorizationExpire=re.authorizationExpire;setStateText("جددنا التفويض…");this.start();return}catch(e){}} setStateText("فشل الرفع"); toast.error("فشل رفع الفيديو")},
            async onSuccess() {
                setStateText("تم الرفع ✔ — تحديث الدرس…");
                try {
                    await updateLessonWithVideo({ videoId: info.videoId });
                    setStateText("تم تحديث الدرس ✅");
                    toast.success("تم تحديث الدرس والفيديو بنجاح!");
                    delCache(fileKey(file));
                    setIsUploading(false);
                    setShowUploader(false);
                    setVideoFile(null);
                } catch (e) {
                    setStateText("الرفع تم — فشل تحديث الدرس");
                    toast.error("فشل تحديث بيانات الدرس بعد رفع الفيديو.");
                    setIsUploading(false);
                }
            },
            onProgress(u, t) { const p=((u/t)*100); setProgress(p); setStateText(`يرفع… ${p.toFixed(2)}%`); setStats(`${fmtBytes(u)}/${fmtBytes(t)} — ETA ${eta(u,t,startedAt.current)}`) },
        });
        currentUpload.current = upload;
        if (uploadUrl) { upload.resumeFromPreviousUpload({url: uploadUrl}); setStateText("استئناف…"); upload.start(); }
        else { upload.findPreviousUploads().then((list) => { if (list.length) { upload.resumeFromPreviousUpload(list[0]); setStateText("استئناف تلقائي…"); } else setStateText("بدء الرفع…"); upload.start(); }); }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!videoFile) { toast.error("الرجاء اختيار ملف فيديو أولاً."); return; }
        const k = fileKey(videoFile);
        let cache = getCache(k);
        try {
            setStateText("تحضير جلسة رفع جديدة…");
            const info = cache?.videoId ? await resign(cache.videoId) : await presign(title || videoFile.name);
            if (!cache?.videoId) putCache(k, { videoId: info.videoId, libraryId: info.libraryId });
            startTus(videoFile, info, cache?.uploadUrl || null);
        } catch (e) {
            setStateText("فشل التحضير");
            toast.error(`فشل التحضير: ${e.message}`);
        }
    };
    
    // --- Three.js useEffect hooks ---
    useEffect(() => {
        if (!canvasRef.current) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        sceneRef.current = scene; cameraRef.current = camera; rendererRef.current = renderer;
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
            const starfield = new THREE.Points(geometry, material);
            scene.add(starfield);
            return starfield;
        };
        starFieldsRef.current = [createStarfield(8000, 0.05, 0x888888), createStarfield(5000, 0.1, 0xbbbbbb), createStarfield(1500, 0.15, 0xffffff)];
        const clock = new THREE.Clock();
        const animate = () => {
            const elapsedTime = clock.getElapsedTime();
            if(starFieldsRef.current[0]) starFieldsRef.current[0].rotation.y = elapsedTime * 0.01;
            if(starFieldsRef.current[1]) starFieldsRef.current[1].rotation.y = elapsedTime * 0.02;
            if(starFieldsRef.current[2]) starFieldsRef.current[2].rotation.y = elapsedTime * 0.03;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();
        return () => { if (renderer) renderer.dispose(); };
    }, []);

    useEffect(() => {
        const mainContent = mainContentRef.current;
        if (!mainContent) return;
        const handleScroll = () => {
            if (!mainContentRef.current || !cameraRef.current) return;
            const scrollY = mainContentRef.current.scrollTop;
            const docHeight = mainContentRef.current.scrollHeight - mainContentRef.current.clientHeight;
            const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;
            if (cameraRef.current) {
                cameraRef.current.position.z = 5 - scrollPercent * 10;
            }
        };
        mainContent.addEventListener("scroll", handleScroll);
        return () => mainContent.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (cameraRef.current && rendererRef.current) {
                cameraRef.current.aspect = window.innerWidth / window.innerHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
    <div className="text-gray-100 font-[Cairo] h-screen overflow-hidden w-full" dir="rtl">
        <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />
        <main ref={mainContentRef} className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#00BFFF rgba(0,0,0,0.2)" }}>
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white mb-2" style={{ textShadow: "0 0 15px rgba(0, 191, 255, 0.7)" }}>تعديل الدرس</h1>
                    <p className="text-slate-400 text-lg">"{title}"</p>
                </header>
                
                <div className="flex justify-center border-b border-slate-700 mb-8">
                    <button onClick={() => setActiveTab('details')} className={`px-6 py-3 font-bold text-lg transition-colors ${activeTab === 'details' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>تعديل التفاصيل</button>
                    <button onClick={() => setActiveTab('video')} className={`px-6 py-3 font-bold text-lg transition-colors ${activeTab === 'video' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>تغيير الفيديو</button>
                </div>
                
                <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10 min-h-[400px]">
                    {activeTab === 'details' && (
                        <form onSubmit={handleDetailsUpdate} className="space-y-6 animate-fade-in-up">
                            <FormInput type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="أدخل عنوان الدرس" />
                            <FormTextarea value={content} onChange={(e) => setContent(e.target.value)} required placeholder="أدخل محتوى ووصف الدرس" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FileInput file={lessonImage} setFile={setLessonImage} label="تغيير صورة الدرس" acceptedTypes="image/*" currentFileUrl={lessonDataFromState?.lessonImage} icon={<svg className="mx-auto h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                                <FileInput file={pdfFile} setFile={setPdfFile} label="تغيير ملف الـ PDF" acceptedTypes="application/pdf" currentFileUrl={lessonDataFromState?.pdfPath} icon={<svg className="mx-auto h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
                                <FileInput file={thumbnailFile} setFile={setThumbnailFile} label="تغيير الصورة المصغرة" acceptedTypes="image/*" currentFileUrl={lessonDataFromState?.thumbnailUrl} icon={<svg className="mx-auto h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                            </div>
                            <div className="flex items-center space-x-3 pt-4" dir="rtl">
                                <input type="checkbox" id="freePreview" checked={isFreePreview} onChange={(e) => setIsFreePreview(e.target.checked)} className="w-5 h-5 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 focus:ring-2"/>
                                <label htmlFor="freePreview" className="text-lg font-bold text-white cursor-pointer">إتاحة الدرس كمعاينة مجانية</label>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" disabled={isUpdating} className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-cyan-500 text-white font-black text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100">{isUpdating ? "جاري الحفظ..." : "حفظ التعديلات"}</button>
                            </div>
                        </form>
                    )}
                    
                    {activeTab === 'video' && (
                        <div className="animate-fade-in-up">
                            {!showUploader ? (
                                <div className="text-center">
                                    <h3 className="text-xl font-bold mb-4">الفيديو الحالي</h3>
                                    {lessonDataFromState?.vimeoId ? (
                                        <iframe src={`https://iframe.mediadelivery.net/embed/475904/${lessonDataFromState.vimeoId}?autoplay=false`} className="w-full aspect-video border-0 rounded-lg bg-black" allow="autoplay; fullscreen; picture-in-picture" title="Current Video"/>
                                    ) : (
                                        <div className="w-full aspect-video bg-slate-800 rounded-lg flex items-center justify-center"><p>لا يوجد فيديو حالي لهذا الدرس.</p></div>
                                    )}
                                    <button onClick={() => setShowUploader(true)} className="mt-6 px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold transition-all transform hover:scale-105">رفع فيديو بديل</button>
                                </div>
                            ) : (
                                <div>
                                    <div className="p-4 mb-6 bg-yellow-900/50 border border-yellow-500/50 text-yellow-300 rounded-lg text-center">**تحذير:** رفع فيديو جديد سيقوم بحذف الفيديو القديم المرتبط بهذا الدرس نهائياً.</div>
                                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-600 rounded-2xl min-h-[250px]">
                                        {isUploading ? (
                                            <div className="flex flex-col items-center gap-4 w-full">
                                                <div className="font-bold text-2xl text-cyan-400">{stateText}</div>
                                                <progress className="w-full h-3 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-slate-700 [&::-webkit-progress-value]:bg-cyan-400 [&::-moz-progress-bar]:bg-cyan-400" max="100" value={progress}></progress>
                                                <p className="font-mono text-slate-300 text-sm dir-ltr">{stats}</p>
                                            </div>
                                        ) : (
                                            <label htmlFor="video-upload" className="text-center cursor-pointer p-4">
                                                <svg className="mx-auto h-16 w-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                <h4 className="mt-4 text-lg font-semibold">{videoFile?.name || "اسحب وأفلت الفيديو هنا أو انقر للاختيار"}</h4>
                                            </label>
                                        )}
                                        <input onChange={handleVideoFileChange} id="video-upload" type="file" accept="video/*" className="sr-only"/>
                                    </div>
                                    <div className="flex justify-between items-center pt-6">
                                        <button onClick={() => setShowUploader(false)} className="px-6 py-2 rounded-lg bg-slate-700 text-white font-bold hover:bg-slate-600 transition">إلغاء</button>
                                        <button onClick={handleUpload} disabled={isUploading} className="px-8 py-3 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100">{isUploading ? "جاري الرفع..." : "ابدأ الرفع الآن"}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    </div>
    );
};

export default UpdateLesson;