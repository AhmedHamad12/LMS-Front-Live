import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import * as THREE from "three";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Cookies } from "react-cookie";

const AddLesson = () => {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();

  console.log(courseId, chapterId);

  // Validate URL parameters
  // useEffect(() => {
  //   if (!courseId || !chapterId) {
  //     console.error("Missing required URL parameters:", {
  //       courseId,
  //       chapterId,
  //     });
  //     navigate("/teacher/courses");
  //     return;
  //   }

  // Validate that parameters are numeric
  //   if (isNaN(Number(courseId)) || isNaN(Number(chapterId))) {
  //     console.error("Invalid URL parameters - must be numeric:", {
  //       courseId,
  //       chapterId,
  //     });
  //     navigate("/teacher/courses");
  //     return;
  //   }

  //   console.log("URL Parameters:", { courseId, chapterId });
  // }, [courseId, chapterId, navigate]);

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

  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const starFieldsRef = useRef([]);

  // const fetchUserData = () => {
  //   const cookies = new Cookies();
  //   const token = cookies.get("token");

  //   if (!token) {
  //     throw new Error("No authentication token found");
  //   }

  //   return axios
  //     .get("http://lms278.runasp.net/api/Account/GetCurrentUser", {
  //       headers: {
  //         accept: "text/plain",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .catch((error) => {
  //       console.error("User data fetch error:", error);

  //       if (error.response?.status === 403) {
  //         console.log(
  //           "403 Forbidden - trying to get user data from alternative endpoint..."
  //         );

  //         return axios
  //           .get("http://lms278.runasp.net/api/Account/GetUser", {
  //             headers: {
  //               accept: "text/plain",
  //               Authorization: `Bearer ${token}`,
  //             },
  //           })
  //           .catch((altError) => {
  //             console.error("Alternative user endpoint also failed:", altError);

  //             console.log("Returning mock user data");
  //             return {
  //               data: {
  //                 displayName: "Teacher",
  //                 email: "teacher@example.com",
  //                 role: "Teacher",
  //                 teacherId: null,
  //                 studentId: null,
  //                 isMock: true,
  //               },
  //             };
  //           });
  //       }

  //       throw error;
  //     });
  // };

  // const fetchChapterData = () => {
  //   const cookies = new Cookies();
  //   const token = cookies.get("token");

  //   if (!token) {
  //     throw new Error("No authentication token found");
  //   }

  //   if (!chapterId || isNaN(Number(chapterId))) {
  //     throw new Error("Invalid chapter ID");
  //   }

  //   console.log("Fetching chapter data for chapterId:", chapterId);

  //   return axios
  //     .get(`http://lms278.runasp.net/api/CourseUnit/unit/${chapterId}`, {
  //       headers: {
  //         accept: "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .then((response) => {
  //       console.log("Chapter data fetched successfully:", response.data);
  //       return response;
  //     })
  //     .catch((error) => {
  //       console.error("Chapter data fetch error:", error);
  //       if (error.response) {
  //         console.error("Response status:", error.response.status);
  //         console.error("Response data:", error.response.data);
  //       }
  //       throw error;
  //     });
  // };

  // const fetchLessonData = () => {
  //   const cookies = new Cookies();
  //   const token = cookies.get("token");

  //   if (!token) {
  //     throw new Error("No authentication token found");
  //   }

  //   if (!chapterId || isNaN(Number(chapterId))) {
  //     throw new Error("Invalid chapter ID");
  //   }

  //   console.log("Fetching lesson data for chapterId:", chapterId);

  //   return axios
  //     .get(`http://lms278.runasp.net/api/Lesson/unit/${chapterId}`, {
  //       headers: {
  //         accept: "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .then((response) => {
  //       console.log("Lesson data fetched successfully:", response.data);
  //       return response;
  //     })
  //     .catch((error) => {
  //       console.log("First lesson endpoint failed, trying alternative...");
  //       console.error("Error details:", error.response?.data);

  //       if (!courseId || isNaN(Number(courseId))) {
  //         throw new Error("Invalid course ID for fallback");
  //       }

  //       return axios.get(
  //         `http://lms278.runasp.net/api/Lesson/course/${courseId}`,
  //         {
  //           headers: {
  //             accept: "application/json",
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  //     })
  //     .catch((error) => {
  //       console.log("All lesson endpoints failed, returning empty array");
  //       console.error("Final error:", error.response?.data);
  //       return { data: [] };
  //     });
  // };

  // // Fixed uploadLesson function with better parameter validation
  // const uploadLesson = async () => {
  //   const cookies = new Cookies();
  //   const token = cookies.get("token");

  //   if (!token) {
  //     throw new Error("No authentication token found");
  //   }

  //   // Validate URL parameters
  //   if (!chapterId || isNaN(Number(chapterId))) {
  //     throw new Error("Invalid chapter ID. Please check the URL parameters.");
  //   }

  //   // Validate required fields
  //   if (!title || !content) {
  //     throw new Error("Please fill in all required fields: title and content.");
  //   }

  //   if (!lessonImage || !videoFile) {
  //     throw new Error("Please upload both lesson image and video file.");
  //   }

  //   // Create FormData with correct field names based on the API
  //   const formData = new FormData();

  //   // Use the exact field names from the API documentation
  //   formData.append("Title", title);
  //   formData.append("Content", content);
  //   formData.append("VideoFile", videoFile);
  //   formData.append("LessonImage", lessonImage);
  //   formData.append("CourseUnitId", parseInt(chapterId)); // Ensure it's an integer
  //   formData.append("IsFreePreview", isFreePreview);

  //   // Optional fields - only add if they exist
  //   if (pdfFile) {
  //     formData.append("PdfFile", pdfFile);
  //   }

  //   if (thumbnailFile) {
  //     formData.append("ThumbnailFile", thumbnailFile);
  //   }

  //   console.log("Sending lesson data:", {
  //     Title: title,
  //     Content: content,
  //     CourseUnitId: parseInt(chapterId),
  //     IsFreePreview: isFreePreview,
  //     hasImage: !!lessonImage,
  //     hasVideo: !!videoFile,
  //     hasPdf: !!pdfFile,
  //     hasThumbnail: !!thumbnailFile,
  //   });

  //   // Log FormData entries for debugging
  //   console.log("FormData entries:");
  //   for (let pair of formData.entries()) {
  //     console.log(
  //       pair[0] +
  //         ": " +
  //         (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1])
  //     );
  //   }

  //   return axios
  //     .post("http://lms278.runasp.net/api/Lesson", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .then((response) => {
  //       console.log("Lesson API Response:", response);
  //       console.log("Response data:", response.data);
  //       return response;
  //     })
  //     .catch((error) => {
  //       console.error("Lesson API Error:", error);
  //       console.error("Error response:", error.response?.data);

  //       // Log the specific validation errors if they exist
  //       if (error.response?.data?.errors) {
  //         console.error("Validation errors:", error.response.data.errors);
  //         console.error(
  //           "Full validation error object:",
  //           JSON.stringify(error.response.data.errors, null, 2)
  //         );
  //       }

  //       // Also log the request data that was sent
  //       console.error("Request data that was sent:", {
  //         formDataEntries: Array.from(formData.entries()),
  //       });

  //       throw error;
  //     });
  // };

  // // useQuery hooks with better error handling and parameter validation
  // const {
  //   isLoading: isLoadingUser,
  //   data: dataUser,
  //   isError: isErrorUser,
  //   error: errorUser,
  //   isFetching: isFetchingUser,
  //   refetch: refetchUser,
  // } = useQuery({
  //   queryKey: ["user-data"],
  //   queryFn: fetchUserData,
  //   retry: (failureCount, error) => {
  //     if (error.response?.status === 403 && failureCount < 3) {
  //       console.log(
  //         `Retrying user data fetch (attempt ${
  //           failureCount + 1
  //         }/3) due to 403 error...`
  //       );
  //       return true;
  //     }
  //     return false;
  //   },
  //   retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  // });

  // const {
  //   isLoading: isLoadingChapter,
  //   data: dataChapter,
  //   isError: isErrorChapter,
  //   error: errorChapter,
  //   isFetching: isFetchingChapter,
  //   refetch: refetchChapter,
  // } = useQuery({
  //   queryKey: ["chapter-data", chapterId],
  //   queryFn: fetchChapterData,
  //   enabled: !!(chapterId && !isNaN(Number(chapterId))), // Only run if chapterId is valid
  //   retry: (failureCount, error) => {
  //     // Don't retry on 404 errors - likely means the chapter doesn't exist
  //     if (error.response?.status === 404) {
  //       return false;
  //     }
  //     return failureCount < 2;
  //   },
  //   retryDelay: 1000,
  // });

  // const {
  //   isLoading: isLoadingLesson,
  //   data: dataLesson,
  //   isError: isErrorLesson,
  //   error: errorLesson,
  //   isFetching: isFetchingLesson,
  //   refetch: refetchLesson,
  // } = useQuery({
  //   queryKey: ["lesson-data", chapterId, courseId],
  //   queryFn: fetchLessonData,
  //   enabled: !!(
  //     chapterId &&
  //     !isNaN(Number(chapterId)) &&
  //     courseId &&
  //     !isNaN(Number(courseId))
  //   ), // Only run if parameters are valid
  //   retry: 1,
  //   retryDelay: 1000,
  // });

  // const {
  //   isLoading: isLoadingLessonSubmit,
  //   data: dataLessonSubmit,
  //   isError: isErrorLessonSubmit,
  //   error: errorLessonSubmit,
  //   isFetching: isFetchingLessonSubmit,
  //   refetch: refetchLessonSubmit,
  // } = useQuery({
  //   queryKey: ["add-lesson"],
  //   queryFn: uploadLesson,
  //   enabled: false, // Disable automatic execution, only run when manually triggered
  // });

  const cookies = new Cookies();
  const token = cookies.get("token");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lessonImage, setLessonImage] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const addLesson = async () => {
    const formData = new FormData();

    if (thumbnailFile) formData.append("ThumbnailFile", thumbnailFile);
    formData.append("Title", title);
    formData.append("Content", content);
    formData.append("VideoFile", videoFile);
    formData.append("LessonImage", lessonImage);
    formData.append("PdfFile", pdfFile);
    formData.append("CourseUnitId", chapterId);
    formData.append("CourseId", chapterId);
    formData.append("IsFreePreview", isFreePreview);
    try {
      setLoading(true);
      const data = await axios.post(
        "http://lms278.runasp.net/api/Lesson",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Lesson added successfully:", data);
    } catch (error) {
      console.error("Error uploading lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  // Three.js setup
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
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

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

    const starsFar = createStarfield(8000, 0.05, 0x888888);
    const starsMid = createStarfield(5000, 0.1, 0xbbbbbb);
    const starsClose = createStarfield(1500, 0.15, 0xffffff);

    starFieldsRef.current = [starsFar, starsMid, starsClose];

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

  const handleSubmit = (e) => {
    e.preventDefault();
    addLesson();
  };

  // // Show loading state while fetching user data
  // if (isLoadingUser || isFetchingUser) {
  //   return (
  //     <h2 className="text-white text-center mt-8">Loading user data...</h2>
  //   );
  // }

  // // Show error state if user data fetch fails
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

  // // Show warning if using mock user data
  // if (dataUser?.data?.isMock) {
  //   return (
  //     <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center">
  //       <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-xl max-w-md mx-4">
  //         <div className="text-center">
  //           <div className="text-6xl mb-4">⚠️</div>
  //           <h2 className="text-2xl font-bold text-white mb-4">
  //             مشكلة في الوصول لبيانات المستخدم
  //           </h2>
  //           <p className="text-gray-400 mb-6">
  //             لا يمكن الوصول لبيانات المستخدم. قد تكون هناك مشكلة في الصلاحيات
  //             أو الجلسة منتهية.
  //           </p>
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

  // // Show warning if teacher profile is incomplete
  // if (dataUser?.data?.role === "Teacher" && !dataUser?.data?.teacherId) {
  //   return (
  //     <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center">
  //       <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-xl max-w-md mx-4">
  //         <div className="text-center">
  //           <div className="text-6xl mb-4">⚠️</div>
  //           <h2 className="text-2xl font-bold text-white mb-4">
  //             ملف المدرس غير مكتمل
  //           </h2>
  //           <p className="text-gray-400 mb-6">
  //             يبدو أن ملف المدرس الخاص بك غير مكتمل. يجب عليك إكمال ملف المدرس
  //             قبل إنشاء الدروس.
  //           </p>
  //           <div className="space-y-3">
  //             <Link
  //               to="/add-teacher"
  //               className="inline-block px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-400 transition-colors"
  //             >
  //               إكمال ملف المدرس
  //             </Link>
  //             <button
  //               onClick={() => refetchUser()}
  //               className="block w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors"
  //             >
  //               إعادة تحميل البيانات
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // // Show error if URL parameters are invalid
  // if (
  //   !courseId ||
  //   !chapterId ||
  //   isNaN(Number(courseId)) ||
  //   isNaN(Number(chapterId))
  // ) {
  //   return (
  //     <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center">
  //       <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-xl max-w-md mx-4">
  //         <div className="text-center">
  //           <div className="text-6xl mb-4">❌</div>
  //           <h2 className="text-2xl font-bold text-white mb-4">
  //             معاملات URL غير صحيحة
  //           </h2>
  //           <p className="text-gray-400 mb-6">
  //             معرف الكورس أو الفصل غير صحيح. يرجى التحقق من الرابط والمحاولة مرة
  //             أخرى.
  //           </p>
  //           <div className="space-y-3">
  //             <Link
  //               to="/teacher/courses"
  //               className="inline-block px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-400 transition-colors"
  //             >
  //               العودة للكورسات
  //             </Link>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // const updateChapterTitle = (chapterId, newTitle) => {
  //   setChapters(
  //     chapters.map((chapter) =>
  //       chapter.id === chapterId ? { ...chapter, title: newTitle } : chapter
  //     )
  //   );
  // };

  // const updateLessonTitle = (newTitle) => {
  //   setActiveLesson({ ...activeLesson, title: newTitle });
  // };

  // const addNewChapter = () => {
  //   const newChapter = {
  //     id: chapters.length + 1,
  //     title: "باب جديد",
  //     lessons: [],
  //   };
  //   setChapters([...chapters, newChapter]);
  // };

  // const addNewLesson = (chapterId) => {
  //   setChapters(
  //     chapters.map((chapter) =>
  //       chapter.id === chapterId
  //         ? {
  //             ...chapter,
  //             lessons: [
  //               ...chapter.lessons,
  //               {
  //                 id: Date.now(),
  //                 title: "درس جديد",
  //               },
  //             ],
  //           }
  //         : chapter
  //     )
  //   );
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center">
        <div className="text-2xl text-white">جارٍ إضافة الدرس...</div>
      </div>
    );
  }

  return (
    <div
      className="text-gray-100 font-[Cairo] h-screen overflow-hidden w-full"
      dir="rtl"
    >
      {/* Background Canvas */}
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
                  إضافة درس جديد
                </h1>
                <p className="text-gray-400 text-lg">
                  أضف درساً جديداً للفصل الخاص بك.
                </p>
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-green-500 text-white font-bold hover:bg-green-400 transition-colors shadow-lg hover:shadow-green-500/25"
              >
                إضافة الدرس
              </button>
            </header>

            <div className="space-y-6">
              <div className="glass-effect rounded-2xl p-6">
                <label className="block text-lg font-bold text-white mb-3">
                  عنوان الدرس *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="أدخل عنوان الدرس"
                  className="w-full p-3 rounded-lg text-lg bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:bg-black/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all"
                />
              </div>

              <div className="glass-effect rounded-2xl p-6">
                <label className="block text-lg font-bold text-white mb-3">
                  محتوى الدرس *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder="أدخل محتوى ووصف الدرس"
                  rows={4}
                  className="w-full p-3 rounded-lg text-lg bg-black/20 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:bg-black/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,191,255,0.3)] transition-all"
                />
              </div>

              <div className="glass-effect rounded-2xl p-6">
                <label className="block text-lg font-bold text-white mb-3">
                  صورة الدرس *
                </label>
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
                        <span>اختر صورة الدرس</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setLessonImage(e.target.files[0])}
                          required
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                    {lessonImage && (
                      <p className="text-sm text-green-400">
                        تم اختيار: {lessonImage.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-2xl p-6">
                <label className="block text-lg font-bold text-white mb-3">
                  فيديو الدرس *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-dashed border-gray-600 rounded-lg hover:border-cyan-500 transition-colors">
                  <div className="space-y-2 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <div className="flex text-sm text-gray-400 justify-center">
                      <label className="relative cursor-pointer bg-gray-800/50 rounded-md px-3 py-1 font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                        <span>اختر فيديو الدرس</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setVideoFile(e.target.files[0])}
                          required
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">MP4, MOV up to 1GB</p>
                    {videoFile && (
                      <p className="text-sm text-green-400">
                        تم اختيار: {videoFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-effect rounded-2xl p-6">
                  <label className="block text-lg font-bold text-white mb-3">
                    ملخص الدرس (PDF)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-400 transition-colors">
                    <div className="space-y-2 text-center">
                      <svg
                        className="mx-auto h-8 w-8 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                      <label className="cursor-pointer text-purple-400 hover:text-purple-300 text-sm">
                        <span>اختر ملف PDF</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => setPdfFile(e.target.files[0])}
                          className="sr-only"
                        />
                      </label>
                      {pdfFile && (
                        <p className="text-xs text-green-400">
                          تم اختيار: {pdfFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-2xl p-6">
                  <label className="block text-lg font-bold text-white mb-3">
                    صورة مصغرة (اختياري)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-orange-400 transition-colors">
                    <div className="space-y-2 text-center">
                      <svg
                        className="mx-auto h-8 w-8 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <label className="cursor-pointer text-orange-400 hover:text-orange-300 text-sm">
                        <span>اختر صورة مصغرة</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setThumbnailFile(e.target.files[0])}
                          className="sr-only"
                        />
                      </label>
                      {thumbnailFile && (
                        <p className="text-xs text-green-400">
                          تم اختيار: {thumbnailFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-2xl p-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="freePreview"
                    checked={isFreePreview}
                    onChange={(e) => setIsFreePreview(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                  />
                  <label
                    htmlFor="freePreview"
                    className="text-lg font-bold text-white cursor-pointer"
                  >
                    معاينة مجانية للدرس
                  </label>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  إذا تم تفعيل هذا الخيار، سيتمكن الطلاب من مشاهدة هذا الدرس
                  مجاناً كمعاينة للكورس
                </p>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddLesson;
