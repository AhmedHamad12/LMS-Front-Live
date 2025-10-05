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
  Paperclip,
  ImageIcon,
  PlayCircle,
  PauseCircle,
  Check,
} from "lucide-react";

// --- UI Helper Components ---

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
            Drag & drop or click to select
          </p>
        </div>
      ) : (
        <div className="text-center font-semibold text-green-400">
          <p>File selected:</p>
          <p className="text-sm mt-1">{file.name}</p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setFile(null);
            }}
            className="mt-2 text-xs text-red-400 hover:underline"
          >
            Remove
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
        className={`ml-3 font-semibold transition-colors duration-300 ${
          currentStep >= 1 ? "text-white" : "text-slate-500"
        }`}
      >
        Lesson Details
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
        className={`ml-3 font-semibold transition-colors duration-300 ${
          currentStep >= 2 ? "text-white" : "text-slate-500"
        }`}
      >
        Video Upload
      </span>
    </div>
  </div>
);

// --- Main Component ---
export default function AddLesson() {
  const location = useLocation();
  const { courseId, chapterId: unitId } = location.state || {};
  const navigate = useNavigate();

  // State Management
  const [step, setStep] = useState(1);
  const [lessonId, setLessonId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lessonImage, setLessonImage] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [isFreePreview, setIsFreePreview] = useState(false);

  // TUS Upload State
  const [uploadDetails, setUploadDetails] = useState({
    progress: 0,
    speed: 0,
    eta: 0,
    uploadedBytes: 0,
    totalBytes: 0,
    stateText: "Ready",
    isUploading: false,
    isPaused: false,
  });
  const currentUpload = useRef(null);
  const startedAt = useRef(null);
  const isPausedByUser = useRef(false); // Flag to handle intentional pauses

  const cookies = new Cookies();
  const jwt = cookies.get("token");

  // Formatting helpers
  const fmtBytes = (n) => {
    if (n === 0) return "0 Bytes";
    const u = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(n) / Math.log(1024));
    return `${parseFloat((n / Math.pow(1024, i)).toFixed(2))} ${u[i]}`;
  };
  const fmtEta = (s) => {
    if (s < 60) return `${Math.floor(s)}s`;
    const m = Math.floor(s / 60);
    const rs = Math.floor(s % 60);
    return `${m}m ${rs}s`;
  };

  // Step 1: Create Lesson Details
  const handleCreateLesson = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading("Saving lesson details...");
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
      localStorage.setItem('unfinishedUpload', JSON.stringify({ lessonId: newLessonId, courseId, unitId }));
      toast.success("Details saved successfully!", { id: toastId });
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.title || "Failed to save lesson details.", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Initiate Upload
  const handleInitiateUpload = async () => {
    if (!videoFile) {
      toast.error("Please select a video file first.");
      return;
    }
    setUploadDetails((prev) => ({ ...prev, isUploading: true, stateText: "Preparing upload..." }));

    try {
      const response = await axios.post(
        `/api/Lesson/${lessonId}/initiate-upload`,
        {},
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      const uploadInfo = response.data;
      
      localStorage.setItem('unfinishedUpload', JSON.stringify({ lessonId, courseId, unitId, videoId: uploadInfo.videoId }));
      
      startTus(videoFile, uploadInfo);
    } catch (error) {
      setUploadDetails((prev) => ({ ...prev, isUploading: false, stateText: "Preparation Failed" }));
      toast.error(error.response?.data?.message || "Failed to get upload signature.");
    }
  };

  // Main TUS function
  const startTus = (file, info) => {
    startedAt.current = Date.now();
    const upload = new tus.Upload(file, {
      endpoint: "https://video.bunnycdn.com/tusupload",
      chunkSize: 5 * 1024 * 1024,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: { filename: file.name, filetype: file.type || "application/octet-stream" },
      headers: {
        AuthorizationSignature: info.authorizationSignature,
        AuthorizationExpire: String(info.authorizationExpire),
        VideoId: info.videoId,
        LibraryId: info.libraryId,
      },
      onError(err) {
        if (isPausedByUser.current) return;

        const status = err.originalRequest ? err.originalRequest.getStatus() : 0;
        if (status === 401) {
          setUploadDetails(prev => ({ ...prev, stateText: "Session expired, renewing..." }));
          resignAndResume(info.videoId, upload);
          return;
        }
        setUploadDetails((prev) => ({ ...prev, isUploading: false, isPaused: false, stateText: `Upload Failed: ${err.message}` }));
        toast.error("An error occurred during the upload.");
      },
      onSuccess() {
        setUploadDetails((prev) => ({ ...prev, progress: 100, stateText: "Upload Complete ✔ — Finalizing..." }));
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
          speed: speed, eta: eta, stateText: "Uploading...", isPaused: false,
        }));
      },
    });

    currentUpload.current = upload;
    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
        toast.success("Previous progress found. Resuming upload.");
      }
      upload.start();
      setUploadDetails(prev => ({ ...prev, isUploading: true, stateText: "Starting upload..." }));
    });
  };
  
  // Resign and Resume
  const resignAndResume = async (videoId, uploadInstance) => {
    try {
      const { data } = await axios.post(`/api/Lesson/video/resign`, { videoId }, { headers: { Authorization: `Bearer ${jwt}` } });
      uploadInstance.setOptions({
        headers: {
          ...uploadInstance.options.headers,
          AuthorizationSignature: data.authorizationSignature,
          AuthorizationExpire: String(data.authorizationExpire),
        }
      });
      toast.success("Upload session renewed successfully.");
      uploadInstance.start();
    } catch (error) {
      toast.error("Could not renew upload session. Please try again.");
      setUploadDetails(prev => ({ ...prev, isUploading: false, stateText: "Renewal Failed" }));
    }
  };

  // Finalize Upload
  const finalizeUpload = async (videoId) => {
    try {
      await axios.post(`/api/Lesson/${lessonId}/finalize-upload`, { videoId }, { headers: { Authorization: `Bearer ${jwt}` } });
      setUploadDetails((prev) => ({ ...prev, stateText: "Lesson created successfully ✅" }));
      toast.success("Lesson and video uploaded successfully!");
      navigate(-1);
    } catch (error) {
      setUploadDetails((prev) => ({ ...prev, isUploading: false, stateText: "Finalizing failed" }));
      toast.error(error.response?.data?.message || "Failed to finalize lesson after upload.");
    }
  };
  
  // Toggle Pause/Resume
  const togglePause = () => {
    if (!currentUpload.current) return;
    if (uploadDetails.isPaused) {
      isPausedByUser.current = false;
      currentUpload.current.start();
      setUploadDetails((prev) => ({ ...prev, isPaused: false, stateText: "Uploading..." }));
    } else {
      isPausedByUser.current = true;
      currentUpload.current.abort(true);
      setUploadDetails((prev) => ({ ...prev, isPaused: true, stateText: "Paused" }));
    }
  };

  // Check for course data on load
  useEffect(() => {
    if (!courseId || !unitId) {
      const unfinished = JSON.parse(localStorage.getItem('unfinishedUpload'));
      if (unfinished) {
        if (window.confirm('Incomplete upload found. Would you like to resume?')) {
          navigate(location.pathname, { state: { courseId: unfinished.courseId, chapterId: unfinished.unitId }, replace: true });
          setLessonId(unfinished.lessonId);
          setStep(2);
        } else {
          localStorage.removeItem('unfinishedUpload');
          toast.error("Course or Unit data is missing!");
          navigate(-1);
        }
      } else {
        toast.error("Course or Unit data is missing!");
        navigate(-1);
      }
    }
  }, [courseId, unitId, navigate, location.pathname]);

  // Render Steps
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <FormInput id="lesson-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Lesson Title" />
            <FormTextarea id="lesson-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a detailed description for the lesson..." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileInput file={lessonImage} setFile={setLessonImage} label="Lesson Image (Optional)" acceptedTypes="image/*" icon={<ImageIcon className="mx-auto h-8 w-8 text-slate-400" />} />
              <FileInput file={pdfFile} setFile={setPdfFile} label="PDF Attachment (Optional)" acceptedTypes="application/pdf" icon={<Paperclip className="mx-auto h-8 w-8 text-slate-400" />} />
            </div>
            <div className="flex items-center pt-4">
              <input type="checkbox" id="freePreview" checked={isFreePreview} onChange={(e) => setIsFreePreview(e.target.checked)} className="w-5 h-5 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500" />
              <label htmlFor="freePreview" className="text-lg font-bold text-white cursor-pointer ml-3">Make this a free preview lesson</label>
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t border-slate-700">
              <button onClick={handleCreateLesson} disabled={!title || isSubmitting} className="px-8 py-3 rounded-lg bg-cyan-600 text-white font-bold transition-all transform hover:bg-cyan-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? "Saving..." : "Save & Continue"}
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
                    <p className="text-lg font-semibold text-white">Video Selected:</p>
                    <p className="text-md text-slate-300 truncate max-w-xs">{videoFile.name}</p>
                    <span className="mt-4 text-sm text-cyan-400 group-hover:underline">Click to change video</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadCloud size={48} className="mx-auto text-slate-400 group-hover:text-cyan-400 mb-2 transition-colors" />
                    <h4 className="mt-4 text-lg font-semibold text-white">Drag & drop video here</h4>
                    <p className="text-sm text-slate-400">or click to browse your device</p>
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
                  <div className="p-3 bg-slate-900/50 rounded-md border border-slate-700"><div className="font-bold text-slate-300">Speed</div><div className="text-white">{fmtBytes(speed)}/s</div></div>
                  <div className="p-3 bg-slate-900/50 rounded-md border border-slate-700"><div className="font-bold text-slate-300">ETA</div><div className="text-white">{eta > 0 ? fmtEta(eta) : "..."}</div></div>
                  <div className="p-3 bg-slate-900/50 rounded-md border border-slate-700 col-span-2 md:col-span-1"><div className="font-bold text-slate-300">Size</div><div className="text-white">{fmtBytes(uploadedBytes)} / {fmtBytes(totalBytes)}</div></div>
                </div>
                <div className="mt-6">
                  <button onClick={togglePause} className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white transition">
                    {isPaused ? <PlayCircle size={24} /> : <PauseCircle size={24} />}
                  </button>
                </div>
              </div>
            )}
            <div className="flex justify-between pt-4 mt-4 border-t border-slate-700">
              <button onClick={() => setStep(1)} disabled={isUploading} className="px-8 py-3 rounded-lg bg-slate-600 text-white font-bold hover:bg-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Back</button>
              <button onClick={handleInitiateUpload} disabled={!videoFile || isUploading} className="px-8 py-3 rounded-lg bg-green-600 text-white font-bold text-lg transition-all transform hover:bg-green-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                {isUploading ? stateText : "Start Upload & Publish"}
              </button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-gray-100 font-sans bg-slate-900">
      <Helmet><title>Add New Lesson</title></Helmet>
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2" style={{ textShadow: "0 0 15px rgba(34, 211, 238, 0.5)" }}>Add New Lesson</h1>
          <p className="text-slate-400 text-lg">Follow the steps below to create a lesson for your course.</p>
        </header>
        <div className="bg-slate-800/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
          <Stepper currentStep={step} />
          {renderStep()}
        </div>
      </main>
    </div>
  );
}