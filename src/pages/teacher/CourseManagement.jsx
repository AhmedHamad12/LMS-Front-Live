import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';

const CourseDashboard = () => {
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

  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const starFieldsRef = useRef([]);

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

  const updateChapterTitle = (chapterId, newTitle) => {
    setChapters(chapters.map(chapter => 
      chapter.id === chapterId 
        ? { ...chapter, title: newTitle }
        : chapter
    ));
  };

  const updateLessonTitle = (newTitle) => {
    setActiveLesson({ ...activeLesson, title: newTitle });
  };

  const addNewChapter = () => {
    const newChapter = {
      id: chapters.length + 1,
      title: 'باب جديد',
      lessons: []
    };
    setChapters([...chapters, newChapter]);
  };

  const addNewLesson = (chapterId) => {
    setChapters(chapters.map(chapter => 
      chapter.id === chapterId 
        ? { 
            ...chapter, 
            lessons: [...chapter.lessons, { 
              id: Date.now(), 
              title: 'درس جديد' 
            }] 
          }
        : chapter
    ));
  };

  const handleClickOutside = (e) => {
    if (userMenuOpen && !e.target.closest('.user-menu')) {
      setUserMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  return (
    <div className="min-h-screen bg-black text-gray-100 overflow-hidden relative">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <aside className="w-20 lg:w-64 bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border-r border-gray-800/50 p-2 lg:p-6 flex flex-col justify-between transition-all duration-300 flex-shrink-0">
          <div>
            <div className="text-3xl font-black text-center mb-12 text-white">
              <Link href="#" className="block">
                <span className="hidden lg:inline text-cyan-400 drop-shadow-lg">المجرّة.</span>
                <span className="lg:hidden">🚀</span>
              </Link>
            </div>
            
            <nav className="space-y-4">
              <Link href="#" className="flex items-center justify-center lg:justify-start p-3 rounded-lg text-gray-300 hover:bg-white/10 transition-colors" title="لوحة التحكم">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
                <span className="hidden lg:inline mr-3">لوحة التحكم</span>
              </Link>
              
              <Link href="#" className="flex items-center justify-center lg:justify-start p-3 rounded-lg bg-cyan-500/20 text-white font-bold border border-cyan-500/30" title="كورساتي">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <span className="hidden lg:inline mr-3">كورساتي</span>
              </Link>
              
              <Link href="#" className="flex items-center justify-center lg:justify-start p-3 rounded-lg text-gray-300 hover:bg-white/10 transition-colors" title="الطلاب">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span className="hidden lg:inline mr-3">الطلاب</span>
              </Link>
              
              <Link href="#" className="flex items-center justify-center lg:justify-start p-3 rounded-lg text-gray-300 hover:bg-white/10 transition-colors" title="الأرباح">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
                <span className="hidden lg:inline mr-3">الأرباح</span>
              </Link>
            </nav>
          </div>
          
          <div className="relative user-menu">
            <div 
              onClick={() => setUserMenuOpen(!userMenuOpen)} 
              className="bg-gray-800/80 backdrop-blur-lg border border-gray-700/50 p-2 lg:p-3 rounded-lg flex items-center justify-center lg:justify-start cursor-pointer hover:bg-gray-700/80 transition-colors"
            >
              <img 
                src="https://placehold.co/40x40/1f2937/ffffff?text=أ.خ" 
                alt="صورة المستخدم" 
                className="w-10 h-10 rounded-full border-2 border-cyan-400"
              />
              <div className="hidden lg:block mr-3">
                <p className="font-bold text-white">أ. خالد صقر</p>
                <p className="text-xs text-gray-400">مدرس فيزياء</p>
              </div>
            </div>
            
            {userMenuOpen && (
              <div className="absolute bottom-full mb-2 w-full bg-gray-800/90 backdrop-blur-lg border border-gray-700/50 rounded-lg overflow-hidden shadow-xl">
                <Link href="#" className="block px-4 py-3 text-right text-sm text-gray-200 hover:bg-gray-700/50 transition-colors">الملف الشخصي</Link>
                <Link href="#" className="block px-4 py-3 text-right text-sm text-red-400 hover:bg-red-500/20 transition-colors">تسجيل الخروج</Link>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main ref={mainContentRef} className="flex-1 flex flex-col p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-transparent">
          <header className="flex-shrink-0 flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-black text-white text-cyan-400 drop-shadow-lg">إدارة كورس: الفيزياء الكونية</h1>
              <p className="text-gray-400 text-lg mt-2">هنا يمكنك بناء وتعديل كل تفاصيل رحلتك التعليمية.</p>
            </div>
            <button className="px-6 py-3 rounded-lg bg-green-500 text-white font-bold hover:bg-green-400 transition-colors shadow-lg hover:shadow-green-500/25">
              نشر الكورس
            </button>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
            {/* Content Editor */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                <label className="block text-lg font-bold text-white mb-3">عنوان الدرس</label>
                <input 
                  type="text" 
                  value={activeLesson.title}
                  onChange={(e) => updateLessonTitle(e.target.value)}
                  className="w-full p-3 rounded-lg text-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">فيديو الدرس</h3>
                <div className="mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-dashed border-gray-600 rounded-lg hover:border-cyan-500 transition-colors">
                  <div className="space-y-2 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    <div className="flex text-sm text-gray-400 justify-center">
                      <label className="relative cursor-pointer bg-gray-800/50 rounded-md px-3 py-1 font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                        {/* <span>اضغط لرفع الفيديو</span> */}
                        {/* <input type="file" className="sr-only" accept="video/*" /> */}
                        <input type="file"  accept="video/*" />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">MP4, MOV up to 1GB</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-4">ملخص الدرس (PDF)</h3>
                  <button className="w-full text-center p-4 rounded-lg border-2 border-dashed border-gray-600 hover:border-purple-400 hover:text-purple-400 transition-all text-gray-400 hover:bg-purple-500/5">
                    + إضافة ملخص
                  </button>
                </div>
                
                <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-4">امتحان الدرس</h3>
                  <button className="w-full text-center p-4 rounded-lg border-2 border-dashed border-gray-600 hover:border-yellow-400 hover:text-yellow-400 transition-all text-gray-400 hover:bg-yellow-500/5">
                    + إنشاء امتحان
                  </button>
                </div>
              </div>
            </div>

            {/* Course Structure */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-2xl font-bold text-white">هيكل الكورس</h2>
              <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 space-y-3 shadow-xl">
                {chapters.map((chapter) => (
                  <div key={chapter.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg">
                    <div className="p-3 flex justify-between items-center">
                      <input 
                        type="text" 
                        value={chapter.title}
                        onChange={(e) => updateChapterTitle(chapter.id, e.target.value)}
                        className="bg-transparent border-0 p-1 text-white font-bold w-full focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded"
                      />
                      <button className="text-gray-500 hover:text-white transition-colors px-2">⋮</button>
                    </div>
                    <div className="px-3 pb-3 space-y-2">
                      {chapter.lessons.map((lesson) => (
                        <div 
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer flex justify-between items-center transition-colors ${
                            activeLesson.id === lesson.id ? 'bg-cyan-500/20 border border-cyan-500/30' : ''
                          }`}
                        >
                          <p className="text-sm font-bold text-white">{lesson.title}</p>
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                          </svg>
                        </div>
                      ))}
                      <button 
                        onClick={() => addNewLesson(chapter.id)}
                        className="w-full text-center text-xs p-2 rounded-lg bg-gray-700/30 hover:bg-gray-600/50 text-cyan-300 transition-colors"
                      >
                        + إضافة درس جديد
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={addNewChapter}
                  className="w-full text-center p-3 rounded-lg border-2 border-dashed border-gray-600 hover:border-cyan-400 hover:text-cyan-400 transition-all text-gray-400 hover:bg-cyan-500/5"
                >
                  + إضافة باب جديد
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseDashboard;