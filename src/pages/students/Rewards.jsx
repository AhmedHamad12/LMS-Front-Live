import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../Components/Loading";

const Rewards = () => {
  const [filter, setFilter] = useState("all_time");
  // const canvasRef = useRef(null);
  // const sceneRef = useRef(null);
  // const mainContentRef = useRef(null);

  const leaderboards = {
    all_time: [
      {
        rank: 1,
        name: "عبدالله المنصوري",
        points: 15700,
        avatar: "https://placehold.co/40x40/ffffff/00BFFF?text=ع",
        isFrozen: false,
        reward: "اشتراك شهري مجاني!",
      },
      {
        rank: 2,
        name: "فاطمة الزهراء",
        points: 14250,
        avatar: "https://placehold.co/40x40/ffffff/00BFFF?text=ف",
        isFrozen: false,
        reward: "اشتراك شهري مجاني!",
      },
      {
        rank: 3,
        name: "خالد الأحمدي",
        points: 12900,
        avatar: "https://placehold.co/40x40/ffffff/00BFFF?text=خ",
        isFrozen: false,
        reward: "اشتراك شهري مجاني!",
      },
      {
        rank: 4,
        name: "سارة القحطاني",
        points: 11500,
        avatar: "https://placehold.co/40x40/ffffff/00BFFF?text=س",
        isFrozen: false,
      },
      {
        rank: 5,
        name: "محمد الغامدي",
        points: 10800,
        avatar: "https://placehold.co/40x40/ffffff/00BFFF?text=م",
        isFrozen: false,
      },
      {
        rank: 6,
        name: "نورة المطيري",
        points: 9700,
        avatar: "https://placehold.co/40x40/ffffff/00BFFF?text=ن",
        isFrozen: false,
      },
      {
        rank: 7,
        name: "خالد علي",
        points: 150,
        avatar: "https://placehold.co/40x40/000000/ffffff?text=خ",
        isFrozen: true,
      },
    ],
    this_month: [
      {
        rank: 1,
        name: "سارة القحطاني",
        points: 3200,
        avatar: "https://placehold.co/40x40/ffffff/00BFFF?text=س",
        isFrozen: false,
        reward: "1000 نقطة + وسام بطل الشهر",
      },
      {
        rank: 2,
        name: "عبدالله المنصوري",
        points: 2950,
        avatar: "https://placehold.co/40x40/ffffff/00BFFF?text=ع",
        isFrozen: false,
        reward: "500 نقطة إضافية",
      },
      {
        rank: 3,
        name: "يوسف الأحمد",
        points: 2800,
        avatar: "https://placehold.co/40x40/ffffff/00BFFF?text=ي",
        isFrozen: false,
        reward: "250 نقطة إضافية",
      },
      {
        rank: 4,
        name: "فاطمة الزهراء",
        points: 2500,
        avatar: "https://placehold.co/40x40/ffffff/00BFFF?text=ف",
        isFrozen: false,
      },
      {
        rank: 5,
        name: "خالد علي",
        points: 150,
        avatar: "https://placehold.co/40x40/000000/ffffff?text=خ",
        isFrozen: true,
      },
    ],
    this_week: [
      {
        rank: 1,
        name: "يوسف الأحمد",
        points: 800,
        avatar: "https://placehold.co/40x40/ffffff/00BFFF?text=ي",
        isFrozen: false,
        reward: "250 نقطة إضافية",
      },
      {
        rank: 2,
        name: "سارة القحطاني",
        points: 750,
        avatar: "https://placehold.co/40x40/ffffff/00BFFF?text=س",
        isFrozen: false,
        reward: "100 نقطة إضافية",
      },
      {
        rank: 3,
        name: "عبدالله المنصوري",
        points: 600,
        avatar: "https://placehold.co/40x40/ffffff/00BFFF?text=ع",
        isFrozen: false,
        reward: "50 نقطة إضافية",
      },
      {
        rank: 4,
        name: "خالد علي",
        points: 50,
        avatar: "https://placehold.co/40x40/000000/ffffff?text=خ",
        isFrozen: true,
      },
    ],
  };

  const cookies = new Cookies();
  const token = cookies.get("token");

  const getTopStudent = async () => {
    return await axios.get("/api/Student/getTopStudentsByScore", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const { data: topStudents, isLoading: topLoading } = useQuery({
    queryKey: ["top-students"],
    queryFn: getTopStudent,
  });

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

  console.log(topStudents);

  const currentLeaderboard = leaderboards[filter] || [];
  const topThree = topStudents?.data.slice(0, 3);
  const rest = currentLeaderboard.slice(3);

  const canvasRef = useRef(null);
    const mainContentRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const starsRef = useRef({ far: null, mid: null, close: null });
  
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
    
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
    
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
    
        starsRef.current.far = createStarfield(8000, 0.05, 0x888888);
        starsRef.current.mid = createStarfield(5000, 0.1, 0xbbbbbb);
        starsRef.current.close = createStarfield(1500, 0.15, 0xffffff);
    
        // Animation loop
        const clock = new THREE.Clock();
        const animate = () => {
          const elapsedTime = clock.getElapsedTime();
          if (starsRef.current.far)
            starsRef.current.far.rotation.y = elapsedTime * 0.01;
          if (starsRef.current.mid)
            starsRef.current.mid.rotation.y = elapsedTime * 0.02;
          if (starsRef.current.close)
            starsRef.current.close.rotation.y = elapsedTime * 0.03;
    
          renderer.render(scene, camera);
          requestAnimationFrame(animate);
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
    
        return () => {
          window.removeEventListener("resize", handleResize);
        };
      }, []);
    
      // Scroll-based animation
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
    
        if (mainContentRef.current) {
          mainContentRef.current.addEventListener("scroll", handleScroll);
        }
    
        return () => {
          if (mainContentRef.current) {
            mainContentRef.current.removeEventListener("scroll", handleScroll);
          }
        };
      }, []);

  const NavItem = ({ href, title, icon, isActive = false }) => (
    <a
      href={href}
      className={`flex items-center justify-center lg:justify-start p-3 rounded-lg transition-colors ${
        isActive
          ? "bg-cyan-500/20 text-white font-bold"
          : "text-gray-300 hover:bg-white/10"
      }`}
      title={title}
    >
      {icon}
      <span className="hidden lg:inline mr-3">{title}</span>
    </a>
  );

  const FilterButton = ({ filterKey, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
        isActive
          ? "bg-cyan-500 text-black"
          : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      {label}
    </button>
  );

  const PodiumCard = ({ student, position, isFirst = false }) => {
    const borderColor =
      position === 1
        ? "border-yellow-400"
        : position === 2
        ? "border-gray-400"
        : "border-yellow-700";
    const shadowColor = position === 1 ? "shadow-yellow-400/20" : "";
    const textColor =
      position === 1
        ? "text-yellow-300"
        : position === 2
        ? "text-gray-300"
        : "text-yellow-700";
    const rewardColor =
      position === 1
        ? "text-yellow-300 border-yellow-400/20"
        : position === 2
        ? "text-gray-300 border-gray-500/20"
        : "text-yellow-700 border-yellow-800/20";

    return (
      <div
        className={`bg-gradient-to-br from-slate-900/40 to-slate-800/50 backdrop-blur-md border border-white/5 rounded-t-2xl ${
          isFirst ? "p-8 border-2" : "p-6"
        } ${borderColor} ${shadowColor} text-center transform hover:scale-105 transition-transform duration-300 shadow-2xl`}
      >
        <img
          src="/avatar.jpg"
          alt={student.name}
          className={`${
            isFirst ? "w-24 h-24" : "w-20 h-20"
          } rounded-full mx-auto mb-4 border-4 ${borderColor}`}
        />
        <h3
          className={`${isFirst ? "text-2xl" : "text-xl"} font-bold text-white`}
        >
          {student.name}
        </h3>
        <p
          className={`${
            isFirst ? "text-3xl" : "text-2xl"
          } font-black ${textColor}`}
        >
          {student.score}{" "}
          <span className={isFirst ? "text-base" : "text-sm"}>نقطة</span>
        </p>
        <p className={`${isFirst ? "text-5xl" : "text-4xl"} mt-2`}>
          {position === 1 ? "🥇" : position === 2 ? "🥈" : "🥉"}
        </p>
        {student.reward && (
          <div className={`mt-4 pt-4 border-t ${rewardColor.split(" ")[1]}`}>
            <p
              className={`text-sm font-bold ${
                rewardColor.split(" ")[0]
              } flex items-center justify-center gap-2`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4z"></path>
              </svg>
              مكافأة: {student.reward}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (topLoading || userLoading || scoreLoading) {
    return <Loading />
  }

  return (
    <div
      className="min-h-screen text-gray-100 overflow-hidden w-full"
      dir="rtl"
      style={{ fontFamily: "Cairo, sans-serif" }}
    >
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10"
      />

      <div className="flex h-screen">
        {/* Main Content */}
        <main
          ref={mainContentRef}
          className="flex-1 flex flex-col p-8 overflow-y-auto"
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
            className="text-4xl font-black text-white mb-2"
            style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
          >
            لوحة شرف المجرّة
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            ساحة المنافسة لأقوى رواد الفضاء في مجرتنا التعليمية.
          </p>

          {/* Filter Buttons */}
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <FilterButton
              filterKey="all_time"
              label="على مستوى المجرة"
              isActive={filter === "all_time"}
              onClick={() => setFilter("all_time")}
            />
            <FilterButton
              filterKey="this_month"
              label="أبطال الشهر"
              isActive={filter === "this_month"}
              onClick={() => setFilter("this_month")}
            />
            <FilterButton
              filterKey="this_week"
              label="أفضل هذا الأسبوع"
              isActive={filter === "this_week"}
              onClick={() => setFilter("this_week")}
            />
          </div>

          {/* Top 3 Podium */}
          {topThree?.length >= 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end mb-12">
              {/* 2nd Place */}
              <div className="order-2 lg:order-1">
                <PodiumCard student={topThree[1]} position={2} />
              </div>
              {/* 1st Place */}
              <div className="order-1 lg:order-2">
                <PodiumCard student={topThree[0]} position={1} isFirst={true} />
              </div>
              {/* 3rd Place */}
              <div className="order-3 lg:order-3">
                <PodiumCard student={topThree[2]} position={3} />
              </div>
            </div>
          )}

          {/* Leaderboard List */}
          <div className="bg-gradient-to-br from-slate-900/40 to-slate-800/50 backdrop-blur-md border border-white/5 rounded-2xl p-4 shadow-2xl">
            <div className="space-y-2">
              {topStudents?.data.map((student) => (
                <div
                  key={student.rank}
                  className={`flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors ${
                    student.isFrozen ? "opacity-50" : ""
                  }`}
                >
                  <div className="w-12 text-center text-lg font-bold text-gray-400">
                    {student.rank}
                  </div>
                  <img
                    src="/avatar.jpg"
                    alt={student.name}
                    className="w-10 h-10 rounded-full mx-4"
                  />
                  <p className="font-bold text-white flex-grow">
                    {student.name}
                  </p>
                  <div className="w-24 text-center font-bold text-cyan-400">
                    {student.score} نقطة
                  </div>
                  {student.isFrozen && (
                    <div
                      className="w-10 text-center"
                      title="الرتبة مجمدة بسبب انخفاض النقاط"
                    >
                      <svg
                        className="w-5 h-5 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        ></path>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* User's Rank Fixed Bar */}
          <div className="sticky bottom-0 mt-8">
            <div className="bg-gradient-to-br from-slate-900/40 to-slate-800/50 backdrop-blur-md border-2 border-cyan-500/50 rounded-2xl p-4 flex items-center shadow-lg shadow-cyan-500/10">
              <div className="w-12 text-center text-lg font-bold text-white">
                {userScore?.data.rank}
              </div>
              <img
                src="/avatar.jpg"
                alt="خالد علي"
                className="w-10 h-10 rounded-full mx-4"
              />
              <p className="font-bold text-white flex-grow">
                أنت ({user?.data.displayName})
              </p>
              <div className="text-center">
                <p className="font-bold text-red-400">
                  {userScore?.data.score} نقطة
                </p>
                <p className="text-xs text-red-500">الرتبة مجمدة!</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Rewards;
