import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as THREE from "three";

import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import TeacherAside from "../../Components/teacher/TeacherAside";

const AddCourse = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState({
    id: 1,
    title: "الدرس الأول: التيار الكهربي",
  });
  const [chapters, setChapters] = useState([
    {
      id: 1,
      title: "الباب الأول: الكهربية التياريه",
      lessons: [{ id: 1, title: "الدرس الأول: التيار الكهربي" }],
    },
  ]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseImage, setCourseImage] = useState(null);
  const [studyYear, setStudyYear] = useState(1);
  const [price, setPrice] = useState(0);

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

        // If we get a 403 error, it might be a permission issue
        if (error.response?.status === 403) {
          console.log(
            "403 Forbidden - trying to get user data from alternative endpoint..."
          );

          // Try alternative endpoint
          return axios
            .get("http://lms278.runasp.net/api/Account/GetUser", {
              headers: {
                accept: "text/plain",
                Authorization: `Bearer ${token}`,
              },
            })
            .catch((altError) => {
              console.error("Alternative user endpoint also failed:", altError);

              // If both fail, return a mock user object with basic info
              console.log("Returning mock user data");
              return {
                data: {
                  displayName: "Teacher",
                  email: "teacher@example.com",
                  role: "Teacher",
                  teacherId: null,
                  studentId: null,
                  isMock: true, // Flag to indicate this is mock data
                },
              };
            });
        }

        // For other errors, re-throw
        throw error;
      });
  };

  // Move uploadCourse function inside component
  const uploadCourse = async () => {
    const cookies = new Cookies();
    const token = cookies.get("token");

    // First, try to get teacherId from user data
    let teacherId = dataUser?.data?.teacherId;

    // If teacherId is null, try to get it from the token or make an additional API call
    if (!teacherId) {
      console.log(
        "Teacher ID is null, attempting to get teacher information..."
      );

      try {
        // Try to get teacher information from a different endpoint
        const teacherResponse = await axios.get(
          "http://lms278.runasp.net/api/Teacher/GetCurrentTeacher",
          {
            headers: {
              accept: "text/plain",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (teacherResponse.data?.id) {
          teacherId = teacherResponse.data.id;
          console.log("Found teacher ID from GetCurrentTeacher:", teacherId);
        } else {
          // If that doesn't work, try to decode the JWT token to get user ID
          const tokenParts = token.split(".");
          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]));
              teacherId = payload.nameid || payload.sub || payload.userId;
              console.log("Found teacher ID from JWT token:", teacherId);
            } catch (e) {
              console.error("Failed to decode JWT token:", e);
            }
          }
        }
      } catch (error) {
        console.error("Failed to get teacher information:", error);

        // As a last resort, try to use email as identifier (some APIs accept this)
        if (dataUser?.data?.email) {
          console.log(
            "Trying to use email as teacher identifier:",
            dataUser.data.email
          );
          teacherId = dataUser.data.email;
        }
      }
    }

    // If we still don't have teacherId, throw an error
    if (!teacherId) {
      throw new Error(
        "Teacher ID not available. Please complete your teacher profile first."
      );
    }

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
    formData.append("TeacherId", parseInt(teacherId));
    formData.append("StudyYear", parseInt(studyYear));

    // Only add image if it exists
    if (courseImage) {
      formData.append("CourseImage", courseImage);
    }

    console.log("Sending course data:", {
      Title: title,
      Description: description,
      Price: parseFloat(price),
      TeacherId: parseInt(teacherId),
      StudyYear: parseInt(studyYear),
      hasImage: !!courseImage,
    });

    return axios
      .post("http://lms278.runasp.net/api/Course", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("API Response:", response);
        console.log("Response data:", response.data);
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

        // Also log the request data that was sent
        console.error("Request data that was sent:", {
          formDataEntries: Array.from(formData.entries()),
        });

        throw error;
      });
  };
  const navigate = useNavigate();

  // Move useQuery hooks inside component
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
    retry: (failureCount, error) => {
      // Retry up to 3 times, but only for 403 errors
      if (error.response?.status === 403 && failureCount < 3) {
        console.log(
          `Retrying user data fetch (attempt ${
            failureCount + 1
          }/3) due to 403 error...`
        );
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
    enabled: false, // Disable automatic execution, only run when manually triggered
    // gcTime: 5000, //cache time && its default is 5 minutes
    // staleTime: 30000, // this means the data will stay fresh for 30 seconds and will not fetching while i navigate to this page for 30 seconds and by that we can reduce the number of network requests && its default is 0
    // refetchOnMount: false, //use to prevent refetch data when component mounts its default is true
    // refetchOnMount: "always", // default value which is true is better option than this and true is the best option
    // refetchOnWindowFocus: true, // The default value

    // refetchInterval: 2000, //The query will automatically refetch every 2 seconds && it is very helpful if your query fetching data every specified numbers of seconds
    // refetchIntervalInBackground: true, // to keep fetching data even when the browser is not in focus because automatic refetching is paused when the window loses focus

    // enabled: false, //will not fetch data
  });

  // ALL useEffect hooks must be declared BEFORE any conditional returns
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

    try {
      console.log("Submitting course...");
      const result = await refetchCourse(); // Use refetch instead of direct function call
      console.log("Course submission result:", result);

      if (result.data) {
        alert("Course created successfully!");
        // Set a flag to indicate this course was just created
        const courseId = result.data.data?.id || result.data.id;
        if (courseId) {
          sessionStorage.setItem(`course-${courseId}-created`, "true");
        }
        // Optionally redirect or clear form

        navigate(`/teacher/addchapter/${result.data.data.id}`);
      }
    } catch (error) {
      console.error("Course submission error:", error);
      alert(`Error creating course: ${error.message}`);
    }
  };

  console.log(dataUser);
  console.log(dataCourse);

  // Add detailed logging for debugging
  console.log("User data details:", {
    hasData: !!dataUser,
    hasDataData: !!dataUser?.data,
    userData: dataUser?.data,
    role: dataUser?.data?.role,
    teacherId: dataUser?.data?.teacherId,
    studentId: dataUser?.data?.studentId,
    email: dataUser?.data?.email,
    displayName: dataUser?.data?.displayName,
  });

  // NOW we can have conditional returns after ALL hooks are declared
  // Show loading state while fetching user data
  if (isLoadingUser || isFetchingUser) {
    return (
      <h2 className="text-white text-center mt-8">Loading user data...</h2>
    );
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

  const updateChapterTitle = (chapterId, newTitle) => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === chapterId ? { ...chapter, title: newTitle } : chapter
      )
    );
  };

  const updateLessonTitle = (newTitle) => {
    setActiveLesson({ ...activeLesson, title: newTitle });
  };

  const addNewChapter = () => {
    const newChapter = {
      id: chapters.length + 1,
      title: "باب جديد",
      lessons: [],
    };
    setChapters([...chapters, newChapter]);
  };

  const addNewLesson = (chapterId) => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === chapterId
          ? {
              ...chapter,
              lessons: [
                ...chapter.lessons,
                {
                  id: Date.now(),
                  title: "درس جديد",
                },
              ],
            }
          : chapter
      )
    );
  };

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
                  هنا يمكنك بناء وتعديل كل تفاصيل رحلتك التعليمية.
                </p>
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-green-500 text-white font-bold hover:bg-green-400 transition-colors shadow-lg hover:shadow-green-500/25"
              >
                نشر الكورس
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
              <div className="glass-effect rounded-2xl p-6">
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
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddCourse;
