// import { useQuery } from "@tanstack/react-query";
// import axios from "../../api/axios";
// import React, { useState, useEffect, useRef } from "react";
// import { Cookies } from "react-cookie";
// import { Link, useParams } from "react-router-dom";
// import * as THREE from "three";

// const Course = () => {
//   const [activeChapter, setActiveChapter] = useState(1);
//   const [activeLesson, setActiveLesson] = useState("1.2");
//   const [isLessonComplete, setIsLessonComplete] = useState(false);
//   const [courseProgress, setCourseProgress] = useState(8);
//   const [isChapter2Unlocked, setIsChapter2Unlocked] = useState(false);
//   const [isAiUnlocked, setIsAiUnlocked] = useState(false);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [showAiModal, setShowAiModal] = useState(false);
//   const [isVideoPlaying, setIsVideoPlaying] = useState(false);
//   const [videoTime, setVideoTime] = useState(0);
//   const [videoDuration, setVideoDuration] = useState(0);
//   const canvasRef = useRef(null);
//   const animationRef = useRef(null);
//   const cookies = new Cookies();
//   const token = cookies.get("token");

//   const [data, setData] = useState(null);

//   const { lessonId } = useParams();

//   const fetchLesson = async () => {
//     try {
//       const response = await axios.get(`/api/Lesson/${lessonId}`);
//       return response;
//     } catch (error) {
//       console.error("Error fetching course data:", error);
//     }
//   };

//   // useEffect(() => {
//   //   fetchCourseData();
//   // }, []);

//   const { data: lesson } = useQuery({
//     queryKey: ["get-lesson"],
//     queryFn: fetchLesson,
//   });

//   console.log(lesson);

//   const currentLesson = data || {
//     title: "الدرس الثاني: قانون أوم وقانونا كيرشوف",
//     videoPoster:
//       "https://placehold.co/1920x1080/0c0a24/ffffff?text=كورس+الفيزياء+الكونية",
//     videoUrl: "",
//     duration: 1330,
//   };

//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(
//       75,
//       window.innerWidth / window.innerHeight,
//       0.1,
//       1000
//     );
//     camera.position.z = 5;

//     const renderer = new THREE.WebGLRenderer({
//       canvas: canvasRef.current,
//     });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setPixelRatio(window.devicePixelRatio);

//     const starGeo = new THREE.BufferGeometry();
//     const starCount = 5000;
//     const positions = new Float32Array(starCount * 3);
//     for (let i = 0; i < starCount; i++) {
//       positions[i * 3 + 0] = (Math.random() - 0.5) * 100;
//       positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
//       positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
//     }

//     starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
//     const starMaterial = new THREE.PointsMaterial({
//       color: 0xaaaaaa,
//       size: 0.08,
//       transparent: true,
//     });
//     const stars = new THREE.Points(starGeo, starMaterial);
//     scene.add(stars);

//     const clock = new THREE.Clock();

//     const animate = () => {
//       const elapsedTime = clock.getElapsedTime();
//       stars.rotation.y = -elapsedTime * 0.01;
//       renderer.render(scene, camera);
//       animationRef.current = requestAnimationFrame(animate);
//     };

//     const handleResize = () => {
//       camera.aspect = window.innerWidth / window.innerHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(window.innerWidth, window.innerHeight);
//     };

//     window.addEventListener("resize", handleResize);
//     animate();

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       cancelAnimationFrame(animationRef.current);
//     };
//   }, []);

//   const markAsComplete = () => {
//     if (!isLessonComplete) {
//       setIsLessonComplete(true);
//       setCourseProgress((prev) => prev + 8);
//     }
//   };

//   const unlockChapter2 = () => {
//     setIsChapter2Unlocked(true);
//     setShowPaymentModal(false);
//   };

//   const unlockAll = () => {
//     setIsChapter2Unlocked(true);
//     setIsAiUnlocked(true);
//     setShowPaymentModal(false);
//     setShowAiModal(false);
//   };

//   const unlockAIOnly = () => {
//     setIsAiUnlocked(true);
//     setShowAiModal(false);
//   };

//   const formatTime = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
//   };

