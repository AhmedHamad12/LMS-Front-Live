import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../Components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Star, FileText, Bell, ChevronDown, BookOpen } from "lucide-react";

// Lazy load the heavy 3D background for a massive performance boost
const StarfieldBackground = lazy(() => import('../../Components/StarfieldBackground')); // Adjust path if needed

// --- Helper Components ---

const StatCard = ({ icon, title, value, subtext, colorClass, link }) => (
    <Link to={link}>
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`glass-effect p-6 rounded-2xl flex flex-col justify-between h-full border ${colorClass} transition-colors hover:bg-slate-800/50`}
        >
            <div className="flex justify-between items-center">
                <p className="font-bold text-white">{title}</p>
                {icon}
            </div>
            <div>
                <p className="text-4xl font-black text-white">{value}</p>
                {subtext && <p className="text-sm text-gray-400">{subtext}</p>}
            </div>
        </motion.div>
    </Link>
);

const CourseAccordionItem = ({ course, isOpen, onToggle }) => (
    <div className="overflow-hidden rounded-2xl glass-effect my-2">
        <button
            onClick={onToggle}
            className="flex w-full items-center justify-between p-4 sm:p-6 text-right transition-colors hover:bg-white/5"
        >
            <div className="flex items-center gap-4">
                <div className="h-fit rounded-lg bg-cyan-500/10 p-3"><BookOpen className="h-6 w-6 text-cyan-400" /></div>
                <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">{course.title}</h3>
                    <p className="text-sm text-gray-400">تاريخ الانضمام: {new Date(course.enrolledAt).toLocaleDateString("ar-EG")}</p>
                </div>
            </div>
            <ChevronDown className={`h-6 w-6 transform text-cyan-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="border-t border-white/10 px-6"
                >
                    <div className="py-6 space-y-4">
                        {course.units.length > 0 ? course.units.map(unit => (
                            <div key={unit.id} className="p-3 bg-black/20 rounded-lg">
                                <p className="font-bold text-white">{unit.title}</p>
                                <p className="text-sm text-gray-300">{unit.description}</p>
                            </div>
                        )) : <p className="text-gray-400">لا توجد وحدات متاحة في هذا الكورس بعد.</p>}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

// --- Main Dashboard Component ---
export default function Dashboard() {
    const [openCourseIndex, setOpenCourseIndex] = useState(null);
    const mainContentRef = useRef(null);
    const cookies = new Cookies();
    const token = cookies.get("token");

    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ["studentDashboardData"],
        queryFn: async () => {
            // Fetch independent data in parallel for speed
            const [scoreRes, assignmentsRes, coursesRes] = await Promise.all([
                axios.get("/api/Student/GetStudentRankAndScore", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`/api/Assignment/GetAssignmentsForStudent?category=1`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`/api/StudentCourse/MyCoursesWithUnits`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            const studentId = scoreRes.data.id;
            // Fetch dependent data (notifications) after getting the student ID
            const notificationsRes = studentId 
                ? await axios.get(`/api/Notification/student/${studentId}`, { headers: { Authorization: `Bearer ${token}` } }) 
                : { data: [] };

            return {
                userScore: scoreRes.data,
                userAssignments: assignmentsRes.data,
                enrollCourses: coursesRes.data,
                notifications: notificationsRes.data,
            };
        },
        refetchOnWindowFocus: false,
        // Handle 404s gracefully in case student has no data yet
        retry: (failureCount, error) => {
            if (error.response?.status === 404) return false;
            return failureCount < 3;
        },
    });

    if (isLoading) {
        return <Loading message="جاري تحضير لوحة التحكم الخاصة بك..." />;
    }

    return (
        <div className="min-h-screen text-gray-100" style={{ fontFamily: "Cairo, sans-serif" }}>
            <Suspense fallback={<div className="fixed inset-0 bg-black -z-10" />}>
                <StarfieldBackground mainContentRef={mainContentRef} />
            </Suspense>

            <main ref={mainContentRef} className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-black/20">
                <h2 className="mb-2 text-3xl sm:text-4xl font-black text-white title-glow">أهلاً بعودتك يا رائد الفضاء!</h2>
                <p className="mb-8 text-lg text-gray-400">مهمتك التالية في انتظارك. استعد للانطلاق.</p>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } },
                        hidden: {}
                    }}
                >
                    <StatCard icon={<Award size={24} />} title="ترتيبك في المجرة" value={`#${dashboardData?.userScore?.rank || 'N/A'}`} colorClass="border-cyan-500/30" link="/student/leaderboard" />
                    <StatCard icon={<Star size={24} />} title="نقاط الخبرة (XP)" value={dashboardData?.userScore?.score || 0} colorClass="border-yellow-500/30" link="/student/leaderboard" />
                    <StatCard icon={<FileText size={24} />} title="مهام جديدة" value={dashboardData?.userAssignments?.length || 0} subtext="في انتظار إنجازك" colorClass="border-purple-500/30" link="/student/mytasks" />
                </motion.div>

                <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
                    <div className="space-y-8 lg:col-span-2">
                        <h2 className="text-3xl font-bold text-white title-glow">مهماتك الحالية (الكورسات)</h2>
                        {dashboardData?.enrollCourses?.length > 0 ? (
                            dashboardData.enrollCourses.map((course, index) => (
                                <CourseAccordionItem
                                    key={course.id}
                                    course={course}
                                    isOpen={openCourseIndex === index}
                                    onToggle={() => setOpenCourseIndex(openCourseIndex === index ? null : index)}
                                />
                            ))
                        ) : (
                            <div className="glass-effect text-center p-12 rounded-2xl">
                                <p className="text-gray-400">لم تشترك في أي كورس بعد. حان وقت الانطلاق!</p>
                                <Link to="/student/allcourses" className="inline-block mt-4 rounded-lg bg-purple-600 px-6 py-2 font-bold text-white transition-colors hover:bg-purple-500">
                                    اكتشف الكورسات
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold text-white title-glow">البيانات الواردة</h2>
                        <div className="glass-effect rounded-2xl p-6 space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50">
                            {dashboardData?.notifications?.length > 0 ? dashboardData.notifications.map(item => (
                                <div key={item.id} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-b-0">
                                    <div className="h-fit rounded-full bg-purple-500/20 p-2"><Bell size={18} className="text-purple-400" /></div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{item.title}</p>
                                        <p className="text-xs text-gray-400">{item.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">{item.timeAgo}</p>
                                    </div>
                                </div>
                            )) : <p className="text-gray-400 text-center py-8">لا توجد إشعارات جديدة.</p>}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}