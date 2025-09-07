import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import { useLocation } from "react-router-dom";

export default function AddAssignment() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(1);
  const [file, setFile] = useState(null);

  const location = useLocation();
  const courseId = location.state?.courseId;
  const chapterId = location.state?.unitId;
  const lessonId = location.state?.lessonId;

  console.log(courseId, chapterId, lessonId)

  const cookies = new Cookies();
  const token = cookies.get("token");

  const addAssignment = async () => {
    const today = new Date();
    const creationDate = today.toLocaleDateString("en-CA");
    const formData = new FormData();
    formData.append("CourseId", +courseId);
    formData.append("UnitCourseId", +chapterId);
    formData.append("LessonId", +lessonId);
    formData.append("CreationDate", creationDate);
    formData.append("AssignmentDescription", description);
    formData.append("DueDate", dueDate);
    formData.append("Files", file);
    formData.append("AssignmentPriority", +priority);
    formData.append("AssignmentCategory", 1);

    
    await axios
      .post(`/api/Assignment/AddAssignmemt`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => console.log(res))
      .catch((error) => {
        console.error(error);
      });
  };

  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const starFieldsRef = useRef([]);

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
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Store refs
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Create starfield function
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

    starFieldsRef.current = [starsFar, starsMid, starsClose];

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

    // Cleanup
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    await addAssignment();
  };

  // if (isErrorUser) {
  //   const is403Error = errorUser?.response?.status === 403;
  //   const errorMessage = is403Error
  //     ? "لا يمكن الوصول لبيانات المستخدم. قد تكون هناك مشكلة في الصلاحيات أو الجلسة منتهية."
  //     : `Error loading user data: ${errorUser.message}`;

  //   return (
  //     <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center">
  //       <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-xl max-w-md mx-4">
  //         <div className="text-center">
  //           <div className="text-6xl mb-4">⚠️</div>
  //           <h2 className="text-2xl font-bold text-white mb-4">
  //             {is403Error ? "مشكلة في الصلاحيات" : "خطأ في تحميل البيانات"}
  //           </h2>
  //           <p className="text-gray-400 mb-6">{errorMessage}</p>
  //           <div className="space-y-3">
  //             <Link
  //               to="/login"
  //               className="inline-block px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-400 transition-colors"
  //             >
  //               إعادة تسجيل الدخول
  //             </Link>
  //             <button
  //               onClick={() => refetchUser()}
  //               className="block w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors"
  //             >
  //               إعادة المحاولة
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div
      className="text-gray-100 font-[Cairo] h-screen overflow-hidden w-full"
      dir="rtl"
    >
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
          <form onSubmit={handleSubmit}>
            <header className="flex justify-between items-center mb-6">
              <div>
                <h1
                  className="text-4xl font-black text-white mb-2"
                  style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
                >
                  إدارة كورس: الفيزياء الكونية
                </h1>
                <p className="text-gray-400 text-lg">
                  هنا يمكنك اضافة مهام جديدة.
                </p>
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-green-500 text-white font-bold hover:bg-green-400 transition-colors shadow-lg hover:shadow-green-500/25"
              >
                اضافة مهام
              </button>
            </header>

            <div className="space-y-6">
              <div className="glass-effect rounded-2xl p-6">
                <label className="block text-lg font-bold text-white mb-3">
                  تاريخ تسليم المهام
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg text-lg bg-black/20 border border-white/10 text-white focus:outline-none focus:bg-black/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:saturate-100 [&::-webkit-calendar-picker-indicator]:hue-rotate-[180deg] [&::-webkit-calendar-picker-indicator]:brightness-[1.2] [&::-webkit-calendar-picker-indicator]:contrast-[1.2]"
                />
              </div>

              <div className="glass-effect rounded-2xl p-6">
                <label className="block text-lg font-bold text-white mb-3">
                  وصف المهام
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="w-full p-3 rounded-lg text-lg bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:bg-black/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all"
                />
              </div>

              <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  ارفق ملف المهام
                </h3>
                <label className="mt-1 cursor-pointer flex justify-center px-6 pt-10 pb-10 border-2 border-dashed border-gray-600 rounded-lg hover:border-cyan-500 transition-colors">
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
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => setFile(e.target.files[0])}
                        />
                      </label>
                    </div>
                    {/* <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p> */}
                  </div>
                </label>
              </div>

              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
              <div className="glass-effect rounded-2xl p-6">
                <label className="block text-lg font-bold text-white mb-3">
                  الاولوية
                </label>
                <select
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-3 rounded-lg text-lg bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:bg-black/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all"
                >
                  <option value={1}>Low</option>
                  <option value={2}>Medium</option>
                  <option value={3}>High</option>
                </select>
              </div>

              {/* <div className="glass-effect rounded-2xl p-6">
                  <label className="block text-lg font-bold text-white mb-3">
                    سعر الكورس
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    placeholder="أدخل سعر الكورس"
                    className="w-full p-3 rounded-lg text-lg bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:bg-black/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all"
                  />
                </div> */}
              {/* </div> */}

              {/* Course Structure */}
              {/* <div className="glass-effect rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  إضافة دورة جديدة
                </h2>
                <p className="bg-black/20 border border-white/10 rounded-2xl p-4">
                  من خلال هذه الصفحة، يمكنك إنشاء دورات تعليمية جديدة وإدارتها
                  بكل سهولة. قم بإدخال جميع المعلومات الأساسية التي يحتاجها
                  المتعلمون مثل عنوان الدورة، الوصف، المدة، التخصص، وبيانات
                  المُحاضر. سواء كنت تطلق منهجًا متكاملًا أو ورشة عمل قصيرة،
                  تتيح لك هذه الأداة تنظيم المحتوى بشكل واضح واحترافي، مما يضمن
                  تجربة تعليمية مميزة للطلاب.
                </p>
              </div> */}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