//   const PlayButton = () => (
//     <button
//       onClick={() => setIsVideoPlaying(true)}
//       className="absolute inset-0 w-full h-full flex items-center justify-center z-10"
//     >
//       <div className="w-24 h-24 bg-cyan-500/30 rounded-full flex items-center justify-center animate-pulse">
//         <div className="w-20 h-20 bg-cyan-500/50 rounded-full flex items-center justify-center">
//           <svg
//             className="w-10 h-10 text-white"
//             fill="currentColor"
//             viewBox="0 0 20 20"
//           >
//             <path
//               fillRule="evenodd"
//               d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.006v3.988a1 1 0 001.555.832l3.197-1.992a1 1 0 000-1.664l-3.197-1.992z"
//               clipRule="evenodd"
//             ></path>
//           </svg>
//         </div>
//       </div>
//     </button>
//   );

//   const VideoControls = () => (
//     <div
//       className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 z-20 transition-opacity duration-300 ${
//         isVideoPlaying ? "opacity-100" : "opacity-0"
//       } group-hover:opacity-100`}
//     >
//       <div className="flex items-center gap-4">
//         <button onClick={() => setIsVideoPlaying(!isVideoPlaying)}>
//           {isVideoPlaying ? (
//             <svg
//               className="w-8 h-8 text-white"
//               fill="currentColor"
//               viewBox="0 0 20 20"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
//                 clipRule="evenodd"
//               />
//             </svg>
//           ) : (
//             <svg
//               className="w-8 h-8 text-white"
//               fill="currentColor"
//               viewBox="0 0 20 20"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.006v3.988a1 1 0 001.555.832l3.197-1.992a1 1 0 000-1.664l-3.197-1.992z"
//                 clipRule="evenodd"
//               />
//             </svg>
//           )}
//         </button>
//         <div className="text-xs font-mono text-white">
//           {formatTime(videoTime)}
//         </div>
//         <div className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer">
//           <div
//             className="h-full bg-cyan-400 rounded-full transition-all duration-300 shadow-sm shadow-cyan-400"
//             style={{ width: `${(videoTime / videoDuration) * 100}%` }}
//           ></div>
//         </div>
//         <div className="text-xs font-mono text-white">
//           {formatTime(videoDuration)}
//         </div>
//       </div>
//     </div>
//   );

//   // if (!data) {
//   //   return (
//   //     <div className="flex items-center justify-center h-screen text-white">
//   //       جاري تحميل بيانات الدرس...
//   //     </div>
//   //   );
//   // }

//   return (
//     <div
//       className="text-white min-h-screen overflow-hidden w-full"
//       style={{ fontFamily: "Cairo, sans-serif" }}
//       dir="rtl"
//     >
//       <canvas
//         ref={canvasRef}
//         className="fixed top-0 left-0 w-full h-screen -z-10"
//       />

//       <div className="flex h-screen">
//         <div className="flex-1 flex flex-col p-4 lg:p-6">
//           <header className="flex-shrink-0 flex justify-between items-center mb-4">
//             <div>
//               <h1 className="text-2xl lg:text-3xl font-bold text-cyan-300 drop-shadow-lg">
//                 {lesson?.data?.title}
//               </h1>
//               <p className="text-sm text-gray-400">{lesson?.data?.content}</p>
//             </div>
//             <Link
//               to="/student/mycourses"
//               className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
//             >
//               العودة للوحة التحكم
//             </Link>
//           </header>

//           <div className="flex-grow w-full bg-slate-900/50 backdrop-blur-2xl rounded-2xl mb-4 overflow-hidden relative group">
//             {!isVideoPlaying && (
//               <>
//                 {/* <img
//                   src={lesson?.data?.lessonImage}
//                   alt="."
//                   className="w-full h-full object-cover absolute inset-0"
//                 />
//                 <div className="absolute inset-0 bg-black/50"></div>
//                 <PlayButton /> */}
//               </>
//             )}
//             {isVideoPlaying && (
//               // <video
//               //   src={lesson?.data?.videoUrl}
//               //   autoPlay
//               //   controls
//               //   className="w-full h-full object-cover"
//               //   onTimeUpdate={(e) =>
//               //     setVideoTime(e.target.currentTime)
//               //   }
//               //   onLoadedMetadata={(e) =>
//               //     setVideoDuration(Math.floor(e.target.duration))
//               //   }
//               // />

//               // <iframe src={lesson?.data?.videoUrl} frameborder="0" className="w-full h-full object-cover"></iframe>
//               <iframe id="bplayer"
//         src={`https://iframe.mediadelivery.net/embed/${lesson?.data?.vimeoId}/${lesson?.data?.videoUrl}?autoplay=false&responsive=true&preload=true`}
//         allow="autoplay; fullscreen; picture-in-picture"></iframe>
//             )}
//             <VideoControls />
//           </div>

