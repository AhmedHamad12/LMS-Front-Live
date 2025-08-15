import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import React, { useState, useEffect, useRef } from "react";
import { Cookies } from "react-cookie";
import { Link, useParams } from "react-router-dom";
import * as THREE from "three";

export default function CourseManagement() {
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

  const updateChapterTitle = (chapterId, newTitle) => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === chapterId ? { ...chapter, title: newTitle } : chapter
      )
    );
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

  const { courseId } = useParams();
  const cookies = new Cookies();
  const token = cookies.get("token");

  const fetchCourse = () => {
    return axios
      .get(`/api/teacher/courses/${courseId}/full`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const { data: courses } = useQuery({
    queryKey: ["get-courses"],
    queryFn: fetchCourse,
  });

  console.log(courses);

  // const unitId = courseUnit?.data?.id;

  // const getLessons = (unitId) => {
  //   return axios
  //     .get(`http://lms278.runasp.net/api/Lesson/unit/${unitId}`, {
  //       headers: {
  //         accept: "/",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .catch((error) => {
  //       console.error("User data fetch error:", error);
  //     });
  // };

  // const { data: lessons } = useQuery({
  //   queryKey: ["lessons", unitId],
  //   queryFn: () => getLessons(unitId),
  //   enabled: !!unitId, // only after the teacherID has been retrieved fetch the details
  // });

  // console.log(courseUnit);
  // console.log(lessons);

  const formatted = (newDate) => {
    const date = new Date(newDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", // or "short" or "2-digit"
      day: "2-digit",
    });
  };

  return (
    <div className="bg-black text-gray-100 pt-10 px-6">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      <div>
        <div className="text-center mb-10">
          <div>
            <p className="text-4xl font-black mb-2">
              {courses?.data.course.title}
            </p>
          </div>
          <div className="flex text-sm justify-center gap-8 text-yellow-400 mb-2">
            <p>{formatted(courses?.data.course.createdAt)}</p>
            <p>{courses?.data.course.price} L.E</p>
          </div>
          <p>{courses?.data.course.description}</p>
        </div>
      </div>
      <div>
        {courses?.data.units.map((item) => (
          <div
            key={item.id}
            className="mb-5 bg-[#05050d] py-4 px-6 border border-cyan-400/30 rounded-md"
          >
            <div className="">
              <p className="text-2xl font-black text-cyan-400">{item.title}</p>
              <p className="text-sm text-yellow-400 my-2">
                {formatted(item.createdAt)}
              </p>
              <p>{item.description}</p>
            </div>
            <div>
              {item.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="mb-5 mt-5 py-4 px-6 rounded-md bg-[#0d0d21]"
                >
                  <div className="mb-2 flex gap-5 md:gap-20 items-center flex-wrap">
                    <div>
                      <p className="text-2xl font-black text-green-400">
                        {lesson.title}
                      </p>
                      <p className="text-sm text-yellow-400 mt-2">
                        {formatted(lesson.createdAt)}
                      </p>
                    </div>
                    <p className="px-2 break break-all">{lesson.content}</p>
                  </div>
                  <div className="flex justify-end">
                    <Link to={`/teacher/add/assignment/${courseId}/${item.id}/${lesson.id}`} className="cursor-pointer px-4 py-2 bg-cyan-400 text-black rounded-md mt-4 md:mt-0">
                      اضافة مهاه
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
