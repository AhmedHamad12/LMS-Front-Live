import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import axios, { BASE_URL } from "../../api/axios";
import { Cookies } from "react-cookie";
import { useEffect, useRef, useState } from "react";
import Loading from "../../Components/Loading";

function LessonData() {
  const location = useLocation();
  const { lessonId } = location.state || {};

  const navigate = useNavigate();
  const cookies = new Cookies();
  const token = cookies.get("token");

  // --- NEW: State for User Data ---
  const [userRole, setUserRole] = useState(null);

  // --- State and Refs ---
  const [libraryId, setLibraryId] = useState("475904");
  const [gateMessage, setGateMessage] = useState("");
  const [playerUrl, setPlayerUrl] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  const playerRef = useRef(null);
  const durationRef = useRef(null);
  const lastSentRef = useRef({ ms: 0, sec: 0, pct: 0 });
  const maxPosRef = useRef(null);
  const currentLessonIdRef = useRef(null);

  const API_BASE_URL = BASE_URL;

  // --- NEW: Fetch User Data to Determine Role ---
  const fetchCurrentUser = () => {
    return axios.get("/api/Account/GetCurrentUser", {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (userData?.data?.role) {
      setUserRole(userData.data.role);
    }
  }, [userData]);

  // --- Data Fetching for Lesson ---
  const getLesson = () => {
    return axios.get(`/api/Lesson/${lessonId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const { data: lessonResponse, isLoading: isLessonLoading, isError } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: getLesson,
    refetchOnWindowFocus: false,
    enabled: !!lessonId,
  });
  const lesson = lessonResponse?.data;
  
  // --- API and Player Logic (with Role Checks) ---
  const getHeaders = (extra = {}) => ({ Authorization: `Bearer ${token}`, ...extra });
  const apiGet = async (path) => { /* ... (Same as before) ... */ };
  const apiPost = async (path, data, opts = {}) => { /* ... (Same as before) ... */ };

  const buildPayload = (event, sec) => { /* ... (Same as before) ... */ };
  
  const sendProgress = async (event, sec, opts = {}) => {
    // **MODIFIED:** Only send progress if the user is a Student
    if (userRole !== "Student") return;
    try {
      const payload = buildPayload(event, sec);
      await apiPost(`/api/lesson/${currentLessonIdRef.current}/progress`, payload, opts);
    } catch (e) { /* Ignore errors */ }
  };
  
  const shouldSend = (nowMs, sec, pct) => { /* ... (Same as before) ... */ };
  const maybeSend = (event, sec) => { /* ... (Same as before) ... */ };

  const openLesson = async (lessonIdToOpen, videoId) => {
    setGateMessage("...جاري التحميل");
    setPlayerUrl("");
    setProgressPercent(0);
    currentLessonIdRef.current = lessonIdToOpen;
    
    // **MODIFIED:** Role-based logic for gate checking
    if (userRole === "Student") {
        try {
            const gate = await apiGet(`/api/Lesson/${lessonIdToOpen}/gate`);
            if (gate.locked) {
                setGateMessage(`🔒 مقفول: يجب إكمال ${gate.requiredPercent}% من الدرس السابق (أنت أكملت ${gate.currentPercent}%).`);
                return;
            }
        } catch (e) {
            setGateMessage(`حدث خطأ: ${e.message}`);
            return;
        }
    }
    
    // Teacher and unlocked Student will proceed here
    setGateMessage("");
    setPlayerUrl(`https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=true&responsive=true&preload=true`);
  };

  // --- Effects ---
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js";
    script.async = true;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  useEffect(() => {
    if (!playerUrl || !playerRef.current || !window.playerjs) return;
    
    let player;
    const timeoutId = setTimeout(() => {
        player = new window.playerjs.Player(playerRef.current);
        player.on("ready", () => {
            player.getDuration(v => durationRef.current = v || 0);
            
            // **MODIFIED:** Only resume progress for students
            if (userRole === "Student") {
                apiGet(`/api/lesson/${currentLessonIdRef.current}/progress/me`).then(p => {
                    const last = p?.lastPositionSeconds || 0;
                    if (last > 5) player.setCurrentTime(last);
                    setProgressPercent(p?.percent || 0);
                });
            }
            sendProgress("opened", 0);
        });
        player.on("timeupdate", d => {
            const t = d.seconds || 0;
            maxPosRef.current = Math.max(maxPosRef.current, t);
            setProgressPercent(durationRef.current > 0 ? (t / durationRef.current) * 100 : 0);
            maybeSend("timeupdate", t);
        });
        player.on("ended", () => {
            setProgressPercent(100);
            sendProgress("ended", durationRef.current || maxPosRef.current);
        });
        player.on("play", () => player.getCurrentTime((t) => maybeSend("play", t || 0)));
        player.on("pause", () => player.getCurrentTime((t) => maybeSend("pause", t || 0)));
    }, 500);

    // Beacon logic is fine for both, as sendProgress will handle the role check
    const beaconHandler = () => { /* ... (Same as before) ... */ };
    window.addEventListener("beforeunload", beaconHandler, { capture: true });

    return () => { clearTimeout(timeoutId); window.removeEventListener("beforeunload", beaconHandler, { capture: true }); };
  }, [playerUrl, userRole]); // Added userRole as a dependency

  useEffect(() => {
    // **MODIFIED:** Wait for user role to be determined before opening lesson
    if (lesson && lessonId && userRole) {
      const videoId = lesson.vimeoId || lesson.VimeoId;
      if (videoId) {
        openLesson(lessonId, videoId);
      } else {
        setGateMessage("معرف الفيديو غير متوفر في بيانات الدرس.");
      }
    }
  }, [lesson, lessonId, userRole]); // Added userRole as a dependency

  // --- Render Logic ---
  const formatted = (newDate) => { /* ... (Same as before) ... */ };
  
  if (isLessonLoading || isUserLoading) return <Loading />;
  if (isError || !lessonId) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-red-400 p-8 text-center">
        حدث خطأ في تحميل بيانات الدرس أو المستخدم.
      </div>
    );
  }

  const radius = 30; const stroke = 4; const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="text-gray-100 font-[Cairo] bg-black min-h-screen" dir="rtl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
            <div className="lg:col-span-2">
                <div className="aspect-video w-full bg-slate-900/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl shadow-2xl shadow-cyan-500/10 flex items-center justify-center overflow-hidden">
                    {playerUrl ? (
                        <iframe ref={playerRef} src={playerUrl} className="w-full h-full border-0" allow="autoplay; fullscreen; picture-in-picture" title="Video Player" />
                    ) : (
                        <div className="text-center p-8">
                           {/* ... (Same loading/gated UI) ... */ }
                           <p className="text-lg font-semibold text-white">{gateMessage || "جاري تحميل الدرس..."}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                           <h1 className="text-2xl font-bold text-white leading-tight">{lesson?.title}</h1>
                           <p className="text-sm text-slate-400 mt-2">{formatted(lesson?.createdAt)}</p>
                        </div>
                        {/* **MODIFIED:** Conditional rendering for progress circle */}
                        {userRole === 'Student' && (
                          <div className="relative flex-shrink-0">
                             <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 68 68">
                                  <circle className="text-slate-700" strokeWidth={stroke} stroke="currentColor" fill="transparent" r={radius} cx="34" cy="34" />
                                  <circle className="text-cyan-400 transition-all duration-500" strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="34" cy="34" />
                             </svg>
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <span className="text-sm font-bold text-white">{Math.round(progressPercent)}%</span>
                             </div>
                          </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 shadow-lg">
                    <h2 className="text-xl font-bold text-cyan-400 border-b-2 border-cyan-400/20 pb-2 mb-4">عن الدرس</h2>
                    <p className="text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto">{lesson?.content}</p>
                </div>
                
                <div className="space-y-3">
                   {lesson?.pdfPath && (
                     <a href={lesson.pdfPath} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 text-center px-6 py-3 rounded-lg bg-slate-700/80 text-white font-bold hover:bg-slate-600/80 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        تحميل الملف المرفق (PDF)
                     </a>
                   )}
                   {/* **MODIFIED:** Conditional rendering for edit button */}
                   {userRole === 'Teacher' && (
                     <button onClick={() => navigate(`/teacher/updateLesson`, { state: { lessonData: lesson } })}
                             className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold transition-all transform hover:scale-105">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                          تعديل الدرس
                     </button>
                   )}
                </div>
            </div>
        </div>
    </div>
  );
}

export default LessonData;