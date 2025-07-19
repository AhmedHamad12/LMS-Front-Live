import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";

const Course = () => {
  const [activeChapter, setActiveChapter] = useState(1);
  const [activeLesson, setActiveLesson] = useState("1.2");
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [courseProgress, setCourseProgress] = useState(8);
  const [isChapter2Unlocked, setIsChapter2Unlocked] = useState(false);
  const [isAiUnlocked, setIsAiUnlocked] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(632); // 10:32 in seconds
  const [videoDuration, setVideoDuration] = useState(1330); // 22:10 in seconds
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);

  const currentLesson = {
    title: "الدرس الثاني: قانون أوم وقانونا كيرشوف",
    videoPoster:
      "https://placehold.co/1920x1080/0c0a24/ffffff?text=كورس+الفيزياء+الكونية",
  };

  const markAsComplete = () => {
    if (!isLessonComplete) {
      setIsLessonComplete(true);
      setCourseProgress((prev) => prev + 8);
    }
  };

  const unlockChapter2 = () => {
    setIsChapter2Unlocked(true);
    setShowPaymentModal(false);
  };

  const unlockAll = () => {
    setIsChapter2Unlocked(true);
    setIsAiUnlocked(true);
    setShowPaymentModal(false);
    setShowAiModal(false);
  };

  const unlockAIOnly = () => {
    setIsAiUnlocked(true);
    setShowAiModal(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Three.js background animation
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
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const starGeo = new THREE.BufferGeometry();
    const starCount = 5000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.08,
      transparent: true,
    });
    const stars = new THREE.Points(starGeo, starMaterial);
    scene.add(stars);

    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      stars.rotation.y = -elapsedTime * 0.01;
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
    };

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const PaymentModal = () => (
    <div
      className={`fixed inset-0 bg-black/70 z-50 flex items-center justify-center transition-opacity duration-300 ${
        showPaymentModal ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="bg-slate-900/50 backdrop-blur-2xl rounded-2xl w-full max-w-md p-8 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-center mb-2 text-cyan-300 drop-shadow-lg">
          فتح قفل المحتوى
        </h2>
        <p className="text-center text-gray-400 mb-6">
          أنت على وشك فتح "الباب الثاني: التأثير المغناطيسي"
        </p>

        <div className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-4 text-center mb-6">
          <p className="text-lg font-bold text-white">شراء هذا الباب فقط</p>
          <p className="text-4xl font-black text-cyan-300 my-2">
            50<span className="text-lg"> جنيه</span>
          </p>
          <button
            onClick={unlockChapter2}
            className="w-full mt-2 p-2 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors"
          >
            تأكيد الدفع
          </button>
        </div>

        <div className="text-center text-gray-400 my-4 text-sm"> أو </div>

        <div className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-4 text-center border-2 border-yellow-400/50">
          <p className="text-lg font-bold text-white">
            الاشتراك في باقة{" "}
            <span className="text-yellow-300">المجرّة الكاملة</span>
          </p>
          <div className="flex items-center justify-center gap-4 my-2">
            <p className="text-4xl font-black text-yellow-300">
              350<span className="text-lg"> جنيه/شهرياً</span>
            </p>
            <del className="text-2xl text-gray-500">500</del>
          </div>
          <p className="text-xs text-yellow-500 font-bold mb-3">
            عرض لمدة محدودة!
          </p>
          <button
            onClick={unlockAll}
            className="w-full mt-2 p-2 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-colors"
          >
            الترقية والوصول الكامل
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          وسائل الدفع المتاحة: فيزا، ماستركارد، فودافون كاش
        </p>
      </div>
    </div>
  );

  const AiModal = () => (
    <div
      className={`fixed inset-0 bg-black/70 z-50 flex items-center justify-center transition-opacity duration-300 ${
        showAiModal ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="bg-slate-900/50 backdrop-blur-2xl rounded-2xl w-full max-w-md p-8 border border-purple-500/20 shadow-2xl shadow-purple-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-center mb-2 text-purple-300 drop-shadow-lg">
          تفعيل مساعد المجرّة الذكي
        </h2>
        <p className="text-center text-gray-400 mb-6">
          احصل على إجابات فورية وخطط دراسية مخصصة
        </p>

        <div className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-4 text-center mb-6">
          <p className="text-lg font-bold text-white">
            الاشتراك في المساعد الذكي فقط
          </p>
          <p className="text-4xl font-black text-purple-300 my-2">
            75<span className="text-lg"> جنيه/شهرياً</span>
          </p>
          <button
            onClick={unlockAIOnly}
            className="w-full mt-2 p-2 rounded-lg bg-purple-500 text-white font-bold hover:bg-purple-400 transition-colors"
          >
            تفعيل المساعد
          </button>
        </div>

        <div className="text-center text-gray-400 my-4 text-sm"> أو </div>

        <div className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-4 text-center border-2 border-yellow-400/50">
          <p className="text-lg font-bold text-white">
            الاشتراك في باقة{" "}
            <span className="text-yellow-300">المجرّة الكاملة</span>
          </p>
          <div className="flex items-center justify-center gap-4 my-2">
            <p className="text-4xl font-black text-yellow-300">
              350<span className="text-lg"> جنيه/شهرياً</span>
            </p>
            <del className="text-2xl text-gray-500">500</del>
          </div>
          <p className="text-xs text-yellow-500 font-bold mb-3">
            عرض لمدة محدودة!
          </p>
          <button
            onClick={unlockAll}
            className="w-full mt-2 p-2 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-colors"
          >
            الترقية والوصول الكامل
          </button>
        </div>
      </div>
    </div>
  );

  const VideoControls = () => (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 z-20 transition-opacity duration-300 ${
        isVideoPlaying ? "opacity-100" : "opacity-0"
      } group-hover:opacity-100`}
    >
      <div className="flex items-center gap-4">
        <button onClick={() => setIsVideoPlaying(!isVideoPlaying)}>
          {!isVideoPlaying ? (
            <svg
              className="w-8 h-8 text-white hover:text-cyan-300 transition-colors"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.006v3.988a1 1 0 001.555.832l3.197-1.992a1 1 0 000-1.664l-3.197-1.992z"
                clipRule="evenodd"
              ></path>
            </svg>
          ) : (
            <svg
              className="w-8 h-8 text-white hover:text-cyan-300 transition-colors"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
          )}
        </button>
        <div className="text-xs font-mono text-white">
          {formatTime(videoTime)}
        </div>
        <div className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer">
          <div
            className="h-full bg-cyan-400 rounded-full transition-all duration-300 shadow-sm shadow-cyan-400"
            style={{ width: `${(videoTime / videoDuration) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs font-mono text-white">
          {formatTime(videoDuration)}
        </div>
        <button>
          <svg
            className="w-6 h-6 text-white hover:text-cyan-300 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            ></path>
          </svg>
        </button>
        <button>
          <svg
            className="w-6 h-6 text-white hover:text-cyan-300 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5v4m0 0h-4"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );

  const PlayButton = () => (
    <button
      onClick={() => setIsVideoPlaying(true)}
      className="absolute inset-0 w-full h-full flex items-center justify-center z-10"
    >
      <div className="w-24 h-24 bg-cyan-500/30 rounded-full flex items-center justify-center animate-pulse">
        <div className="w-20 h-20 bg-cyan-500/50 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.006v3.988a1 1 0 001.555.832l3.197-1.992a1 1 0 000-1.664l-3.197-1.992z"
              clipRule="evenodd"
            ></path>
          </svg>
        </div>
      </div>
    </button>
  );

  const NavItem = ({ href, icon, label, title }) => (
    <a
      href={href}
      className="flex items-center justify-center lg:justify-start p-3 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
      title={title}
    >
      {icon}
      <span className="hidden lg:ml-3 lg:block">{label}</span>
    </a>
  );

  return (
    <div
      className=" text-white min-h-screen overflow-hidden w-full"
      style={{ fontFamily: "Cairo, sans-serif" }}
      dir="rtl"
    >
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-screen -z-10"
      />

      <PaymentModal />
      <AiModal />

      <div className="flex h-screen ">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col p-4 lg:p-6">
          <header className="flex-shrink-0 flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-cyan-300 drop-shadow-lg">
                {currentLesson.title}
              </h1>
              <p className="text-sm text-gray-400">كورس الفيزياء الكونية</p>
            </div>
            <a
              href="/dashboard"
              className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <span className="hidden lg:inline">العودة للوحة التحكم</span>
              <span className="lg:hidden">→</span>
            </a>
          </header>

          <div className="flex-grow w-full bg-slate-900/50 backdrop-blur-2xl rounded-2xl mb-4 overflow-hidden relative group">
            {!isVideoPlaying && (
              <>
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={currentLesson.videoPoster}
                    alt="Video poster"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50"></div>
                </div>
                <PlayButton />
              </>
            )}
            <VideoControls />
          </div>

          <div className="flex-shrink-0 flex justify-between items-center bg-slate-900/50 backdrop-blur-2xl rounded-2xl p-4">
            <button className="px-5 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors">
              الدرس السابق
            </button>
            <button
              onClick={markAsComplete}
              disabled={isLessonComplete}
              className={`px-6 py-2 rounded-lg font-bold transition-colors shadow-lg ${
                !isLessonComplete
                  ? "bg-green-500 hover:bg-green-400 text-white shadow-green-500/20"
                  : "bg-gray-600 text-gray-300 cursor-not-allowed"
              }`}
            >
              {isLessonComplete ? "تم الإنجاز" : "تمت المشاهدة ✔"}
            </button>
            <button
              disabled={!isLessonComplete}
              className={`px-5 py-2 rounded-lg font-bold transition-colors ${
                isLessonComplete
                  ? "bg-cyan-500 hover:bg-cyan-400 text-black"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              الدرس التالي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Course;
