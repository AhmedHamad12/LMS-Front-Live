import { Trophy } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Cookies } from "react-cookie";
import { useLocation, useParams } from "react-router-dom";

export default function Course() {
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
  const [circleProgress, setCircleProgress] = useState(0);

  // Add state to track lesson progress locally
  const [lessonProgress, setLessonProgress] = useState({});

  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const durationRef = useRef(0);
  const lastSentRef = useRef({ ms: 0, sec: 0, pct: 0 });
  const maxPosRef = useRef(0);
  const currentLessonIdRef = useRef(null);
  const startTimeRef = useRef(0); // Add this to store the start time

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

  const location = useLocation();
  const courseId = location.state?.courseId;

  const loadCourse = async () => {
    setLoading(true);
    setLessons([]);

    try {
      const res = await apiGet(`/api/StudentCourse/${courseId}/full`);
      console.log(res)
      setEnrollCourses(res);
      setCircleProgress(Math.floor(+res?.courseProgress));

      // Initialize lesson progress state from server data
      const progressMap = {};
      if (res?.units) {
        res.units.forEach((unit) => {
          unit.lessons?.forEach((lesson) => {
            progressMap[lesson.id] = lesson.progress?.percent || 0;
          });
        });
      }
      setLessonProgress(progressMap);

      const course = res; // Assuming res is the course data

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

    // Update local lesson progress state
    if (currentLessonIdRef.current) {
      setLessonProgress((prev) => ({
        ...prev,
        [currentLessonIdRef.current]: pct,
      }));
    }
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
      month: "long",
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

  const openLesson = async (lessonId, videoId, lastPositionSeconds = 0) => {
    setGateMessage("...checking gate");
    setPlayerUrl("");
    setShowProgress(false);
    setIsActive(lessonId);

    durationRef.current = 0;
    lastSentRef.current = { ms: 0, sec: 0, pct: 0 };
    maxPosRef.current = 0;
    currentLessonIdRef.current = lessonId;
    
    // Store the start time for later use
    startTimeRef.current = lastPositionSeconds || 0;

    try {
      const gate = await apiGet(`/api/Lesson/${lessonId}/gate`);
      console.log(gate);

      if (gate.locked) {
        setGateMessage(
          `🔒 مقفول: لازم تشاهد ${gate.requiredPercent}% من الدرس السابق (إنت ${gate.currentPercent}%).`
        );
        logData(gate, "Gate:");
        return;
      }

      // Get the latest progress data from the server
      let serverStartTime = startTimeRef.current;
      try {
        const progressData = await apiGet(`/api/lesson/${lessonId}/progress/me`);
        serverStartTime = progressData?.lastPositionSeconds || startTimeRef.current;
        console.log(`Starting video at position: ${serverStartTime}s`);
        
        // Update local progress state
        const serverPercent = progressData?.percent || 0;
        setLessonProgress((prev) => ({
          ...prev,
          [lessonId]: serverPercent,
        }));
      } catch (e) {
        console.log("Could not fetch progress data, using provided lastPositionSeconds");
      }

      setGateMessage("");
      
      // Set the player URL with the correct start time
      const playerUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?start=${Math.floor(serverStartTime)}&autoplay=false&responsive=true&preload=true`;
      setPlayerUrl(playerUrl);
      setShowProgress(true);

      // Initialize player when iframe loads
      setTimeout(() => {
        if (window.playerjs && playerRef.current) {
          const player = new window.playerjs.Player(playerRef.current);
          playerInstanceRef.current = player;

          player.on("ready", () => {
            console.log("Player ready");
            
            player.getDuration((duration) => {
              durationRef.current = duration || 0;
              console.log(`Video duration: ${duration}s`);
            });

            // Set the current time to the desired position
            if (serverStartTime > 5) {
              console.log(`Setting current time to: ${serverStartTime}s`);
              player.setCurrentTime(serverStartTime);
            }

            sendProgress("opened", serverStartTime);
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
          
          player.on("ended", () => {
            const finalProgress = 100;
            // Update local state immediately when video ends
            setLessonProgress((prev) => ({
              ...prev,
              [lessonId]: finalProgress,
            }));
            sendProgress("ended", durationRef.current || maxPosRef.current);
          });

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

  const radius = 30;
  const stroke = 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circleProgress / 100) * circumference;

  return (
    <div className=" bg-gray-950 text-gray-100" dir="rtl">
      <div className=" text-2xl font-semibold bg-gray-950 border-b border-gray-800 py-2 px-12 flex items-center justify-between">
        <p>{enrollCourses?.course?.title}</p>

        <div className="flex items-center space-x-3 text-gray-200">
          {/* Circular progress */}
          <div className="relative w-16 h-16">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 80 80"
            >
              {/* Background circle */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="gray"
                strokeWidth={stroke}
                fill="none"
                className="opacity-30"
              />
              {/* Progress circle */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="rgb(129, 140, 248)" // Tailwind indigo-400
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>

            {/* Icon inside */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-indigo-400" />
            </div>
          </div>

          {/* Text */}
          <span className="text-lg">تقدمك ({circleProgress}%)</span>
        </div>
      </div>
      <div className="grid grid-cols-[320px_1fr] min-h-[calc(100vh-58px)] h-screen">
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
                    {course.lessons?.map((unit) => {
                      // Get progress from local state, fallback to server data
                      const currentProgress =
                        lessonProgress[unit.id] ?? unit.progress?.percent ?? 0;
                      const isCompleted = currentProgress > 80;

                      return (
                        <div
                          key={unit.id}
                          className={`py-4 px-4 border-b-[0.1px] border-gray-600 flex items-center gap-4 cursor-pointer hover:bg-white/5 ${
                            unit.id === isActive ? "bg-white/5" : ""
                          }`}
                          onClick={() =>
                            openLesson(
                              unit?.id,
                              unit?.vimeoId,
                              unit?.progress?.lastPositionSeconds
                            )
                          }
                        >
                          <input
                            type="checkbox"
                            readOnly
                            className="w-5 h-5 accent-cyan-400 disabled:opacity-100 disabled:accent-cyan-400 disabled:cursor-not-allowed "
                            checked={isCompleted}
                          />
                          <p className="font-bold text-white">{unit.title}</p>
                          {/* Optional: Show progress percentage */}
                          <span className="text-xs text-gray-400 mr-auto">
                            {currentProgress.toFixed(0)}%
                          </span>
                        </div>
                      );
                    })}
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
        </main>
      </div>
    </div>
  );
}