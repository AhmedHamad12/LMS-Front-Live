import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as THREE from "three";

import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import Loading from "../../Components/Loading";
import toast from "react-hot-toast";

const AddCourse = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseImage, setCourseImage] = useState(null);
  const [studyYear, setStudyYear] = useState(1);
  const [price, setPrice] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ALL useRef hooks must be declared FIRST, before any conditional returns
  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const starFieldsRef = useRef([]);

  // Move fetchData function inside component
  const fetchData = () => {
    const cookies = new Cookies();
    const token = cookies.get("token");

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

  // Move uploadCourse function inside component
  const uploadCourse = async () => {
    const cookies = new Cookies();
    const token = cookies.get("token");

    if (!title || !description || !studyYear) {
      throw new Error(
        "Please fill in all required fields: title, description, and study year."
      );
    }

    // Create FormData exactly as the backend expects
    const formData = new FormData();
    formData.append("Title", title);
    formData.append("Description", description);
    formData.append("Price", parseFloat(price));
    formData.append("StudyYear", parseInt(studyYear));

    // Only add image if it exists
    if (courseImage) {
      formData.append("CourseImage", courseImage);
    }

    return axios
      .post("/api/teacher/courses", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {

        return response;
      })
      .catch((error) => {
        console.error("API Error:", error);
        console.error("Error response:", error.response?.data);

        // Log the specific validation errors if they exist
        if (error.response?.data?.errors) {
          console.error("Validation errors:", error.response.data.errors);
          console.error(
            "Full validation error object:",
            JSON.stringify(error.response.data.errors, null, 2)
          );
        }

        console.error("Request data that was sent:", {
          formDataEntries: Array.from(formData.entries()),
        });

        throw error;
      });
  };
  const navigate = useNavigate();

  const {
    isLoading: isLoadingUser,
    data: dataUser,
    isError: isErrorUser,
    error: errorUser,
    isFetching: isFetchingUser,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user-data"],
    queryFn: fetchData,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Retry up to 3 times, but only for 403 errors
      if (error.response?.status === 403 && failureCount < 3) {
        // console.log(
        //   `Retrying user data fetch (attempt ${
        //     failureCount + 1
        //   }/3) due to 403 error...`
        // );
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    // gcTime: 5000, //cache time && its default is 5 minutes
    // staleTime: 30000, // this means the data will stay fresh for 30 seconds and will not fetching while i navigate to this page for 30 seconds and by that we can reduce the number of network requests && its default is 0
    // refetchOnMount: false, //use to prevent refetch data when component mounts its default is true
    // refetchOnMount: "always", // default value which is true is better option than this and true is the best option
    // refetchOnWindowFocus: true, // The default value

    // refetchInterval: 2000, //The query will automatically refetch every 2 seconds && it is very helpful if your query fetching data every specified numbers of seconds
    // refetchIntervalInBackground: true, // to keep fetching data even when the browser is not in focus because automatic refetching is paused when the window loses focus

    // enabled: false, //will not fetch data
  });

  const { data: dataCourse, refetch: refetchCourse } = useQuery({
    queryKey: ["add-course"],
    queryFn: uploadCourse,
    refetchOnWindowFocus: false,
    enabled: false,
  });

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
    setLoading(true);

    try {
      const result = await refetchCourse(); // Use refetch instead of direct function call

      if (result.data) {
        setResult(result);
        toast.success("تم اضافة الكورس بنجاح!");
        setTitle("");
        setDescription("");
        setCourseImage(null);
        setStudyYear(1);
        setPrice(0);
      }
    } catch (error) {
      console.error("Course submission error:", error);
      toast.error(`Error creating course: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  if (isLoadingUser || isFetchingUser) {
    return <Loading />;
  }

  // Show error state if user data fetch fails
  if (isErrorUser) {
    const is403Error = errorUser?.response?.status === 403;
    const errorMessage = is403Error
      ? "لا يمكن الوصول لبيانات المستخدم. قد تكون هناك مشكلة في الصلاحيات أو الجلسة منتهية."
      : `Error loading user data: ${errorUser.message}`;

    return (
      <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center">
        <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-xl max-w-md mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {is403Error ? "مشكلة في الصلاحيات" : "خطأ في تحميل البيانات"}
            </h2>
            <p className="text-gray-400 mb-6">{errorMessage}</p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-400 transition-colors"
              >
                إعادة تسجيل الدخول
              </Link>
              <button
                onClick={() => refetchUser()}
                className="block w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show warning if using mock user data
  if (dataUser?.data?.isMock) {
    return (
      <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center">
        <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-xl max-w-md mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              مشكلة في الوصول لبيانات المستخدم
            </h2>
            <p className="text-gray-400 mb-6">
              لا يمكن الوصول لبيانات المستخدم. قد تكون هناك مشكلة في الصلاحيات
              أو الجلسة منتهية.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-400 transition-colors"
              >
                إعادة تسجيل الدخول
              </Link>
              <button
                onClick={() => refetchUser()}
                className="block w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show warning if teacher profile is incomplete
  if (dataUser?.data?.role === "Teacher" && !dataUser?.data?.teacherId) {
    return (
      <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center">
        <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-xl max-w-md mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              ملف المدرس غير مكتمل
            </h2>
            <p className="text-gray-400 mb-6">
              يبدو أن ملف المدرس الخاص بك غير مكتمل. يجب عليك إكمال ملف المدرس
              قبل إنشاء الكورسات.
            </p>
            <div className="space-y-3">
              <Link
                to="/add-teacher"
                className="inline-block px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-400 transition-colors"
              >
                إكمال ملف المدرس
              </Link>
              <button
                onClick={() => refetchUser()}
                className="block w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors"
              >
                إعادة تحميل البيانات
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  اضافة كورس 
                </h1>
                <p className="text-gray-400 text-lg">
                  هنا يمكنك بناء وتعديل كل تفاصيل رحلتك التعليمية.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg bg-green-500 text-white font-bold hover:bg-green-400 transition-colors shadow-lg hover:shadow-green-500/25 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "جارى التحميل..." : "نشر الكورس"}
              </button>
            </header>

            <div className="space-y-6">
              <div className="glass-effect rounded-2xl p-6">
                <label className="block text-lg font-bold text-white mb-3">
                  عنوان الكورس
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="أدخل عنوان الكورس"
                  className="w-full p-3 rounded-lg text-lg bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:bg-black/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all"
                />
              </div>

              <div className="glass-effect rounded-2xl p-6">
                <label className="block text-lg font-bold text-white mb-3">
                  وصف الكورس
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="أدخل وصف الكورس"
                  rows={4}
                  className="w-full p-3 rounded-lg text-lg bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:bg-black/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all"
                />
              </div>

              <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  ارفق صورة للكورس
                </h3>
                <div className="mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-dashed border-gray-600 rounded-lg hover:border-cyan-500 transition-colors">
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
                          accept="image/*"
                          onChange={(e) => setCourseImage(e.target.files[0])}
                          required
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-effect rounded-2xl p-6">
                  <label className="block text-lg font-bold text-white mb-3">
                    السنة الدراسية
                  </label>
                  <input
                    type="number"
                    value={studyYear}
                    onChange={(e) => setStudyYear(e.target.value)}
                    required
                    min="1"
                    max="12"
                    placeholder="أدخل السنة الدراسية (1-12)"
                    className="w-full p-3 rounded-lg text-lg bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:bg-black/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all"
                  />
                </div>

                <div className="glass-effect rounded-2xl p-6">
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
                </div>
              </div>

              {/* Course Structure */}
            </div>
          </form>
          <div className="glass-effect rounded-2xl p-6">
            {result && <button
              onClick={() =>
                navigate(`/teacher/addchapter`, {
                  state: { courseId: result.data.data.id },
                })
              }
              className={`flex cursor-pointer justify-center rounded-lg border border-transparent bg-[#00BFFF] px-4 py-3 text-sm font-bold text-black shadow-sm shadow-[rgba(0,191,255,0.4)] transition-all duration-300 ease-in-out hover:translate-y-[2px] hover:shadow-[0_0_25px_rgb(0_191_255_/_0.7)]`}
            >
              إضافة باب جديد +
            </button>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddCourse;