//           <div className="flex-shrink-0 flex justify-between items-center bg-slate-900/50 backdrop-blur-2xl rounded-2xl p-4">
//             <button className="px-5 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors">
//               الدرس السابق
//             </button>
//             <button
//               onClick={markAsComplete}
//               disabled={isLessonComplete}
//               className={`px-6 py-2 rounded-lg font-bold transition-colors shadow-lg ${
//                 !isLessonComplete
//                   ? "bg-green-500 hover:bg-green-400 text-white shadow-green-500/20"
//                   : "bg-gray-600 text-gray-300 cursor-not-allowed"
//               }`}
//             >
//               {isLessonComplete ? "تم الإنجاز" : "تمت المشاهدة ✔"}
//             </button>
//             <button
//               disabled={!isLessonComplete}
//               className={`px-5 py-2 rounded-lg font-bold transition-colors ${
//                 isLessonComplete
//                   ? "bg-cyan-500 hover:bg-cyan-400 text-black"
//                   : "bg-gray-700 text-gray-400 cursor-not-allowed"
//               }`}
//             >
//               الدرس التالي
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Course;

import { useState, useEffect, useRef } from "react";
import { Cookies } from "react-cookie";
import { useParams } from "react-router-dom";

export default function Course() {
  // const [courseId, setCourseId] = useState(16);
  const [libraryId, setLibraryId] = useState("475904");
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gateMessage, setGateMessage] = useState("");
  const [playerUrl, setPlayerUrl] = useState("");
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState({ value: 0, text: "" });
  const [log, setLog] = useState("{}");
  const [openCourse, setOpenCourse] = useState(1);
  const [enrollCourses, setEnrollCourses] = useState({});
  const [isActive, setIsActive] = useState(null);

  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const durationRef = useRef(0);
  const lastSentRef = useRef({ ms: 0, sec: 0, pct: 0 });
  const maxPosRef = useRef(0);
  const currentLessonIdRef = useRef(null);

  const SEND_EVERY_MS = 15000;
  const SEND_DELTA_SEC = 10;
  const SEND_DELTA_PCT = 5;

  const cookies = new Cookies();
  const jwt = cookies.get("token");

  const api = "http://lms278.runasp.net";

  // Helper functions
  const logData = (data, title = "") => {
    const logText =
      (title ? title + "\n" : "") +
      (typeof data === "string" ? data : JSON.stringify(data, null, 2));
    setLog(logText);
  };

  const getHeaders = (extra = {}) => ({
    Authorization: `Bearer ${jwt}`,
    ...extra,
  });

  const apiGet = async (path) => {
    const response = await fetch(api + path, { headers: getHeaders() });
    let body;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
    if (!response.ok) {
      throw new Error(typeof body === "string" ? body : JSON.stringify(body));
    }
    return body;
  };

  const apiPost = async (path, data, opts = {}) => {
    const url = api + path;
    const body = JSON.stringify(data);

    if (opts.beacon && navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      return { ok: true, beacon: true };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body,
    });

    let res;
    try {
      res = await response.json();
    } catch {
      res = await response.text();
    }

    if (!response.ok) {
      throw new Error(typeof res === "string" ? res : JSON.stringify(res));
    }
    return res;
  };

  const { courseId } = useParams();

  const loadCourse = async () => {
    setLoading(true);
    setLessons([]);

    try {
      const res = await apiGet(`/api/StudentCourse/${courseId}/full`);
      // const course = (res || []).find((c) => (c.id ?? c.Id) === courseId);

      setEnrollCourses(res);

      if (!course) {
        setLessons([{ type: "error", title: "الكورس غير موجود" }]);
        logData(res);
        return;
      }

      const units = course.units || course.Units || [];
      const lessonsList = [];

      units.forEach((u) => {
        const uid = u.id ?? u.Id;
        const utitle = u.title ?? u.Title ?? "وحدة " + uid;

        lessonsList.push({
          type: "unit",
          title: `📁 ${utitle}`,
        });

        const unitLessons = u.lessons || u.Lessons || [];
        unitLessons.forEach((l) => {
          const lid = l.id ?? l.Id;
          const ltitle = l.title ?? l.Title;
          const thumb =
            l.thumbnailUrl ?? l.ThumbnailUrl ?? l.lessonImage ?? l.LessonImage;
          const vId = l.vimeoId ?? l.VimeoId;

          lessonsList.push({
            type: "lesson",
            id: lid,
            videoId: vId,
            title: ltitle,
            thumbnail: thumb,
          });
        });
      });

      setLessons(
        lessonsList.length
          ? lessonsList
          : [{ type: "error", title: "لا يوجد دروس" }]
      );
      logData(course, "Course:");
    } catch (e) {
      logData(String(e), "LOAD ERROR:");
    } finally {
      setLoading(false);
    }
  };

  console.log(enrollCourses);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const updateUI = (sec) => {
    const pct = durationRef.current > 0 ? (sec / durationRef.current) * 100 : 0;
    setProgress({
      value: pct,
      text: `الموضع ${sec.toFixed(1)}s / ${durationRef.current.toFixed(
        1
      )}s — ${pct.toFixed(2)}%`,
    });
  };

  const shouldSend = (nowMs, sec, pct) => {
    const last = lastSentRef.current;
    if (nowMs - last.ms >= SEND_EVERY_MS) return true;
    if (Math.abs(sec - last.sec) >= SEND_DELTA_SEC) return true;
    if (Math.abs(pct - last.pct) >= SEND_DELTA_PCT) return true;
    return false;
  };

  const buildPayload = (event, sec) => {
    const pct =
      durationRef.current > 0
        ? +((sec / durationRef.current) * 100).toFixed(2)
        : 0;
    return {
      durationSeconds: Math.round(durationRef.current || 0),
      positionSeconds: Math.round(sec || 0),
      maxPositionSeconds: Math.round(maxPosRef.current || 0),
      percent: pct,
      event,
    };
  };

  const sendProgress = async (event, sec, opts = {}) => {
    try {
      const payload = buildPayload(event, sec);
      await apiPost(
        `/api/lesson/${currentLessonIdRef.current}/progress`,
        payload,
        opts
      );
    } catch (e) {
      // Ignore errors temporarily
    }
  };

  const formatted = (newDate) => {
    const date = new Date(newDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", // or "short" or "2-digit"
      day: "2-digit",
    });
  };

  const maybeSend = (event, sec) => {
    const now = Date.now();
    const pct = durationRef.current > 0 ? (sec / durationRef.current) * 100 : 0;
    const last = lastSentRef.current;

    if (event !== "timeupdate" || shouldSend(now, sec, pct)) {
      sendProgress(event, sec);
      lastSentRef.current = { ms: now, sec, pct };
    }
  };

  const openLesson = async (lessonId, videoId) => {
    setGateMessage("...checking gate");
    setPlayerUrl("");
    setShowProgress(false);
    setIsActive(lessonId);

    durationRef.current = 0;
    lastSentRef.current = { ms: 0, sec: 0, pct: 0 };
    maxPosRef.current = 0;
    currentLessonIdRef.current = lessonId;

    try {
      const gate = await apiGet(`/api/Lesson/${lessonId}/gate`);

      if (gate.locked) {
        setGateMessage(
          `🔒 مقفول: لازم تشاهد ${gate.requiredPercent}% من الدرس السابق (إنت ${gate.currentPercent}%).`
        );
        logData(gate, "Gate:");
        return;
      }

      setGateMessage("");
      setPlayerUrl(
        `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&responsive=true&preload=true`
      );
      setShowProgress(true);

      // Initialize player when iframe loads
      setTimeout(() => {
        if (window.playerjs && playerRef.current) {
          const player = new window.playerjs.Player(playerRef.current);
          playerInstanceRef.current = player;

          player.on("ready", () => {
            player.getDuration((v) => (durationRef.current = v || 0));

            // Resume from last position
            apiGet(`/api/lesson/${lessonId}/progress/me`)
              .then((p) => {
                const last = p?.lastPositionSeconds || 0;
                if (last > 5) player.setCurrentTime(last);
              })
              .catch(() => {});

            sendProgress("opened", 0);
          });

          player.on("timeupdate", (d) => {
            const t = d.seconds || 0;
            maxPosRef.current = Math.max(maxPosRef.current, t);
            updateUI(t);
            maybeSend("timeupdate", t);
          });

          player.on("play", () =>
            player.getCurrentTime((t) => maybeSend("play", t || 0))
          );
          player.on("pause", () =>
            player.getCurrentTime((t) => maybeSend("pause", t || 0))
          );
          player.on("ended", () =>
            sendProgress("ended", durationRef.current || maxPosRef.current)
          );

          // Beacon handler for page unload
          const beaconHandler = () => {
            if (!currentLessonIdRef.current || !player) return;
            player.getCurrentTime((t) => {
              const sec = t || 0;
              const payload = buildPayload("pause", sec);
              apiPost(
                `/api/lesson/${currentLessonIdRef.current}/progress`,
                payload,
                { beacon: true }
              );
            });
          };

          const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") beaconHandler();
          };

          window.addEventListener("beforeunload", beaconHandler, {
            capture: true,
          });
          document.addEventListener("visibilitychange", handleVisibilityChange);

          // Cleanup function
          return () => {
            window.removeEventListener("beforeunload", beaconHandler, {
              capture: true,
            });
            document.removeEventListener(
              "visibilitychange",
              handleVisibilityChange
            );
          };
        }
      }, 1000);
    } catch (e) {
      logData(String(e), "Open ERROR:");
    }
  };

  // Load Player.js script
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className=" bg-gray-950 text-gray-100" dir="rtl">
      <div className="grid grid-cols-[320px_1fr] min-h-[calc(100vh-58px)] h-screen">
        {/* Sidebar */}
        {/* <aside className="border-l border-gray-800 bg-gray-950 overflow-auto px-2">
          <ul className="list-none m-0 p-0">
            {lessons.length === 0 ? (
              <li className="px-4 py-2 text-gray-400 text-sm border-t border-gray-950 sticky top-0 bg-gray-950">
                اختر درس للمشاهدة
              </li>
            ) : (
              lessons.map((item, index) => (
                <li key={index}>
                  {item.type === "unit" ? (
                    <div className="px-4 py-2 text-gray-400 text-sm border-t border-gray-950 sticky top-0 bg-gray-950 my-2">
                      {item.title}
                    </div>
                  ) : item.type === "error" ? (
                    <div className="px-4 py-2 text-gray-400 text-sm border-t border-gray-950 sticky top-0 bg-gray-950">
                      {item.title}
                    </div>
                  ) : (
                    <div
                      className="px-4 py-4 border-b-[1px]  border-gray-600 cursor-pointer hover:bg-gray-700 flex gap-2 items-center"
                      onClick={() => openLesson(item.id, item.videoId)}
                    >
                      <span className="flex-1">{item.title}</span>
                      <span className="text-xs bg-gray-700 text-blue-300 px-2 py-1 rounded-full">
                        #{item.id}
                      </span>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </aside> */}

        <div className="border-l border-gray-800 bg-gray-950 overflow-auto px-2">
          <div>
            {enrollCourses?.units?.map((course, index) => (
              <div
                key={course.id}
                className="overflow-hidden rounded-2xl glass-effect my-2"
              >
                <button
                  onClick={() =>
                    setOpenCourse(openCourse === index ? null : index)
                  }
                  className="flex w-full items-center justify-between p-4 sm:p-6 text-right transition-colors bg-gray-800 hover:bg-white/5 "
                >
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {formatted(course.createdAt)}
                    </p>
                  </div>
                  <svg
                    className={`h-6 w-6 transform text-cyan-400 transition-transform duration-300 ${
                      openCourse === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
                {openCourse === index && (
                  <div className="animate-in slide-in-from-top-2 border-t border-white/10  pb-4 sm:pb-6 duration-300">
                    {course.lessons?.map((unit) => (
                      <div
                        key={unit.id}
                        className={`py-4 px-6 border-b-[0.1px] border-gray-600 flex items-center cursor-pointer hover:bg-white/5 ${
                          unit.id === isActive ? "bg-white/5" : ""
                        }`}
                        onClick={() => openLesson(unit.id, unit.videoId)}
                      >
                        <p className="font-bold text-white">{unit.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="p-4">
          {gateMessage && (
            <div className="mb-2 text-gray-400">{gateMessage}</div>
          )}

          <div></div>

          <div className="mb-4">
            {playerUrl ? (
              <iframe
                ref={playerRef}
                src={playerUrl}
                className="w-full aspect-video border-0 rounded-lg bg-black"
                allow="autoplay; fullscreen; picture-in-picture"
              />
            ) : (
              <div className="w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                اختر درس لبدء المشاهدة
              </div>
            )}
          </div>

          {/* {showProgress && (
            <div className="mb-4">
              <progress
                className="w-full h-3 rounded overflow-hidden"
                max="100"
                value={progress.value}
              />
              <div className="text-gray-400 text-sm mt-1">{progress.text}</div>
            </div>
          )} */}

          {/* <h4 className="text-lg font-semibold mb-2">Log</h4>
          <pre className="bg-gray-800 border border-gray-700 p-4 rounded-lg max-h-56 overflow-auto text-sm">
            {log}
          </pre> */}
        </main>
      </div>
    </div>
  );
}
