import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"; // <-- تم إضافة useCallback هنا
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import api from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/ar';
import { LayoutGrid, Rows3, Clock, CheckCircle, Users, HelpCircle, FileText, Calendar, Play, PowerOff, Pencil } from 'lucide-react';

// Configure Day.js for Arabic and Timezone support
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale('ar');

// ==================================================================
// --- Countdown Timer Component ---
// ==================================================================
const CountdownTimer = ({ startTime, onComplete }) => {
    const calculateTimeLeft = useCallback(() => {
        const start = dayjs.utc(startTime);
        const now = dayjs();
        const diff = start.diff(now);

        if (diff <= 0) {
            return null;
        }
        
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, [startTime]);
    
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            if (newTimeLeft) {
                setTimeLeft(newTimeLeft);
            } else {
                clearInterval(timer);
                onComplete(); // Notify parent that the timer finished
            }
        }, 1000);
        
        return () => clearInterval(timer);
    }, [calculateTimeLeft, onComplete]);

    return <span>{timeLeft}</span>;
};

// ==================================================================
// --- Helper function to determine the precise status of a quiz ---
// ==================================================================
const getQuizStatus = (quiz, now) => {
    if (!quiz.isQuizEnd) {
        return { id: 'draft', text: 'مسودة', icon: Pencil, className: 'bg-yellow-900/60 text-yellow-300 border-yellow-500/30' };
    }
    const startTime = dayjs.utc(quiz.startAt);
    const endTime = dayjs.utc(quiz.endAt);

    if (now.isBefore(startTime)) {
        const diffMinutes = startTime.diff(now, 'minute');
        if (diffMinutes < 3) {
            return { id: 'starting_soon', text: 'يبدأ في', icon: Clock, className: 'bg-blue-900/60 text-blue-300 border-blue-500/30' };
        }
        return { id: 'upcoming', text: `يبدأ ${startTime.from(now)}`, icon: Calendar, className: 'bg-blue-900/60 text-blue-300 border-blue-500/30' };
    }
    if (now.isAfter(endTime)) {
        return { id: 'finished', text: 'منتهي', icon: PowerOff, className: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
    return { id: 'active', text: 'نشط الآن', icon: Play, className: 'bg-green-900/60 text-green-300 border-green-500/30 animate-pulse' };
};

const QuizItem = React.memo(({ quiz, layout, currentTime, forceUpdate }) => {
    const navigate = useNavigate();
    const status = getQuizStatus(quiz, currentTime);

    const Stat = ({ icon: Icon, value, label }) => (
        <div className="flex items-center gap-2 text-sm text-slate-300">
            <Icon className="w-4 h-4 text-cyan-400" />
            <span>{value} <span className="text-slate-400 hidden sm:inline">{label}</span></span>
        </div>
    );

    const isListLayout = layout === 'list';
    const statusBorderColor = status.className.split(' ')[2].replace('border-', 'border-l-');

    return (
        <motion.div
            layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
            className={`bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-lg transition-all duration-300 group hover:border-cyan-500/50 hover:shadow-cyan-500/10 flex flex-col border-l-4 ${statusBorderColor} ${isListLayout ? 'sm:flex-row sm:items-center sm:p-4 sm:gap-4' : ''}`}
        >
            <div className={`flex-grow p-5 ${isListLayout ? 'sm:p-0' : ''}`}>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors w-10/12">{quiz.title}</h3>
                    <div className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-2 border ${status.className}`}>
                        <status.icon size={14} />
                        {status.id === 'starting_soon' ? (
                            <>
                                <span className="ml-1">{status.text}</span>
                                <CountdownTimer startTime={quiz.startAt} onComplete={forceUpdate} />
                            </>
                        ) : (
                            status.text
                        )}
                    </div>
                </div>
                <p className={`text-slate-400 text-sm mt-2`}><span className="font-semibold text-slate-300">متاح من:</span> {dayjs.utc(quiz.startAt).tz('Africa/Cairo').format('D MMMM YYYY, h:mm A')}</p>
                <p className={`text-slate-400 text-sm`}><span className="font-semibold text-slate-300">حتى:</span> {dayjs.utc(quiz.endAt).tz('Africa/Cairo').format('D MMMM YYYY, h:mm A')}</p>
            </div>

            <div className={`flex-shrink-0 flex items-center gap-4 ${isListLayout ? 'sm:gap-6' : 'px-5 py-4 border-y border-slate-700/50 grid grid-cols-2 gap-4'}`}>
                <Stat icon={CheckCircle} value={quiz.passScore} label="للنجاح" />
                <Stat icon={Clock} value={`${quiz.timeLimitMinutes}`} label="دقيقة" />
                <Stat icon={HelpCircle} value={quiz.numberOfQuestions} label="أسئلة" />
                <Stat icon={Users} value={quiz.numberOfSumbited} label="تسليمات" />
            </div>

            <div className={`flex flex-col sm:flex-row gap-3 ${isListLayout ? 'flex-shrink-0' : 'p-4'}`}>
                <button onClick={() => navigate(`/teacher/quizzes/${quiz.id}/questions`)} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-700/80 text-white font-semibold text-sm hover:bg-slate-600/80 transition-colors">عرض الأسئلة</button>
                <button onClick={() => navigate(`/teacher/quizzes/${quiz.id}/submissions`)} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-600/80 text-white font-semibold text-sm hover:bg-cyan-500 transition-colors">عرض التسليمات</button>
            </div>
        </motion.div>
    );
});

const Quizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [layout, setLayout] = useState('grid');
    const [currentTime, setCurrentTime] = useState(dayjs());
    const navigate = useNavigate();

    const forceUpdate = useCallback(() => setCurrentTime(dayjs()), []);

    useEffect(() => {
        const endExpiredQuizzes = async () => { try { await api.post("/api/Quiz/endExpiredQuizzes"); } catch (error) { console.log(error); }};
        const fetchQuizzes = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/api/Quiz/getQuizForTeacher`, { withCredentials: true });
                setQuizzes(response.data);
            } catch (error) { console.log(error); } finally { setLoading(false); }
        };
        endExpiredQuizzes();
        fetchQuizzes();
        
        const minuteTimer = setInterval(() => setCurrentTime(dayjs()), 30000); // تحديث كل 30 ثانية لضمان الدقة
        return () => clearInterval(minuteTimer);
    }, []);
    
    const canvasRef = useRef(null);
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
    }, []);

    return (
        <div className="text-gray-100 font-[Cairo] h-screen overflow-hidden w-full" dir="rtl">
            <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-black" />
            <main className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8" style={{ scrollbarWidth: "thin", scrollbarColor: "#00BFFF rgba(0,0,0,0.2)" }}>
                <div className="max-w-6xl mx-auto">
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2" style={{ textShadow: "0 0 15px rgba(0, 191, 255, 0.7)" }}>إدارة الاختبارات</h1>
                            <p className="text-slate-400 text-lg">قم بإنشاء ومراجعة اختباراتك والتسليمات الخاصة بالطلاب.</p>
                        </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="p-1 bg-slate-800/70 rounded-lg flex items-center">
                                    <button onClick={() => setLayout('grid')} className={`px-3 py-1.5 rounded-md transition-colors ${layout === 'grid' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}><LayoutGrid className="w-5 h-5" /></button>
                                    <button onClick={() => setLayout('list')} className={`px-3 py-1.5 rounded-md transition-colors ${layout === 'list' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}><Rows3 className="w-5 h-5" /></button>
                                </div>
                                <button onClick={() => navigate("/teacher/quizzes/create")} className="flex-grow sm:flex-grow-0 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30">+ إضافة اختبار</button>
                            </div>
                    </header>

                    {loading ? (
                        <div className="text-center text-slate-400 p-10">جاري تحميل الاختبارات...</div>
                    ) : quizzes.length === 0 ? (
                        <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-400/10 rounded-2xl p-12 text-center shadow-xl">
                            <FileText className="mx-auto h-16 w-16 text-cyan-500/40 mb-4" strokeWidth={1}/>
                            <h3 className="text-xl font-bold text-white">لا توجد اختبارات متاحة بعد</h3>
                            <p className="text-slate-400 mt-2">يبدو أنك لم تقم بإنشاء أي اختبار. ابدأ الآن!</p>
                        </div>
                    ) : (
                        <motion.div
                            layout
                            className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-4'}
                        >
                            <AnimatePresence>
                                {quizzes.map((quiz) => (
                                    <QuizItem key={quiz.id} quiz={quiz} layout={layout} currentTime={currentTime} forceUpdate={forceUpdate} />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Quizzes;