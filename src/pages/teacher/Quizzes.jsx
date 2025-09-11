import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import api from "../../api/axios";

const Quizzes = () => {
    // --- Logic and State (Unaltered) ---
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true); // Set initial loading to true
    const [openAccordion, setOpenAccordion] = useState(null);

    const cookies = new Cookies();
    const token = cookies.get("token");
    const navigate = useNavigate();

    useEffect(() => {
        const endExpiredQuizzes = async () => {
            try {
                await api.post("/api/Quiz/endExpiredQuizzes");
            } catch (error) {
                console.log(error);
            }
        };

        const fetchQuizzes = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/Quiz/getQuizForTeacher`, { withCredentials: true });
                setQuizzes(response.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        endExpiredQuizzes();
        fetchQuizzes();
    }, []);
    
    // --- Three.js Refs and Effects ---
    const canvasRef = useRef(null);
    const mainContentRef = useRef(null);
    useEffect(() => {
        if (!canvasRef.current) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        const createStarfield = (count, size, color) => {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(count * 3);
            for (let i = 0; i < count; i++) {
                positions[i*3+0] = (Math.random() - 0.5) * 200;
                positions[i*3+1] = (Math.random() - 0.5) * 200;
                positions[i*3+2] = (Math.random() - 0.5) * 200;
            }
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const material = new THREE.PointsMaterial({ size, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.7 });
            return new THREE.Points(geometry, material);
        };
        const stars = [createStarfield(8000, 0.05, 0x888888), createStarfield(5000, 0.1, 0xbbbbbb), createStarfield(1500, 0.15, 0xffffff)];
        stars.forEach(s => scene.add(s));
        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            stars[0].rotation.y = elapsedTime * 0.01;
            stars[1].rotation.y = elapsedTime * 0.02;
            stars[2].rotation.y = elapsedTime * 0.03;
            renderer.render(scene, camera);
        };
        animate();
        // ... (resize and scroll handlers would go here if needed)
    }, []);

    // --- JSX ---
    return (
        <div className="text-gray-100 font-[Cairo] h-screen overflow-hidden w-full" dir="rtl">
            <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-black" />
            <main ref={mainContentRef} className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#00BFFF rgba(0,0,0,0.2)" }}>
                
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2" style={{ textShadow: "0 0 15px rgba(0, 191, 255, 0.7)" }}>
                                إدارة الاختبارات
                            </h1>
                            <p className="text-slate-400 text-lg">
                                قم بإنشاء ومراجعة اختباراتك والتسليمات الخاصة بالطلاب.
                            </p>
                        </div>
                        <button onClick={() => navigate("/teacher/quizzes/create")}
                            className="mt-4 sm:mt-0 w-full sm:w-auto flex-shrink-0 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30">
                            + إضافة اختبار جديد
                        </button>
                    </header>

                    {loading ? (
                        <div className="text-center text-slate-400 p-10">جاري تحميل الاختبارات...</div>
                    ) : quizzes.length === 0 ? (
                        <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-12 text-center shadow-xl">
                            <svg className="mx-auto h-16 w-16 text-cyan-500/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 003.388-1.62m-1.622-3.385a15.998 15.998 0 00-1.622-3.385m-3.388 1.62A15.998 15.998 0 0012 2.75m-1.622 3.385A15.998 15.998 0 008.75 4.5m-1.622 3.385a15.998 15.998 0 01-3.388-1.62M4.5 8.75a15.998 15.998 0 01-1.622-3.385" /></svg>
                            <h3 className="text-xl font-bold text-white">لا توجد اختبارات متاحة بعد</h3>
                            <p className="text-slate-400 mt-2">يبدو أنك لم تقم بإنشاء أي اختبار. ابدأ الآن!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {quizzes.map((quiz, idx) => {
                                const isOpen = openAccordion === idx;
                                return (
                                    <div key={quiz.id || idx} className="bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-lg transition-all duration-300">
                                        <button onClick={() => setOpenAccordion(isOpen ? null : idx)} className="w-full flex items-center gap-4 p-5 text-start">
                                            <span className="flex-grow font-bold text-lg text-white">{quiz.title}</span>
                                            <div className="flex-shrink-0 flex items-center gap-3 text-xs font-semibold">
                                                <span className="px-3 py-1 bg-cyan-900/50 text-cyan-300 rounded-full">النجاح: {quiz.passScore}</span>
                                                <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full">{quiz.timeLimitMinutes} دقيقة</span>
                                            </div>
                                            <svg className={`w-6 h-6 text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                        
                                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[300px]' : 'max-h-0'}`}>
                                            <div className="border-t border-slate-700/50 p-5 space-y-4">
                                                <div className="text-sm text-slate-300">
                                                    <p><span className="font-bold text-slate-400">تاريخ الإنشاء:</span> {new Date(quiz.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                    <p><span className="font-bold text-slate-400">معرف الاختبار:</span> {quiz.id}</p>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                    <button onClick={() => navigate(`/teacher/quizzes/${quiz.id}/questions`)} className="w-full flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-slate-700/80 text-white font-bold hover:bg-slate-600/80 transition-colors">عرض الأسئلة</button>
                                                    <button onClick={() => navigate(`/teacher/quizzes/${quiz.id}/submissions`)} className="w-full flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-cyan-500/80 text-white font-bold hover:bg-cyan-500 transition-colors">عرض التسليمات</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Quizzes;