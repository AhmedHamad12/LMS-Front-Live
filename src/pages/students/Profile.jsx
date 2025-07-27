import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function Profile() {
  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const starfieldRefs = useRef([]);
  const clockRef = useRef(new THREE.Clock());
  const animationIdRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: "خالد علي",
    title: "رائد فضاء - متخصص في الفيزياء",
    email: "khaled.ali@email.com",
    phone: "**0100",
    password: "",
  });

  // Three.js setup
  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
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

    // Store references
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Starfield creation function
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

    // Create starfields
    const starsFar = createStarfield(8000, 0.05, 0x888888);
    const starsMid = createStarfield(5000, 0.1, 0xbbbbbb);
    const starsClose = createStarfield(1500, 0.15, 0xffffff);

    starfieldRefs.current = [starsFar, starsMid, starsClose];

    // Animation loop
    const animate = () => {
      const elapsedTime = clockRef.current.getElapsedTime();

      if (starfieldRefs.current.length > 0) {
        starfieldRefs.current[0].rotation.y = elapsedTime * 0.01;
        starfieldRefs.current[1].rotation.y = elapsedTime * 0.02;
        starfieldRefs.current[2].rotation.y = elapsedTime * 0.03;
      }

      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Scroll-based camera movement
  const handleScroll = () => {
    if (!mainContentRef.current || !cameraRef.current) return;

    const scrollY = mainContentRef.current.scrollTop;
    const docHeight =
      mainContentRef.current.scrollHeight - mainContentRef.current.clientHeight;
    const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;

    cameraRef.current.position.z = 5 - scrollPercent * 10;
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    // Handle save logic here
    console.log("Saving profile changes:", profileData);
  };

  return (
    <>
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 -z-10 h-full w-full"
      />

      <main
        ref={mainContentRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-8"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#00BFFF rgba(0,0,0,0.2)",
        }}
      >
        <style jsx>{`
          main::-webkit-scrollbar {
            width: 6px;
          }
          main::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
          }
          main::-webkit-scrollbar-thumb {
            background: #00bfff;
            border-radius: 10px;
          }
          main::-webkit-scrollbar-thumb:hover {
            background: #009acd;
          }
        `}</style>

        <h1
          className="mb-2 text-4xl font-black text-white title-glow"
        >
          الملف الشخصي
        </h1>
        <p className="mb-8 text-lg text-gray-400">
          قم بتعديل بياناتك الشخصية وإدارة إعدادات حسابك.
        </p>

        {/* Profile Header */}
        <div className="mb-12 flex flex-col items-center gap-8 md:flex-row">
            <div className="relative">
              <img
                src="https://placehold.co/120x120/ffffff/000000?text=خ"
                alt="صورة المستخدم"
                className="h-32 w-32 rounded-full border-4 border-cyan-400/50"
              />
              <button className="absolute -right-1 -bottom-1 rounded-full bg-cyan-500 p-2 transition-colors hover:bg-cyan-400">
                <svg
                  className="h-5 w-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  ></path>
                </svg>
              </button>
            </div>
            <div>
              <h1
                className="text-4xl font-black text-white"
                style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
              >
                {profileData.name}
              </h1>
              <p className="text-lg text-gray-400">{profileData.title}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="rounded-2xl glass-effect p-6 text-center">
              <p className="text-sm text-gray-400">مجموع النقاط</p>
              <p className="text-4xl font-black text-cyan-300">150</p>
            </div>
            <div className="rounded-2xl glass-effect p-6 text-center">
              <p className="text-sm text-gray-400">ترتيبك العام</p>
              <p className="text-4xl font-black text-red-400">7</p>
            </div>
            <div className="rounded-2xl glass-effect p-6 text-center">
              <p className="text-sm text-gray-400">كورسات مكتملة</p>
              <p className="text-4xl font-black text-white">1</p>
            </div>
            <div className="rounded-2xl glass-effect p-6 text-center">
              <p className="text-sm text-gray-400">الأوسمة المحصلة</p>
              <p className="text-4xl font-black text-white">2</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Edit Profile */}
            <div className="lg:col-span-1">
              <h2 className="mb-6 text-2xl font-bold">تعديل البيانات</h2>
              <div className="space-y-4 rounded-2xl glass-effect p-6">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/20 p-2 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    نبذة تعريفية (الرتبة)
                  </label>
                  <input
                    type="text"
                    value={profileData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/20 p-2 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-black/30 p-2 text-gray-500"
                    disabled
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    value={profileData.phone}
                    className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-black/30 p-2 text-gray-500"
                    disabled
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    تغيير كلمة المرور
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={profileData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="w-full rounded-lg border border-white/10 bg-black/20 p-2 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSaveChanges}
                  className="w-full rounded-lg bg-cyan-500 p-3 font-bold text-black transition-colors hover:bg-cyan-400"
                >
                  حفظ التغييرات
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <h2 className="mb-6 text-2xl font-bold">سجل المهام الأخير</h2>
              <div className="space-y-4 rounded-2xl glass-effect p-6">
                {/* Activity 1 */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 rounded-full bg-green-500/20 p-3">
                    <svg
                      className="h-5 w-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 6l-3.5-7L9 12l-4 8 4-4 2 2 4-4z"
                      ></path>
                    </svg>
                  </div>
                  <p className="flex-1 text-sm">
                    حصلت على{" "}
                    <span className="font-bold text-white">وسام السرعة</span>{" "}
                    لإنهاء واجب الفيزياء مبكرًا.
                  </p>
                  <p className="text-xs whitespace-nowrap text-gray-500">
                    منذ ساعة
                  </p>
                </div>

                {/* Activity 2 */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 rounded-full bg-cyan-500/20 p-3">
                    <svg
                      className="h-5 w-5 text-cyan-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      ></path>
                    </svg>
                  </div>
                  <p className="flex-1 text-sm">
                    قمت بتسليم واجب{" "}
                    <span className="font-bold text-white">
                      "تمرين على التفاضل"
                    </span>
                    .
                  </p>
                  <p className="text-xs whitespace-nowrap text-gray-500">
                    منذ 5 ساعات
                  </p>
                </div>

                {/* Activity 3 */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 rounded-full bg-red-500/20 p-3">
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                      ></path>
                    </svg>
                  </div>
                  <p className="flex-1 text-sm">
                    فاتك موعد امتحان{" "}
                    <span className="font-bold text-white">
                      "الأحياء الفضائية"
                    </span>
                    . تم خصم 75 نقطة.
                  </p>
                  <p className="text-xs whitespace-nowrap text-gray-500">
                    بالأمس
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
    </>
  );
};