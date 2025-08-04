import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Cookies } from 'react-cookie';

const AddChapter = () => {
  const { courseId } = useParams(); // Get courseId from URL parameters
  // const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState({
    id: 1,
    title: 'الدرس الأول: التيار الكهربي'
  });
  const [chapters, setChapters] = useState([
    {
      id: 1,
      title: 'الباب الأول: الكهربية التياريه',
      lessons: [
        { id: 1, title: 'الدرس الأول: التيار الكهربي' }
      ]
    }
  ]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseUnitImage, setCourseUnitImage] = useState(null);
  const [durationInMinutes, setDurationInMinutes] = useState(60);

  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const starFieldsRef = useRef([]);

  const fetchData = () => {
    const cookies = new Cookies();
    const token = cookies.get("token");

    return axios
      .get(
        "https://api.elmohdra.com/api/Account/GetCurrentUser",
        {
          headers: {
            'accept': 'text/plain',
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .catch(error => {
        console.error("User data fetch error:", error);

        // If we get a 403 error, it might be a permission issue
        if (error.response?.status === 403) {
          console.log("403 Forbidden - trying to get user data from alternative endpoint...");

          // Try alternative endpoint
          return axios.get(
            "http://lms278.runasp.net/api/Account/GetUser",
            {
              headers: {
                'accept': 'text/plain',
                Authorization: `Bearer ${token}`,
              },
            },
          ).catch(altError => {
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
                isMock: true // Flag to indicate this is mock data
              }
            };
          });
        }

        // For other errors, re-throw
        throw error;
      });
  };

  const fetchCourseData = () => {
    const cookies = new Cookies();
    const token = cookies.get("token");

    return axios
      .get(
        `http://lms278.runasp.net/api/Course/course/${courseId}`,
        {
          headers: {
            'accept': 'text/plain',
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .catch(error => {
        console.error("User data fetch error:", error);

        // If we get a 403 error, it might be a permission issue
        if (error.response?.status === 403) {
          console.log("403 Forbidden - trying to get user data from alternative endpoint...");

          // Try alternative endpoint
          return axios.get(
            "http://lms278.runasp.net/api/Account/GetUser",
            {
              headers: {
                'accept': 'text/plain',
                Authorization: `Bearer ${token}`,
              },
            },
          ).catch(altError => {
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
                isMock: true // Flag to indicate this is mock data
              }
            };
          });
        }

        // For other errors, re-throw
        throw error;
      });
  };

  // Move uploadCourse function inside component
  const uploadChapter = async () => {
    const cookies = new Cookies();
    const token = cookies.get("token");

    // First, try to get teacherId from user data
    let teacherId = dataUser?.data?.teacherId;

    // If teacherId is null, try to get it from the token or make an additional API call
    if (!teacherId) {
      console.log("Teacher ID is null, attempting to get teacher information...");

      try {
        // Try to get teacher information from a different endpoint
        const teacherResponse = await axios.get(
          "http://lms278.runasp.net/api/Teacher/GetCurrentTeacher",
          {
            headers: {
              'accept': 'text/plain',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (teacherResponse.data?.id) {
          teacherId = teacherResponse.data.id;
          console.log("Found teacher ID from GetCurrentTeacher:", teacherId);
        } else {
          // If that doesn't work, try to decode the JWT token to get user ID
          const tokenParts = token.split('.');
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
          console.log("Trying to use email as teacher identifier:", dataUser.data.email);
          teacherId = dataUser.data.email;
        }
      }
    }

    // If we still don't have teacherId, throw an error
    if (!teacherId) {
      throw new Error("Teacher ID not available. Please complete your teacher profile first.");
    }

    if (!title || !description ) {
      throw new Error("Please fill in all required fields: title, description, and study year.");
    }

    // Create FormData exactly as the backend expects
    const formData = new FormData();
    formData.append("CourseId", courseId);
    formData.append("Title", title);
    formData.append("Description", description);
    // formData.append("courseUnitImage", courseImage);
    formData.append("durationInMinutes", durationInMinutes);
    

    // Only add image if it exists
    if (courseUnitImage) {
      formData.append("CourseUnitImage", courseUnitImage);
    }

    console.log("Sending course data:", {
      Title: title,
      Description: description,
      // Price: parseFloat(price),
      // TeacherId: parseInt(teacherId),
      // StudyYear: parseInt(studyYear),
      // hasImage: !!courseImage
    });

    return axios
      .post(
        "http://lms278.runasp.net/api/CourseUnit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then(response => {
        console.log("API Response:", response);
        console.log("Response data:", response.data);
        return response;
      })
      .catch(error => {
        console.error("API Error:", error);
        console.error("Error response:", error.response?.data);

        // Log the specific validation errors if they exist
        if (error.response?.data?.errors) {
          console.error("Validation errors:", error.response.data.errors);
          console.error("Full validation error object:", JSON.stringify(error.response.data.errors, null, 2));
        }

        // Also log the request data that was sent
        console.error("Request data that was sent:", {
          formDataEntries: Array.from(formData.entries())
        });

        throw error;
      });
  };
  const navigate = useNavigate();


  // Move useQuery hooks inside component
  const { isLoading: isLoadingUser, data: dataUser, isError: isErrorUser, error: errorUser, isFetching: isFetchingUser, refetch: refetchUser } = useQuery({
    queryKey: ["user-data"],
    queryFn: fetchData,
    retry: (failureCount, error) => {
      // Retry up to 3 times, but only for 403 errors
      if (error.response?.status === 403 && failureCount < 3) {
        console.log(`Retrying user data fetch (attempt ${failureCount + 1}/3) due to 403 error...`);
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

  const { isLoading: isLoadingCourse, data: dataCourse, isError: isErrorCourse, error: errorCourse, isFetching: isFetchingCourse, refetch: refetchCourse } = useQuery({
    queryKey: ["add-course"],
    queryFn: uploadChapter,
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

  // Three.js setup
  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true
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
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
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
      const docHeight = mainContentRef.current.scrollHeight - mainContentRef.current.clientHeight;
      const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;

      cameraRef.current.position.z = 5 - scrollPercent * 10;
    };

    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
      return () => mainContent.removeEventListener('scroll', handleScroll);
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

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuOpen && !e.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Submitting course unit...");
      const result = await uploadChapter(); // Use refetch instead of direct function call
      console.log("Course unit submission result:", result);

      if (result.data) {
        alert("Course unit created successfully!");
        // Optionally redirect or clear form

        navigate(`/teacher/addlesson/${courseId}/${result.data.id}`);
      }
    } catch (error) {
      console.error("Course unit submission error:", error);
      alert(`Error creating course unit: ${error.message}`);
    }
  };

  console.log(dataUser);
  console.log(dataCourse);
  // console.log(dataCourseUnit);

  // Add detailed logging for debugging
  console.log("User data details:", {
    hasData: !!dataUser,
    hasDataData: !!dataUser?.data,
    userData: dataUser?.data,
    role: dataUser?.data?.role,
    teacherId: dataUser?.data?.teacherId,
    studentId: dataUser?.data?.studentId,
    email: dataUser?.data?.email,
    displayName: dataUser?.data?.displayName
  });

  console.log("Course data details:", {
    hasData: !!dataCourse,
    hasDataData: !!dataCourse?.data,
    courseData: dataCourse?.data,
    courseId: dataCourse?.data?.id,
    title: dataCourse?.data?.title,
    isMock: dataCourse?.data?.isMock
  });

  // Show loading state while fetching user data
  if (isLoadingUser || isFetchingUser) {
    return <h2 className="text-white text-center mt-8">Loading user data...</h2>;
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
            <p className="text-gray-400 mb-6">
              {errorMessage}
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

  // Show warning if using mock user data
  if (dataUser?.data?.isMock) {
    return (
      <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center">
        <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-xl max-w-md mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">مشكلة في الوصول لبيانات المستخدم</h2>
            <p className="text-gray-400 mb-6">
              لا يمكن الوصول لبيانات المستخدم. قد تكون هناك مشكلة في الصلاحيات أو الجلسة منتهية.
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
            <h2 className="text-2xl font-bold text-white mb-4">ملف المدرس غير مكتمل</h2>
            <p className="text-gray-400 mb-6">
              يبدو أن ملف المدرس الخاص بك غير مكتمل. يجب عليك إكمال ملف المدرس قبل إنشاء الفصول.
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

  // Show loading state while fetching course data
  if (isLoadingCourse || isFetchingCourse) {
    return <h2 className="text-white text-center mt-8">Loading course data...</h2>;
  }

  // Show error state if course data fetch fails
  if (isErrorCourse) {
    const is403Error = errorCourse?.response?.status === 403;
    const is404Error = errorCourse?.response?.status === 404;

    let errorMessage;
    if (is403Error) {
      errorMessage = "لا يمكن الوصول للكورس. قد تكون هناك مشكلة في الصلاحيات أو الكورس لم يتم ربطه بالمدرس بعد.";
    } else if (is404Error) {
      errorMessage = "الكورس غير موجود أو تم حذفه. يرجى التحقق من معرف الكورس.";
    } else {
      errorMessage = `Error loading course data: ${errorCourse.message}`;
    }

    return (
      <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center">
        <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-xl max-w-md mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {is403Error ? "مشكلة في الصلاحيات" : is404Error ? "الكورس غير موجود" : "خطأ في تحميل البيانات"}
            </h2>
            <p className="text-gray-400 mb-6">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <Link
                to="/teacher/courses"
                className="inline-block px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-400 transition-colors"
              >
                العودة للكورسات
              </Link>
              <button
                onClick={() => refetchCourse()}
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

  // Show warning if using mock course data
  if (dataCourse?.data?.isMock) {
    return (
      <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center">
        <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-xl max-w-md mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">مشكلة في الوصول للكورس</h2>
            <p className="text-gray-400 mb-6">
              لا يمكن الوصول لبيانات الكورس. قد تكون هناك مشكلة في الصلاحيات أو الكورس غير موجود.
            </p>
            <div className="space-y-3">
              <Link
                to="/teacher/courses"
                className="inline-block px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-400 transition-colors"
              >
                العودة للكورسات
              </Link>
              <button
                onClick={() => refetchCourse()}
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

  // Show message if course was just created and might need time to be accessible
  const isRecentlyCreated = sessionStorage.getItem(`course-${courseId}-created`);
  if (isRecentlyCreated && isErrorCourse && errorCourse?.response?.status === 403) {
    return (
      <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center">
        <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-xl max-w-md mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-white mb-4">الكورس قيد المعالجة</h2>
            <p className="text-gray-400 mb-6">
              تم إنشاء الكورس بنجاح! يرجى الانتظار قليلاً حتى يتم ربط الكورس بحسابك.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  sessionStorage.removeItem(`course-${courseId}-created`);
                  refetchCourse();
                }}
                className="inline-block px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-400 transition-colors"
              >
                إعادة المحاولة
              </button>
              <Link
                to="/teacher/courses"
                className="block w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors"
              >
                العودة للكورسات
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // const updateChapterTitle = (chapterId, newTitle) => {
  //   setChapters(chapters.map(chapter =>
  //     chapter.id === chapterId
  //       ? { ...chapter, title: newTitle }
  //       : chapter
  //   ));
  // };

  // const updateLessonTitle = (newTitle) => {
  //   setActiveLesson({ ...activeLesson, title: newTitle });
  // };

  // const addNewChapter = () => {
  //   const newChapter = {
  //     id: chapters.length + 1,
  //     title: 'باب جديد',
  //     lessons: []
  //   };
  //   setChapters([...chapters, newChapter]);
  // };

  // const addNewLesson = (chapterId) => {
  //   setChapters(chapters.map(chapter =>
  //     chapter.id === chapterId
  //       ? {
  //         ...chapter,
  //         lessons: [...chapter.lessons, {
  //           id: Date.now(),
  //           title: 'درس جديد'
  //         }]
  //       }
  //       : chapter
  //   ));
  // };

  return (
    <div className="min-h-screen text-gray-100 overflow-hidden relative">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      <div className="relative z-10 flex h-screen">

        {/* Main Content */}
        <form onSubmit={handleSubmit} ref={mainContentRef} className="flex-1 flex flex-col p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-transparent">
          <header className="flex-shrink-0 flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-black text-white text-cyan-400 drop-shadow-lg">إضافة فصل جديد</h1>
              <p className="text-gray-400 text-lg mt-2">أضف فصول جديدة للكورس الخاص بك.</p>
            </div>
            <button type='submit' className="px-6 py-3 rounded-lg bg-green-500 text-white font-bold hover:bg-green-400 transition-colors shadow-lg hover:shadow-green-500/25">
              إضافة الفصل
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
            {/* Content Editor */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                <label className="block text-lg font-bold text-white mb-3">عنوان الفصل</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="أدخل عنوان الفصل"
                  className="w-full p-3 rounded-lg text-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                <label className="block text-lg font-bold text-white mb-3">وصف الفصل</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="أدخل وصف الفصل"
                  rows={4}
                  className="w-full p-3 rounded-lg text-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">ارفق صورة للفصل</h3>
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
                          onChange={(e) => setCourseUnitImage(e.target.files[0])}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                <label className="block text-lg font-bold text-white mb-3">مدة الفصل (بالدقائق)</label>
                <input
                  type="number"
                  value={durationInMinutes}
                  onChange={(e) => setDurationInMinutes(e.target.value)}
                  required
                  min="1"
                  max="480"
                  placeholder="أدخل مدة الفصل بالدقائق"
                  className="w-full p-3 rounded-lg text-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Course Structure */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-2xl font-bold text-white">إضافة فصل جديد</h2>
              <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 space-y-3 shadow-xl">
                <p className='bg-gray-800/50  border border-gray-800/50 rounded-2xl p-4'>من خلال هذه الصفحة، يمكنك إضافة فصول جديدة للكورس الخاص بك. كل فصل يحتوي على مجموعة من الدروس والمحتوى التعليمي. قم بإدخال عنوان الفصل ووصفه ومدة الدراسة المطلوبة، ويمكنك أيضاً إرفاق صورة توضيحية للفصل.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChapter;