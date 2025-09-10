import React, { useState, useRef, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../Components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Award, Star, FileText, Bell, ChevronDown, BookOpen, Crown } from "lucide-react";

// Lazy load the heavy 3D background
const StarfieldBackground = lazy(() => import('../../Components/StarfieldBackground'));

// --- Skeleton Loader Components ---
const StatCardSkeleton = () => (
    <div className="glass-effect p-6 rounded-2xl animate-pulse">
        <div className="h-6 w-3/4 bg-slate-700 rounded mb-4"></div>
        <div className="h-10 w-1/2 bg-slate-700 rounded"></div>
    </div>
);
const ListSkeleton = ({ items = 3 }) => (
    <div className="space-y-4">
        {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="glass-effect p-4 rounded-2xl flex items-center gap-4 animate-pulse">
                <div className="w-16 h-16 bg-slate-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 bg-slate-700 rounded"></div>
                    <div className="h-4 w-1/2 bg-slate-700 rounded"></div>
                </div>
            </div>
        ))}
    </div>
);


// --- Helper Components (No Changes) ---
const StatCard = ({ icon, title, value, subtext, colorClass, link }) => ( <Link to={link}><motion.div variants={{hidden:{opacity:0,y:20},visible:{opacity:1,y:0}}} whileHover={{y:-5,scale:1.02}} className={`glass-effect p-6 rounded-2xl flex flex-col justify-between h-full border ${colorClass} transition-colors hover:bg-slate-800/50`}><div className="flex justify-between items-start"><p className="font-bold text-white text-lg">{title}</p>{icon}</div><div><p className="text-4xl font-black text-white mt-2">{value}</p>{subtext && <p className="text-sm text-gray-400">{subtext}</p>}</div></motion.div></Link> );
const CourseAccordionItem = ({ course, isOpen, onToggle }) => ( <div className="overflow-hidden rounded-2xl glass-effect my-2"><button onClick={onToggle} className="flex w-full items-center justify-between p-4 sm:p-6 text-right transition-colors hover:bg-white/5"><div className="flex items-center gap-4"><div className="h-fit rounded-lg bg-cyan-500/10 p-3"><BookOpen className="h-6 w-6 text-cyan-400"/></div><div><h3 className="text-lg sm:text-xl font-bold text-white">{course.title}</h3><p className="text-sm text-gray-400">تاريخ الانضمام: {new Date(course.enrolledAt).toLocaleDateString("ar-EG")}</p></div></div><ChevronDown className={`h-6 w-6 transform text-cyan-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}/></button><AnimatePresence>{isOpen && ( <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.3,ease:"easeInOut"}} className="border-t border-white/10 px-4 sm:px-6"><div className="py-6 space-y-4">{course.units.length > 0 ? course.units.map(unit => ( <div key={unit.id} className="p-3 bg-black/20 rounded-lg"><p className="font-bold text-white">{unit.title}</p><p className="text-sm text-gray-300">{unit.description}</p></div> )) : <p className="text-gray-400">لا توجد وحدات متاحة في هذا الكورس بعد.</p>}</div></motion.div> )}</AnimatePresence></div> );
const LeaderboardItem = ({ student, rank }) => { const rankColors = { 1: "bg-yellow-500/20 border-yellow-400 text-yellow-400 shadow-lg shadow-yellow-500/10", 2: "bg-slate-500/20 border-slate-400 text-slate-300", 3: "bg-orange-700/20 border-orange-500 text-orange-400", }; const rankClass = rankColors[rank] || "bg-cyan-900/40 border-transparent"; return ( <div className={`flex items-center justify-between rounded-lg p-3 transition-all duration-300 border ${rankClass}`}><div className="flex items-center gap-4"><span className={`text-xl font-bold w-8 text-center`}>{rank}</span><span className="font-bold text-white">{student.firstName} {student.lastName}</span></div><div className="flex items-center gap-2 text-cyan-300"><span className="font-bold">{student.score}</span><Star size={16}/></div></div> ); };


export default function Dashboard() {
    const [openCourseIndex, setOpenCourseIndex] = useState(0); // Open first course by default
    const mainContentRef = useRef(null);
    const cookies = new Cookies();
    const token = cookies.get("token");

    // --- 1. تفكيك طلبات الـ API ---
    const STALE_TIME = 5 * 60 * 1000; // 5 minutes

    const useStudentData = (endpoint, queryKey) => {
        return useQuery({
            queryKey: [queryKey],
            queryFn: async () => {
                const { data } = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
                return data;
            },
            refetchOnWindowFocus: false,
            staleTime: STALE_TIME, // Data is fresh for 5 minutes
            retry: (failureCount, error) => error.response?.status === 404 ? false : failureCount < 2,
        });
    };

    const { data: userScore, isLoading: isScoreLoading } = useStudentData("/api/Student/GetStudentRankAndScore", "studentScore");
    const { data: userAssignments, isLoading: areAssignmentsLoading } = useStudentData(`/api/Assignment/GetAssignmentsForStudent?category=1`, "studentAssignments");
    const { data: enrollCourses, isLoading: areCoursesLoading } = useStudentData(`/api/StudentCourse/MyCoursesWithUnits`, "studentCoursesWithUnits");
    const { data: topStudents, isLoading: areTopStudentsLoading } = useStudentData('/api/LandingPadge/TopStudents', "topStudents");
    
    // Dependent query for notifications
    const { data: notifications, isLoading: areNotificationsLoading } = useQuery({
        queryKey: ["studentNotifications", userScore?.id],
        queryFn: async () => {
            const { data } = await axios.get(`/api/Notification/student/${userScore.id}`, { headers: { Authorization: `Bearer ${token}` } });
            return data;
        },
        enabled: !!userScore?.id, // Only run this query when userScore.id is available
        refetchOnWindowFocus: false,
        staleTime: STALE_TIME,
    });
    
    return (
        <div className="min-h-screen text-gray-100" style={{ fontFamily: "Cairo, sans-serif" }}>
            <Helmet><title>لوحة التحكم</title></Helmet>
            <Suspense fallback={<div className="fixed inset-0 bg-black -z-10" />}>
                <StarfieldBackground mainContentRef={mainContentRef} />
            </Suspense>

            <main ref={mainContentRef} className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-black/20">
                <h2 className="mb-2 text-3xl sm:text-4xl font-black text-white title-glow">أهلاً بعودتك، {userScore?.firstName || 'يا رائد الفضاء'}!</h2>
                <p className="mb-8 text-lg text-gray-400">مهمتك التالية في انتظارك. استعد للانطلاق.</p>

                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } }}}>
                    {isScoreLoading ? <StatCardSkeleton /> : <StatCard icon={<Award size={24} className="text-cyan-400" />} title="ترتيبك في المجرة" value={`#${userScore?.rank || 'N/A'}`} colorClass="border-cyan-500/30" link="/student/rewards" />}
                    {isScoreLoading ? <StatCardSkeleton /> : <StatCard icon={<Star size={24} className="text-yellow-400" />} title="نقاط الخبرة (XP)" value={userScore?.score || 0} colorClass="border-yellow-500/30" link="/student/rewards" />}
                    {areAssignmentsLoading ? <StatCardSkeleton /> : <StatCard icon={<FileText size={24} className="text-purple-400" />} title="مهام جديدة" value={userAssignments?.length || 0} subtext="في انتظار إنجازك" colorClass="border-purple-500/30" link="/student/mytasks" />}
                </motion.div>

                <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
                    <div className="space-y-8 lg:col-span-2">
                        <h2 className="text-3xl font-bold text-white title-glow">مهماتك الحالية (الكورسات)</h2>
                        {areCoursesLoading ? <ListSkeleton items={2} /> : (
                            enrollCourses?.length > 0 ? (
                                enrollCourses.map((course, index) => (
                                    <CourseAccordionItem key={course.id} course={course} isOpen={openCourseIndex === index} onToggle={() => setOpenCourseIndex(openCourseIndex === index ? null : index)} />
                                ))
                            ) : (
                                <div className="glass-effect text-center p-12 rounded-2xl"><p className="text-gray-400">لم تشترك في أي كورس بعد. حان وقت الانطلاق!</p><Link to="/student/allcourses" className="inline-block mt-4 rounded-lg bg-purple-600 px-6 py-2 font-bold text-white transition-colors hover:bg-purple-500">اكتشف الكورسات</Link></div>
                            )
                        )}
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white title-glow mb-6">البيانات الواردة</h2>
                            <div className="glass-effect rounded-2xl p-6 space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50">
                                {areNotificationsLoading ? <p className="text-gray-400 text-center py-8">جاري تحميل الإشعارات...</p> : (
                                    notifications?.length > 0 ? notifications.map(item => (
                                        <div key={item.id} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-b-0"><div className="h-fit rounded-full bg-purple-500/20 p-2"><Bell size={18} className="text-purple-400" /></div><div><p className="text-sm font-bold text-white">{item.title}</p><p className="text-xs text-gray-400">{item.message}</p><p className="text-xs text-gray-500 mt-1">{item.timeAgo}</p></div></div>
                                    )) : <p className="text-gray-400 text-center py-8">لا توجد إشعارات جديدة.</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="glass-effect rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4"><h3 className="text-2xl font-bold text-white title-glow flex items-center gap-2"><Crown size={24} className="text-yellow-400"/> أبطال المجرة</h3><Link to="/student/rewards" className="text-sm font-semibold text-cyan-400 hover:underline">عرض الكل</Link></div>
                            <div className="space-y-2">
                               {areTopStudentsLoading ? <ListSkeleton items={3} /> : (
                                   topStudents?.length > 0 ? topStudents.slice(0, 5).map((student, index) => (
                                       <LeaderboardItem key={student.id} student={student} rank={index + 1} />
                                   )) : <p className="text-gray-400 text-center py-4">لا يوجد طلاب في لوحة الشرف بعد.</p>
                               )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}