import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as THREE from "three";
import * as tus from "tus-js-client";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";

const AddLesson = () => {
  const { courseId, unitId } = useParams();
  const navigate = useNavigate();

  

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const starFieldsRef = useRef([]);

  // https://www.npmjs.com/package/tus-js-client

  // https://github.com/kqito/use-tus

  const cookies = new Cookies();
  const jwt = cookies.get("token");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lessonImage, setLessonImage] = useState(null);
  // const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [isFreePreview, setIsFreePreview] = useState(false);
  // const [videoData, setVideoData] = useState(null);
  // const [loading, setLoading] = useState(false);

  // const addLesson = async () => {
  //   console.log(videoData?.videoId);

  //   const formData = new FormData();

  //   if (thumbnailFile) formData.append("ThumbnailFile", thumbnailFile);
  //   formData.append("Title", title);
  //   formData.append("Content", content);
  //   formData.append("VideoId", videoData?.videoId);
  //   formData.append("VideoFile", videoFile);
  //   formData.append("LessonImage", lessonImage);
  //   formData.append("PdfFile", pdfFile);
  //   formData.append("CourseUnitId", chapterId);
  //   formData.append("CourseId", courseId);
  //   formData.append("IsFreePreview", isFreePreview);
  //   try {
  //     setLoading(true);
  //     const data = await axios.post("/api/Lesson", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     console.log("Lesson added successfully:", data);
  //   } catch (error) {
  //     console.error("Error uploading lesson:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const preSign = async () => {
  //   await axios.post("/api/Lesson/video/presign", title, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     }
  //   }).then(res => { setVideoData(res.data); console.log(res.data)}).catch(e => console.log(e))
  // }

  const apiBase = "http://lms278.runasp.net";
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState("—");
  const [stateText, setStateText] = useState("جاهز");
  // const [logs, setLogs] = useState([]);
  const [result, setResult] = useState("");
  let currentUpload = useRef(null);
  let startedAt = useRef(null);
  const fileRef = useRef(null);

  // const log = (m) => setLogs((prev) => [...prev, m]);

  const fmtBytes = (n) => {
    const u = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    while (n >= 1024 && i < u.length - 1) {
      n /= 1024;
      i++;
    }
    return `${n.toFixed(2)} ${u[i]}`;
  };

  const eta = (uploaded, total, started) => {
    const secs = (Date.now() - started) / 1000;
    if (secs <= 0 || uploaded <= 0) return "—";
    const rate = uploaded / secs;
    const remain = (total - uploaded) / rate;
    const m = Math.floor(remain / 60),
      s = Math.floor(remain % 60);
    return `${m}m ${s}s`;
  };

  const fileKey = (f) => `bny:file:${f.name}:${f.size}:${f.lastModified}`;
  const getCache = (k) => {
    const x = localStorage.getItem(k);
    return x ? JSON.parse(x) : null;
  };
  const putCache = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const delCache = (k) => localStorage.removeItem(k);

  const presign = async (title) => {
    const r = await fetch(`${apiBase}/api/Lesson/video/presign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(title || "Untitled"),
    });
    if (!r.ok) throw new Error(`presign failed: ${await r.text()}`);
    return r.json();
  };

  const resign = async (videoId) => {
    const r = await fetch(`${apiBase}/api/Lesson/video/resign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ videoId }),
    });
    if (!r.ok) throw new Error(`resign failed: ${await r.text()}`);
    return r.json();
  };

  const createLesson = async ({ videoId }) => {
    const formData = new FormData();

    if (thumbnailFile) formData.append("ThumbnailFile", thumbnailFile);
    formData.append("Title", title);
    formData.append("Content", content);
    formData.append("VideoId", videoId);
    formData.append("LessonImage", lessonImage);
    formData.append("PdfFile", pdfFile);
    formData.append("CourseUnitId", unitId);
    formData.append("CourseId", courseId);
    formData.append("IsFreePreview", isFreePreview);

    // const fd = new FormData();
    // fd.append("Title", title);
    // fd.append("Content", content);
    // fd.append("LessonImage", lessonImage);
    // fd.append("PdfFile", pdfFile);
    // fd.append("CourseUnitId", +unitId);
    // fd.append("CourseId", +courseId);
    // fd.append("IsFreePreview", isFreePreview);
    // fd.append("VideoId", videoId);
    // if (thumbnailFile) fd.append("ThumbnailFile", thumbnailFile);
    

    // const r = await fetch(`${apiBase}/api/Lesson`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "multipart/form-data",
    //     Authorization: `Bearer ${jwt}`,
    //   },
    //   body: formData,
    // });
    // console.log(r);
    // const t = await r.text();
    // if (!r.ok) throw new Error(`create lesson failed: ${t}`);
    // return t;
    const response = await axios
      .post("/api/Lesson", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${jwt}`,
        },
      })
      .then((res) => console.log("success"))
      .catch((e) => console.log("error"));
    return response?.data;
  };

  const startTus = (file, info, uploadUrl) => {
    startedAt.current = Date.now();
    const upload = new tus.Upload(file, {
      endpoint: "https://video.bunnycdn.com/tusupload",
      chunkSize: 5 * 1024 * 1024,
      metadata: {
        filename: file.name,
        filetype: file.type || "application/octet-stream",
      },
      headers: {
        AuthorizationSignature: info.authorizationSignature,
        AuthorizationExpire: info.authorizationExpire,
        VideoId: info.videoId,
        LibraryId: info.libraryId,
      },
      onAfterResponse(req, res) {
        const loc = res.getHeader("Location") || res.getHeader("location");
        if (loc) {
          const absolute = loc.startsWith("http")
            ? loc
            : `https://video.bunnycdn.com${loc}`;
          const k = fileKey(file);
          const cache = getCache(k) || {
            videoId: info.videoId,
            libraryId: info.libraryId,
          };
          if (!cache.uploadUrl) {
            cache.uploadUrl = absolute;
            putCache(k, cache);
            // console.log(`Saved session URL`);
          }
        }
      },
      async onError(err) {
        if (
          String(err).includes("403") ||
          String(err).toLowerCase().includes("expire")
        ) {
          try {
            const re = await resign(info.videoId);
            this.options.headers.AuthorizationSignature =
              re.authorizationSignature;
            this.options.headers.AuthorizationExpire = re.authorizationExpire;
            setStateText("جددنا التفويض — بنستأنف…");
            this.start();
            return;
          } catch (e) {
            // console.log("re-sign failed: " + e.message);
          }
        }
        setStateText("فشل الرفع");
        // console.log("Upload error: " + err);
      },
      async onSuccess() {
        setStateText("تم الرفع ✔ — إنشاء الدرس…");
        try {
          const text = await createLesson({ videoId: info.videoId });
          setResult(text);
          setStateText("تم إنشاء الدرس ✅");
          delCache(fileKey(file));
          setTitle("");
          setContent("");
          setLessonImage(null);
        } catch (e) {
          setStateText("الرفع تم — فشل إنشاء الدرس");
          // console.log(e.message);
        }
      },
      onProgress(u, t) {
        const p = ((u / t) * 100).toFixed(2);
        setProgress(p);
        setStateText(`يرفع… ${p}%`);
        const spd = u / ((Date.now() - startedAt.current) / 1000);
        setStats(
          `${fmtBytes(u)} / ${fmtBytes(t)}  —  ${fmtBytes(spd)}/s  —  ETA ${eta(
            u,
            t,
            startedAt.current
          )}`
        );
      },
    });

    currentUpload.current = upload;

    if (uploadUrl) {
      upload.resumeFromPreviousUpload({ url: uploadUrl });
      setStateText("استئناف…");
      upload.start();
    } else {
      upload.findPreviousUploads().then((list) => {
        if (list.length) {
          upload.resumeFromPreviousUpload(list[0]);
          setStateText("استئناف تلقائي…");
        } else setStateText("بدء الرفع…");
        upload.start();
      });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current.files[0];
    if (!file) {
      alert("اختَر ملف فيديو");
      return;
    }
    setResult("");
    const k = fileKey(file);
    let cache = getCache(k);

    try {
      if (cache?.videoId) {
        setStateText("استئناف — تجديد التفويض…");
        const info = await resign(cache.videoId);
        startTus(file, info, cache.uploadUrl || null);
      } else {
        setStateText("تحضير جلسة جديدة (presign)…");
        const info = await presign(title || file.name);
        putCache(k, { videoId: info.videoId, libraryId: info.libraryId });
        // console.log(`videoId=${info.videoId}`);
        startTus(file, info, null);
      }
    } catch (e) {
      setStateText("فشل التحضير");
      console.log(e.message);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    if (currentUpload.current) {
      currentUpload.current.abort();
      setStateText("تم الإيقاف");
    }
  };

  // Three.js setup
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

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

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
        size: size,
        color: color,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.7,
      });
      const starfield = new THREE.Points(geometry, material);
      scene.add(starfield);
      return starfield;
    };

    const starsFar = createStarfield(8000, 0.05, 0x888888);
    const starsMid = createStarfield(5000, 0.1, 0xbbbbbb);
    const starsClose = createStarfield(1500, 0.15, 0xffffff);

    starFieldsRef.current = [starsFar, starsMid, starsClose];

    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      starsFar.rotation.y = elapsedTime * 0.01;
      starsMid.rotation.y = elapsedTime * 0.02;
      starsClose.rotation.y = elapsedTime * 0.03;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  // Handle scroll for camera movement
  useEffect(() => {
    const handleScroll = () => {
      if (!mainContentRef.current || !cameraRef.current) return;

      const scrollY = mainContentRef.current.scrollTop;
      const docHeight =
        mainContentRef.current.scrollHeight -
        mainContentRef.current.clientHeight;
      const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;

      cameraRef.current.position.z = 5 - scrollPercent * 10;
    };

    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener("scroll", handleScroll);
      return () => mainContent.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuOpen && !e.target.closest(".user-menu")) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [userMenuOpen]);

  return (
    <div
      className="text-gray-100 font-[Cairo] h-screen overflow-hidden w-full"
      dir="rtl"
    >
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10"
      />

      <div className="flex h-screen">
        {/* Main Content */}
        <main
          ref={mainContentRef}
          className="flex-1 p-8 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#00BFFF rgba(0,0,0,0.2)",
          }}
        >
          <form>
            <header className="flex justify-between items-center mb-6">
              <div>
                <h1
                  className="text-4xl font-black text-white mb-2"
                  style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
                >
                  إضافة درس جديد
                </h1>
                <p className="text-gray-400 text-lg">
                  أضف درساً جديداً للفصل الخاص بك.
                </p>
              </div>
              {/* <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-green-500 text-white font-bold hover:bg-green-400 transition-colors shadow-lg hover:shadow-green-500/25"
              >
                إضافة الدرس
              </button> */}
            </header>

            <div className="space-y-6">
              <div className="glass-effect rounded-2xl p-6">
                <label className="block text-lg font-bold text-white mb-3">
                  عنوان الدرس *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="أدخل عنوان الدرس"
                  className="w-full p-3 rounded-lg text-lg bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:bg-black/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all"
                />
              </div>

              <div className="glass-effect rounded-2xl p-6">
                <label className="block text-lg font-bold text-white mb-3">
                  محتوى الدرس *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder="أدخل محتوى ووصف الدرس"
                  rows={4}
                  className="w-full p-3 rounded-lg text-lg bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:bg-black/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all"
                />
              </div>

              <div className="glass-effect rounded-2xl p-6">
                <label className="block text-lg font-bold text-white mb-3">
                  صورة الدرس *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-dashed border-gray-600 rounded-lg hover:border-cyan-500 transition-colors">
                  <div className="space-y-2 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-500"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-400 justify-center">
                      <label className="relative cursor-pointer bg-gray-800/50 rounded-md px-3 py-1 font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                        <span>اختر صورة الدرس</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setLessonImage(e.target.files[0])}
                          required
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                    {lessonImage && (
                      <p className="text-sm text-green-400">
                        تم اختيار: {lessonImage.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-2xl p-6">
                <label className="block text-lg font-bold text-white mb-3">
                  فيديو الدرس *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-dashed border-gray-600 rounded-lg hover:border-cyan-500 transition-colors">
                  <div className="space-y-2 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <div className="flex text-sm text-gray-400 justify-center">
                      <label className="relative cursor-pointer bg-gray-800/50 rounded-md px-3 py-1 font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                        <span>اختر فيديو الدرس</span>
                        <input ref={fileRef} type="file" accept="video/*" />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">MP4, MOV up to 1GB</p>
                    {/* Buttons */}
                    <div className="mt-4 flex gap-2 justify-center">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={(e) => handleUpload(e)}
                      >
                        Upload / Resume
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                      <progress
                        className="w-96 h-4 progress-bar"
                        max="100"
                        value={progress}
                      ></progress>
                      <div className="mt-1 text-sm">{stats}</div>
                      <div className="mt-1">{stateText}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-effect rounded-2xl p-6">
                  <label className="block text-lg font-bold text-white mb-3">
                    ملخص الدرس (PDF)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-400 transition-colors">
                    <div className="space-y-2 text-center">
                      <svg
                        className="mx-auto h-8 w-8 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                      <label className="cursor-pointer text-purple-400 hover:text-purple-300 text-sm">
                        <span>اختر ملف PDF</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => setPdfFile(e.target.files[0])}
                          className="sr-only"
                        />
                      </label>
                      {pdfFile && (
                        <p className="text-xs text-green-400">
                          تم اختيار: {pdfFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-2xl p-6">
                  <label className="block text-lg font-bold text-white mb-3">
                    صورة مصغرة (اختياري)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-orange-400 transition-colors">
                    <div className="space-y-2 text-center">
                      <svg
                        className="mx-auto h-8 w-8 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <label className="cursor-pointer text-orange-400 hover:text-orange-300 text-sm">
                        <span>اختر صورة مصغرة</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setThumbnailFile(e.target.files[0])}
                          className="sr-only"
                        />
                      </label>
                      {thumbnailFile && (
                        <p className="text-xs text-green-400">
                          تم اختيار: {thumbnailFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-2xl p-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="freePreview"
                    checked={isFreePreview}
                    onChange={(e) => setIsFreePreview(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                  />
                  <label
                    htmlFor="freePreview"
                    className="text-lg font-bold text-white cursor-pointer"
                  >
                    معاينة مجانية للدرس
                  </label>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  إذا تم تفعيل هذا الخيار، سيتمكن الطلاب من مشاهدة هذا الدرس
                  مجاناً كمعاينة للكورس
                </p>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddLesson;

// import React, { useState, useRef } from "react";
// import { Cookies } from "react-cookie";
// import * as tus from "tus-js-client";

// export default function AddLesson() {
//   const [apiBase, setApiBase] = useState("http://lms278.runasp.net");
//   // const [jwt, setJwt] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
//   const [title, setTitle] = useState("mohamedhany");
//   const [courseId, setCourseId] = useState(16);
//   const [unitId, setUnitId] = useState(9);

//   const cookies = new Cookies();
//   const jwt = cookies.get("token");

//   const [progress, setProgress] = useState(0);
//   const [stats, setStats] = useState("—");
//   const [stateText, setStateText] = useState("جاهز");
//   const [logs, setLogs] = useState([]);
//   const [result, setResult] = useState("");
//   let currentUpload = useRef(null);
//   let startedAt = useRef(null);
//   const fileRef = useRef(null);

//   const log = (m) => setLogs((prev) => [...prev, m]);

//   const fmtBytes = (n) => {
//     const u = ["B", "KB", "MB", "GB", "TB"];
//     let i = 0;
//     while (n >= 1024 && i < u.length - 1) {
//       n /= 1024;
//       i++;
//     }
//     return `${n.toFixed(2)} ${u[i]}`;
//   };

//   const eta = (uploaded, total, started) => {
//     const secs = (Date.now() - started) / 1000;
//     if (secs <= 0 || uploaded <= 0) return "—";
//     const rate = uploaded / secs;
//     const remain = (total - uploaded) / rate;
//     const m = Math.floor(remain / 60),
//       s = Math.floor(remain % 60);
//     return `${m}m ${s}s`;
//   };

//   const fileKey = (f) => `bny:file:${f.name}:${f.size}:${f.lastModified}`;
//   const getCache = (k) => {
//     const x = localStorage.getItem(k);
//     return x ? JSON.parse(x) : null;
//   };
//   const putCache = (k, v) => localStorage.setItem(k, JSON.stringify(v));
//   const delCache = (k) => localStorage.removeItem(k);

//   const presign = async (title) => {
//     const r = await fetch(`${apiBase}/api/Lesson/video/presign`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${jwt}`,
//       },
//       body: JSON.stringify(title || "Untitled"),
//     });
//     if (!r.ok) throw new Error(`presign failed: ${await r.text()}`);
//     return r.json();
//   };

//   const resign = async (videoId) => {
//     const r = await fetch(`${apiBase}/api/Lesson/video/resign`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${jwt}`,
//       },
//       body: JSON.stringify({ videoId }),
//     });
//     if (!r.ok) throw new Error(`resign failed: ${await r.text()}`);
//     return r.json();
//   };

//   const createLesson = async ({ title, courseId, unitId, videoId }) => {
//     const fd = new FormData();
//     fd.append("Title", title || "Untitled");
//     fd.append("Content", "uploaded via tester");
//     fd.append("CourseId", String(courseId));
//     fd.append("CourseUnitId", String(unitId));
//     fd.append("IsFreePreview", "true");
//     fd.append("VideoId", videoId);
//     const r = await fetch(`${apiBase}/api/Lesson`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${jwt}` },
//       body: fd,
//     });
//     const t = await r.text();
//     if (!r.ok) throw new Error(`create lesson failed: ${t}`);
//     return t;
//   };

//   const startTus = (file, info, uploadUrl) => {
//     startedAt.current = Date.now();
//     const upload = new tus.Upload(file, {
//       endpoint: "https://video.bunnycdn.com/tusupload",
//       chunkSize: 5 * 1024 * 1024,
//       metadata: {
//         filename: file.name,
//         filetype: file.type || "application/octet-stream",
//       },
//       headers: {
//         AuthorizationSignature: info.authorizationSignature,
//         AuthorizationExpire: info.authorizationExpire,
//         VideoId: info.videoId,
//         LibraryId: info.libraryId,
//       },
//       onAfterResponse(req, res) {
//         const loc = res.getHeader("Location") || res.getHeader("location");
//         if (loc) {
//           const absolute = loc.startsWith("http")
//             ? loc
//             : `https://video.bunnycdn.com${loc}`;
//           const k = fileKey(file);
//           const cache = getCache(k) || {
//             videoId: info.videoId,
//             libraryId: info.libraryId,
//           };
//           if (!cache.uploadUrl) {
//             cache.uploadUrl = absolute;
//             putCache(k, cache);
//             log(`Saved session URL`);
//           }
//         }
//       },
//       async onError(err) {
//         if (
//           String(err).includes("403") ||
//           String(err).toLowerCase().includes("expire")
//         ) {
//           try {
//             const re = await resign(info.videoId);
//             this.options.headers.AuthorizationSignature =
//               re.authorizationSignature;
//             this.options.headers.AuthorizationExpire = re.authorizationExpire;
//             setStateText("جددنا التفويض — بنستأنف…");
//             this.start();
//             return;
//           } catch (e) {
//             log("re-sign failed: " + e.message);
//           }
//         }
//         setStateText("فشل الرفع");
//         log("Upload error: " + err);
//       },
//       async onSuccess() {
//         setStateText("تم الرفع ✔ — إنشاء الدرس…");
//         try {
//           const text = await createLesson({
//             title,
//             courseId,
//             unitId,
//             videoId: info.videoId,
//           });
//           setResult(text);
//           setStateText("تم إنشاء الدرس ✅");
//           delCache(fileKey(file));
//         } catch (e) {
//           setStateText("الرفع تم — فشل إنشاء الدرس");
//           log(e.message);
//         }
//       },
//       onProgress(u, t) {
//         const p = ((u / t) * 100).toFixed(2);
//         setProgress(p);
//         setStateText(`يرفع… ${p}%`);
//         const spd = u / ((Date.now() - startedAt.current) / 1000);
//         setStats(
//           `${fmtBytes(u)} / ${fmtBytes(t)}  —  ${fmtBytes(spd)}/s  —  ETA ${eta(
//             u,
//             t,
//             startedAt.current
//           )}`
//         );
//       },
//     });

//     currentUpload.current = upload;

//     if (uploadUrl) {
//       upload.resumeFromPreviousUpload({ url: uploadUrl });
//       setStateText("استئناف…");
//       upload.start();
//     } else {
//       upload.findPreviousUploads().then((list) => {
//         if (list.length) {
//           upload.resumeFromPreviousUpload(list[0]);
//           setStateText("استئناف تلقائي…");
//         } else setStateText("بدء الرفع…");
//         upload.start();
//       });
//     }
//   };

//   const handleUpload = async () => {
//     const file = fileRef.current.files[0];
//     if (!file) {
//       alert("اختَر ملف فيديو");
//       return;
//     }
//     setResult("");
//     const k = fileKey(file);
//     let cache = getCache(k);

//     try {
//       if (cache?.videoId) {
//         setStateText("استئناف — تجديد التفويض…");
//         const info = await resign(cache.videoId);
//         startTus(file, info, cache.uploadUrl || null);
//       } else {
//         setStateText("تحضير جلسة جديدة (presign)…");
//         const info = await presign(title || file.name);
//         putCache(k, { videoId: info.videoId, libraryId: info.libraryId });
//         log(`videoId=${info.videoId}`);
//         startTus(file, info, null);
//       }
//     } catch (e) {
//       setStateText("فشل التحضير");
//       log(e.message);
//     }
//   };

//   const handleCancel = () => {
//     if (currentUpload.current) {
//       currentUpload.current.abort();
//       setStateText("تم الإيقاف");
//     }
//   };

//   return (
//     <div className="p-6 font-sans">
//       <h2 className="text-xl font-bold mb-4">
//         رفع/استئناف فيديو لـ Bunny بزر واحد
//       </h2>

//       {/* API Base */}
//       {/* <label className="block mb-1">API Base</label>
//       <input
//         className="border px-2 py-1 w-96"
//         value={apiBase}
//         onChange={(e) => setApiBase(e.target.value)}
//       /> */}

//       {/* JWT */}
//       {/* <label className="block mt-4 mb-1">JWT (Teacher)</label>
//       <input
//         className="border px-2 py-1 w-96"
//         value={jwt}
//         onChange={(e) => setJwt(e.target.value)}
//       /> */}

//       {/* Lesson Title */}
//       <label className="block mt-4 mb-1">Lesson Title</label>
//       <input
//         className="border px-2 py-1 w-96"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//       />

//       {/* Course/Unit */}
//       <label className="block mt-4 mb-1">CourseId / CourseUnitId</label>
//       <div className="flex items-center gap-2">
//         <input
//           type="number"
//           className="border px-2 py-1 w-24"
//           value={courseId}
//           onChange={(e) => setCourseId(Number(e.target.value))}
//         />
//         /
//         <input
//           type="number"
//           className="border px-2 py-1 w-24"
//           value={unitId}
//           onChange={(e) => setUnitId(Number(e.target.value))}
//         />
//       </div>

//       {/* File */}
//       <label className="block mt-4 mb-1">اختر الفيديو</label>
//       <input ref={fileRef} type="file" accept="video/*" />

//       {/* Buttons */}
//       <div className="mt-4 flex gap-2">
//         <button
//           className="bg-blue-500 text-white px-4 py-2 rounded"
//           onClick={handleUpload}
//         >
//           Upload / Resume
//         </button>
//         <button
//           className="bg-red-500 text-white px-4 py-2 rounded"
//           onClick={handleCancel}
//         >
//           Cancel
//         </button>
//       </div>

//       {/* Progress */}
//       <div className="mt-4">
//         <progress className="w-96 h-4" max="100" value={progress}></progress>
//         <div className="mt-1 text-sm">{stats}</div>
//         <div className="mt-1">{stateText}</div>
//       </div>

//       {/* Result */}
//       <h3 className="mt-6 font-bold">نتيجة إنشاء الدرس</h3>
//       <div className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
//         {result}
//       </div>

//       {/* Log */}
//       <h3 className="mt-6 font-bold">Log</h3>
//       <div className="bg-gray-50 p-2 rounded max-w-3xl font-mono">
//         {logs.map((l, i) => (
//           <div key={i}>{l}</div>
//         ))}
//       </div>
//     </div>
//   );
// }
