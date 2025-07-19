import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import AsideBar from "../../components/AsideBar";

export default function Prize() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const mainContentRef = useRef(null);

  // Letter collection state
  const collectedLetters = {
    D: true,
    A: true,
    7: false,
    E: true,
    T: false,
  };

  // Badges state
  const badges = [
    {
      id: 1,
      name: "وسام التفوق",
      description: "للحصول على 95%+",
      icon: "🏅",
      earned: true,
      borderColor: "border-yellow-400/50",
    },
    {
      id: 2,
      name: "وسام السرعة",
      description: "لإنهاء واجب قبل الموعد",
      icon: "⏰",
      earned: true,
      borderColor: "border-cyan-400/50",
    },
    {
      id: 3,
      name: "وسام المثابرة",
      description: "للدخول 30 يوم متتالي",
      icon: "👑",
      earned: false,
      borderColor: "border-gray-600",
    },
    {
      id: 4,
      name: "وسام المنطلق",
      description: "لإنهاء 3 كورسات",
      icon: "🚀",
      earned: false,
      borderColor: "border-gray-600",
    },
  ];

  // Rewards store items
  const rewardsItems = [
    {
      id: 1,
      name: "خصم 25% على الاشتراك",
      cost: 2000,
      available: false,
    },
    {
      id: 2,
      name: "ساعة إضافية مع مدرس",
      cost: 5000,
      available: false,
    },
    {
      id: 3,
      name: "فتح امتحان مغلق",
      cost: 1000,
      available: false,
    },
  ];
  // Three.js setup
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create starfield
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
        new THREE.BufferAttribute(positions, 3),
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

    sceneRef.current = {
      scene,
      camera,
      renderer,
      starsFar,
      starsMid,
      starsClose,
    };

    // Animation loop
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

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // Handle scroll for camera movement
  useEffect(() => {
    const handleScroll = () => {
      if (!mainContentRef.current || !sceneRef.current) return;

      const scrollY = mainContentRef.current.scrollTop;
      const docHeight =
        mainContentRef.current.scrollHeight -
        mainContentRef.current.clientHeight;
      const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;

      sceneRef.current.camera.position.z = 5 - scrollPercent * 10;
    };

    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener("scroll", handleScroll);
      return () => mainContent.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const renderLetterBox = (letter, index) => {
    const isCollected = collectedLetters[letter];
    return (
      <div
        key={index}
        className={`flex h-20 w-16 items-center justify-center rounded-lg border-2 transition-all duration-300 md:h-28 md:w-24 ${
          isCollected
            ? "border-solid border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-400/30"
            : "border-dashed border-gray-600"
        }`}
      >
        <span
          className={`text-4xl font-black md:text-5xl ${
            isCollected ? "text-cyan-300" : "text-gray-600"
          }`}
          style={
            isCollected ? { textShadow: "0 0 8px rgba(0, 255, 255, 0.8)" } : {}
          }
        >
          {isCollected ? letter : "?"}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-gray-100" dir="rtl">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 -z-10 h-full w-full"
      />

      <div className="flex h-screen">
        {/* Sidebar */}
        <AsideBar />

        {/* Main Content */}
        <main
          ref={mainContentRef}
          className="flex-1 overflow-y-auto p-8"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#00BFFF rgba(0,0,0,0.2)",
          }}
        >
          <h1
            className="mb-2 text-4xl font-black text-white"
            style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
          >
            خزنة الإنجازات
          </h1>
          <p className="mb-8 text-lg text-gray-400">
            هنا يتم توثيق كل انتصاراتك في مجرّة المعرفة.
          </p>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column */}
            <div className="lg:col-span-2">
              {/* Letter Collection Challenge */}
              <div className="mb-8 rounded-2xl border border-white/5 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 backdrop-blur-xl">
                <h2 className="mb-2 text-2xl font-bold">تحدي تجميع الحروف</h2>
                <p className="mb-6 text-gray-400">
                  مع كل إنجاز كبير، ستحصل على حرف. قم بتجميع كلمة "
                  <span className="text-lg font-bold text-yellow-300">
                    D A 7 E 7
                  </span>
                  " لفتح الجائزة الكبرى!
                </p>
                <div className="flex justify-center gap-2 md:gap-4">
                  {["D", "A", "7", "E", "7"].map((letter, index) =>
                    renderLetterBox(letter, index),
                  )}
                </div>
              </div>

              {/* Badges Gallery */}
              <div>
                <h2 className="mb-6 text-2xl font-bold">معرض الأوسمة</h2>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`rounded-2xl border bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4 text-center backdrop-blur-xl transition-all duration-300 ${
                        badge.earned
                          ? badge.borderColor
                          : "border-gray-600 opacity-40"
                      }`}
                    >
                      <div
                        className={`mb-2 text-5xl ${badge.earned ? "" : "grayscale"}`}
                      >
                        {badge.icon}
                      </div>
                      <p className="mt-2 font-bold">{badge.name}</p>
                      <p
                        className={`text-xs ${badge.earned ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {badge.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Points Bank */}
              <div>
                <h2 className="mb-6 text-2xl font-bold">بنك النقاط</h2>
                <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 text-center backdrop-blur-xl">
                  <p className="text-gray-400">رصيدك الحالي من النقاط</p>
                  <p
                    className="my-4 text-6xl font-black text-cyan-400"
                    style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
                  >
                    150
                  </p>
                  <button className="mt-6 w-full rounded-lg bg-purple-600 p-3 font-bold text-white transition-colors hover:bg-purple-500">
                    استبدل نقاطك الآن
                  </button>
                </div>
              </div>

              {/* Rewards Store */}
              <div>
                <h2 className="mb-6 text-2xl font-bold">متجر المكافآت</h2>
                <div className="space-y-3 rounded-2xl border border-white/5 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4 backdrop-blur-xl">
                  {rewardsItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between rounded-lg bg-white/5 p-3 ${
                        item.available ? "" : "opacity-50"
                      }`}
                    >
                      <div>
                        <p
                          className={`font-bold ${item.available ? "text-white" : "text-gray-400"}`}
                        >
                          {item.name}
                        </p>
                        <p
                          className={`text-sm ${item.available ? "text-yellow-400" : "text-gray-500"}`}
                        >
                          التكلفة: {item.cost} نقطة
                        </p>
                      </div>
                      <button
                        className={`rounded-full px-4 py-1 text-xs font-bold ${
                          item.available
                            ? "bg-cyan-500 text-black hover:bg-cyan-400"
                            : "cursor-not-allowed bg-gray-600 text-gray-800"
                        }`}
                        disabled={!item.available}
                      >
                        استبدال
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
