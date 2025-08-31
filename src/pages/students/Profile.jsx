import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import React, { useEffect, useRef, useState } from "react";
import { Cookies } from "react-cookie";
import * as THREE from "three";
import Loading from "../../Components/Loading";

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
      1000
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

  const cookies = new Cookies();
  const token = cookies.get("token");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSaveChanges = async () => {
    await axios
      .put(
        "/api/Student/updateStudent",
        { displayName: name, newPassword: password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setName("");
        setPassword("");
      })
      .catch((e) => console.log(e));
  };

  const fetchUser = () => {
    return axios
      .get("/api/Account/GetCurrentUser", {
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.error("User data fetch error:", error);
      });
  };

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });

  const fetchAllData = () => {
    return axios
      .get(`/api/Student/getStudentById`, {
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.error("User data fetch error:", error);
      });
  };

  const { data: allData, isLoading: dataLoading } = useQuery({
    queryKey: ["all-data"],
    queryFn: fetchAllData,
  });

  const getUserScore = async () => {
    return await axios.get("/api/Student/GetStudentRankAndScore", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const { data: userScore, isLoading: scoreLoading } = useQuery({
    queryKey: ["user-score"],
    queryFn: getUserScore,
  });

  const getNotifications = async () => {
    return await axios.get(`/api/Notification/student/${userScore?.data.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const { data: notifications, isLoading: notificationLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  if (userLoading || dataLoading || scoreLoading || notificationLoading) {
    return <Loading />
  }

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

        <h1 className="mb-2 text-4xl font-black text-white title-glow">
          الملف الشخصي
        </h1>
        <p className="mb-8 text-lg text-gray-400">
          قم بتعديل بياناتك الشخصية وإدارة إعدادات حسابك.
        </p>

        {/* Profile Header */}
        <div className="mb-12 flex flex-col items-center gap-8 md:flex-row">
          <div className="relative">
            <img
              src="/avatar.jpg"
              alt="صورة المستخدم"
              className="h-32 w-32 rounded-full border-4 border-cyan-400/50"
            />
            {/* <button className="absolute -right-1 -bottom-1 rounded-full bg-cyan-500 p-2 transition-colors hover:bg-cyan-400">
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
            </button> */}
          </div>
          <div>
            <h1
              className="text-4xl font-black text-white mb-3"
              style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
            >
              {user?.data.displayName}
            </h1>
            <p className="text-lg text-gray-400">{user?.data.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="rounded-2xl glass-effect p-6 text-center">
            <p className="text-sm text-gray-400">مجموع النقاط</p>
            <p className="text-4xl font-black text-cyan-300">
              {userScore?.data.score}
            </p>
          </div>
          <div className="rounded-2xl glass-effect p-6 text-center">
            <p className="text-sm text-gray-400">ترتيبك العام</p>
            <p className="text-4xl font-black text-red-400">
              {userScore?.data.rank}
            </p>
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
                  defaultValue={user?.data.displayName}
                  // value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/20 p-2 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={user?.data.email}
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
                  value={allData?.data.phone}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            <div className="space-y-4 max-h-80 overflow-y-auto rounded-2xl glass-effect p-6">
              {/* Activity 1 */}
              {notifications?.data.map((item) => (
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
                  <div className="mr-3">
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="text-xs text-gray-400 my-2">{item.timeAgo}</p>
                    <p className="text-xs text-gray-400">{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
