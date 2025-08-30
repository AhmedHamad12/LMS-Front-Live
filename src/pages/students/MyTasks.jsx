import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";

import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../Components/Loading";

const MyTasks = () => {
  const [filter, setFilter] = useState("new");
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [fileUpload, setFileUpload] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const mainContentRef = useRef(null);

  const [assignments] = useState([
    {
      id: 1,
      course: "الفيزياء الكونية",
      title: "واجب على قانون أوم",
      status: "new",
      due: "يومان",
      score: null,
      instructions:
        "أجب عن الأسئلة 5 و 6 في صفحة 34 من الكتاب المدرسي، وقم برفع صورة للحل.",
    },
    {
      id: 2,
      course: "رياضيات الفضاء",
      title: "تمرين على التفاضل",
      status: "submitted",
      due: null,
      score: null,
    },
    {
      id: 3,
      course: "الكيمياء الفلكية",
      title: "مراجعة على الوحدة الأولى",
      status: "graded",
      due: null,
      score: "95/100",
      points: 150,
    },
    {
      id: 4,
      course: "الفيزياء الحديثة",
      title: "بحث عن نظرية الكم",
      status: "new",
      due: "5 أيام",
      score: null,
      instructions:
        "اكتب مقالًا من 300 كلمة عن أهمية نظرية الكم في التكنولوجيا الحديثة.",
    },
    {
      id: 5,
      course: "الأحياء الفضائية",
      title: "تقرير عن التكيف الحيوي",
      status: "missed",
      due: "فات موعده",
      score: "-50 نقطة",
      points: -50,
    },
  ]);

  const cookies = new Cookies();
  const token = cookies.get("token");

  const getAssignments = async () => {
    return await axios.get(
      `/api/Assignment/GetAssignmentsForStudent?category=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  const { data: userAssignments, isLoading } = useQuery({
    queryKey: ["user-assignments"],
    queryFn: getAssignments,
  });

  console.log(userAssignments);

  const catConvert = (category) => {
    if (category == 1) {
      return "new";
    } else if (category == 2) {
      return "submitted";
    } else if (category == 3) {
      return "graded";
    } else if (category == 4) {
      return "missed";
    }
  };

  const formatted = (newDate) => {
    const date = new Date(newDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", // or "short" or "2-digit"
      day: "2-digit",
    });
  };

  const filteredAssignments = userAssignments?.data?.filter(
    (assignment) =>
      filter === "all" || catConvert(assignment.assignmentCategory) === filter
  );

  const startAssignment = (assignment) => {
    setCurrentAssignment(assignment);
    setShowAssignmentModal(true);
  };

  const submitAssignment = async () => {
    if (currentAssignment) {
      const formData = new FormData();
      formData.append("AssignmentId", currentAssignment.id);
      if (fileUpload) {
        formData.append("Files", fileUpload);
      }
      formData.append("SubmissionComment", textAnswer);
      await axios.post(`/api/SubmitedAssignment/AddSubmitedAssignment`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }).then((res) => {
        console.log(res);
        setShowAssignmentModal(false);
        setTextAnswer("");
        setFileUpload(null);
        setCurrentAssignment(null);
      }).catch((err) => {
        console.log(err);
      });
    };
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFileUpload(file);
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
      antialias: true,
      alpha: true,
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

    // Handle scroll
    const handleScroll = () => {
      if (!mainContentRef.current) return;
      const scrollY = mainContentRef.current.scrollTop;
      const docHeight =
        mainContentRef.current.scrollHeight -
        mainContentRef.current.clientHeight;
      const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;
      camera.position.z = 5 - scrollPercent * 10;
    };

    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener("scroll", handleScroll);
    }

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (mainContent) {
        mainContent.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      new: { text: "جديد", className: "text-yellow-300 bg-yellow-500/20" },
      submitted: {
        text: "تم التسليم",
        className: "text-blue-300 bg-blue-500/20",
      },
      graded: {
        text: "تم التقييم",
        className: "text-green-300 bg-green-500/20",
      },
      missed: { text: "فائتة", className: "text-red-300 bg-red-500/20" },
    };

    const badge = badges[status];
    return (
      <span
        className={`text-xs font-bold px-2 py-1 rounded-full ${badge.className}`}
      >
        {badge.text}
      </span>
    );
  };

  const getButtonForStatus = (assignment) => {
    switch (catConvert(assignment.assignmentCategory)) {
      case "new":
        return (
          <button
            onClick={() => startAssignment(assignment)}
            className="w-full text-center block p-3 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors"
          >
            ابدأ المهمة
          </button>
        );
      case "graded":
        return (
          <button className="w-full text-center block p-3 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors">
            عرض التقييم
          </button>
        );
      default:
        return (
          <button className="w-full text-center block p-3 rounded-lg bg-gray-800 text-gray-400 font-bold cursor-not-allowed">
            مغلق
          </button>
        );
    }
  };

  if (isLoading) {
    return <Loading />
  }

  return (
    <div
      className="text-gray-100 min-h-screen overflow-hidden w-full"
      style={{ fontFamily: "Cairo, sans-serif" }}
      dir="rtl"
    >
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10"
      />

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900/40 to-slate-800/50 backdrop-blur-xl border border-white/5 rounded-2xl w-full max-w-2xl border-cyan-500/20 shadow-2xl shadow-cyan-500/10 flex flex-col max-h-[90vh]">
            <header className="p-4 border-b border-white/10 flex-shrink-0">
              <p className="text-sm font-bold text-cyan-300">
                {currentAssignment?.courseName}
              </p>
              {/* <h2 className="text-2xl font-bold text-white">
                {currentAssignment?.assignmentDescription}
              </h2> */}
            </header>

            <div className="p-6 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-black/20">
              <h3 className="font-bold mb-2">تعليمات المهمة:</h3>
              <p className="text-gray-300 mb-6">
                {currentAssignment?.assignmentDescription}
              </p>

              <h3 className="font-bold mb-2">تسليم إجابتك:</h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="file_upload"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    رفع ملف الحل
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
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
                      <div className="flex text-sm text-gray-400">
                        <label
                          htmlFor="file_upload"
                          className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none"
                        >
                          <span>اضغط للرفع</span>
                          <input
                            id="file_upload"
                            name="file_upload"
                            type="file"
                            onChange={handleFileUpload}
                          />
                        </label>
                        <p className="pr-1">أو قم بسحب الملف وإفلاته هنا</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, PNG, JPG, DOCX up to 10MB
                      </p>
                    </div>
                  </div>
                  {fileUpload && (
                    <p className="text-sm text-green-400 mt-2">
                      تم اختيار الملف: {fileUpload.name}
                    </p>
                  )}
                </div>

                <div className="text-center text-gray-400 text-sm">أو</div>

                <div>
                  <label
                    htmlFor="text_answer"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    كتابة الإجابة مباشرة
                  </label>
                  <textarea
                    id="text_answer"
                    rows={5}
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    className="w-full bg-black/20 rounded-lg p-2 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    placeholder="اكتب إجابتك هنا..."
                  />
                </div>
              </div>
            </div>

            <footer className="p-4 border-t border-white/10 flex-shrink-0 flex justify-end gap-4">
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="px-5 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors text-sm font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={submitAssignment}
                className="px-6 py-2 rounded-lg bg-green-500 text-white hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20 text-sm font-bold"
              >
                تسليم المهمة
              </button>
            </footer>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        {/* Main Content */}
        <main
          ref={mainContentRef}
          className="flex-1 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-black/20"
        >
          <h1
            className="text-4xl font-black text-white mb-2"
            style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
          >
            مركز قيادة المهام
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            جميع واجباتك الحالية والمنجزة في مكان واحد.
          </p>

          {/* Filter Buttons */}
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <button
              onClick={() => setFilter("new")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                filter === "new"
                  ? "bg-cyan-500 text-black"
                  : "bg-white/10 text-white"
              }`}
            >
              مهام جديدة
            </button>
            <button
              onClick={() => setFilter("submitted")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                filter === "submitted"
                  ? "bg-cyan-500 text-black"
                  : "bg-white/10 text-white"
              }`}
            >
              بانتظار التقييم
            </button>
            <button
              onClick={() => setFilter("graded")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                filter === "graded"
                  ? "bg-cyan-500 text-black"
                  : "bg-white/10 text-white"
              }`}
            >
              مهام منجزة
            </button>
            <button
              onClick={() => setFilter("missed")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                filter === "missed"
                  ? "bg-cyan-500 text-black"
                  : "bg-white/10 text-white"
              }`}
            >
              مهام فائتة
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                filter === "all"
                  ? "bg-cyan-500 text-black"
                  : "bg-white/10 text-white"
              }`}
            >
              الكل
            </button>
          </div>

          {/* Assignments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredAssignments?.map((assignment, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br from-slate-900/40 to-slate-800/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col justify-between transform hover:-translate-y-2 transition-transform duration-300 ${
                  catConvert(assignment.assignmentCategory) === "missed"
                    ? "border-red-500/50"
                    : ""
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-cyan-300">
                        {assignment.courseName}
                      </p>
                      <h3 className="text-xl font-bold text-white mb-4">
                        {assignment.assignmentDescription}
                      </h3>
                    </div>
                    {getStatusBadge(catConvert(assignment.assignmentCategory))}
                  </div>

                  {catConvert(assignment.assignmentCategory) === "new" && (
                    <div className="text-sm text-yellow-400 flex items-center gap-2 mb-6">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        الموعد النهائي للتسليم:{" "}
                        <span className="font-bold">
                          {formatted(assignment.dueDate)}
                        </span>
                      </span>
                    </div>
                  )}

                  {(catConvert(assignment.assignmentCategory) === "graded" ||
                    catConvert(assignment.assignmentCategory) === "missed") && (
                    <div className="bg-gradient-to-br from-slate-900/40 to-slate-800/50 backdrop-blur-xl border border-white/5 rounded-lg p-3 text-center mb-6">
                      <p className="text-sm text-gray-300">
                        {catConvert(assignment.assignmentCategory) === "graded"
                          ? "النتيجة"
                          : "العقوبة"}
                      </p>
                      {/* <p
                        className={`text-2xl font-black ${
                          catConvert(assignment.assignmentCategory) === "graded"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {assignment.score}
                      </p> */}
                      {/* {catConvert(assignment.assignmentCategory) === "graded" && assignment.points && (
                        <p className="text-xs text-green-400">
                          +{assignment.points} نقطة
                        </p>
                      )} */}
                    </div>
                  )}

                  {catConvert(assignment.assignmentCategory) ===
                    "submitted" && (
                    <div className="text-sm text-center text-gray-400 mb-6 py-8">
                      <p>تم تسليم المهمة بنجاح، في انتظار تقييم القائد.</p>
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  <a
                    href={assignment.files}
                    target="_blank"
                    className="w-full text-center block p-3 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors"
                  >
                    عرض الواجب
                  </a>
                </div>

                {getButtonForStatus(assignment)}
              </div>
            ))}

            {/* No results message */}
            {filteredAssignments?.length === 0 && (
              <div className="md:col-span-2 xl:col-span-3 text-center py-16">
                <svg
                  className="w-16 h-16 mx-auto text-gray-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                <h3 className="text-xl font-bold text-white">
                  لا توجد مهام في هذا التصنيف
                </h3>
                <p className="text-gray-400">يبدو أنك أنجزت كل شيء هنا!</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyTasks;
