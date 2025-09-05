import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import axios, { BASE_URL } from "../../api/axios";
import { Cookies } from "react-cookie";
import { useEffect, useRef, useState } from "react";

function LessonData() {
  const location = useLocation();
  const lessonId = location.state?.lessonId;

  const navigate = useNavigate();

  const cookies = new Cookies();
  const token = cookies.get("token");

  const getLesson = async () => {
    return await axios
      .get(`/api/Lesson/${lessonId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.error("User data fetch error:", error);
      });
  };

  const { data: lesson } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: getLesson,
    refetchOnWindowFocus: false,
    enabled: !!lessonId, // Only run query if lessonId exists
  });

  const [libraryId, setLibraryId] = useState("475904");
  const [gateMessage, setGateMessage] = useState("");
  const [playerUrl, setPlayerUrl] = useState("");
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState({ value: 0, text: "" });
  const [log, setLog] = useState("{}");
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

  const SEND_EVERY_MS = 15000;
  const SEND_DELTA_SEC = 10;
  const SEND_DELTA_PCT = 5;

  const api = BASE_URL;

  // Helper functions
  const logData = (data, title = "") => {
    const logText =
      (title ? title + "\n" : "") +
      (typeof data === "string" ? data : JSON.stringify(data, null, 2));
    setLog(logText);
  };

  const getHeaders = (extra = {}) => ({
    Authorization: `Bearer ${token}`,
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

                // Update local progress with server data
                const serverPercent = p?.percent || 0;
                setLessonProgress((prev) => ({
                  ...prev,
                  [lessonId]: serverPercent,
                }));
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
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Auto-load lesson when component mounts and lesson data is available
  useEffect(() => {
    if (lesson?.data && lessonId) {
      const videoId = lesson.data.vimeoId || lesson.data.VimeoId;
      if (videoId) {
        openLesson(lessonId, videoId);
      } else {
        setGateMessage("معرف الفيديو غير متوفر");
        console.error("Video ID not found in lesson data:", lesson.data);
      }
    }
  }, [lesson, lessonId]);

  // Show loading state while lesson is being fetched
  if (!lesson && !gateMessage) {
    return (
      <div className="w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
        جاري تحميل الدرس...
      </div>
    );
  }

  // Show error if no lessonId provided
  if (!lessonId) {
    return (
      <div className="w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center text-red-400">
        معرف الدرس مفقود
      </div>
    );
  }

  const radius = 30;
  const stroke = 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circleProgress / 100) * circumference;

  return (
    <div className="space-y-4 px-4 py-2">
      {/* Lesson Title */}
      {lesson?.data && (
        <div className="flex justify-between items-center">
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-2">{lesson.data.title}</h2>
            <p className="text-gray-400">{formatted(lesson.data.createdAt)}</p>
          </div>
          <div>
            <button
              onClick={() =>
                navigate(`/teacher/updateLesson`, {
                  state: { courseId: lesson.data.id },
                })
              }
              className={`flex cursor-pointer justify-center rounded-lg border border-transparent bg-[#00BFFF] px-4 py-3 text-sm font-bold text-black shadow-sm shadow-[rgba(0,191,255,0.4)] transition-all duration-300 ease-in-out hover:translate-y-[2px] hover:shadow-[0_0_25px_rgb(0_191_255_/_0.7)]`}
            >
              تعديل الدرس
            </button>
          </div>
        </div>
      )}

      {/* Gate Message */}
      {gateMessage && (
        <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400">
          {gateMessage}
        </div>
      )}

      {/* Video Player */}
      <div className="relative">
        {playerUrl ? (
          <iframe
            ref={playerRef}
            src={playerUrl}
            className="w-full aspect-video border-0 rounded-lg bg-black"
            allow="autoplay; fullscreen; picture-in-picture"
            title="Video Player"
          />
        ) : (
          <div className="w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
            {gateMessage || "جاري تحميل الفيديو..."}
          </div>
        )}
      </div>

      <div>
        <p className="text-gray-400 my-8 break-all">{lesson.data.content}</p>
        {lesson?.data?.pdfPath && (
          <a
            href={lesson?.data?.pdfPath}
            target="_blank"
            className={`w-fit flex cursor-pointer justify-center rounded-lg border border-transparent bg-[#00BFFF] px-4 py-3 text-sm font-bold text-black shadow-sm shadow-[rgba(0,191,255,0.4)] transition-all duration-300 ease-in-out hover:translate-y-[2px] hover:shadow-[0_0_25px_rgb(0_191_255_/_0.7)]`}
          >
            اعرض الملف
          </a>
        )}
      </div>

      {/* Progress Bar */}
      {/* {showProgress && (
        <div className="space-y-2">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="h-2 bg-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress.value, 100)}%` }}
            ></div>
          </div>
          <div className="text-gray-400 text-sm">{progress.text}</div>
        </div>
      )}

      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4">
          <summary className="text-gray-400 cursor-pointer">Debug Log</summary>
          <pre className="bg-gray-800 border border-gray-700 p-4 rounded-lg max-h-56 overflow-auto text-sm text-gray-300 mt-2">
            {log}
          </pre>
        </details>
      )} */}
    </div>
  );
}

export default LessonData;
