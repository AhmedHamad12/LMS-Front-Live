import React, { useState, useMemo, Suspense, lazy, useRef } from "react";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Loading from "../../Components/Loading";
import { Award, Star, Crown } from "lucide-react";

// Lazy load the heavy 3D background
const StarfieldBackground = lazy(() => import('../../Components/StarfieldBackground'));

// --- Helper Components (No Changes) ---
const FilterButton = ({ filterKey, label, isActive, onClick }) => ( <button onClick={() => onClick(filterKey)} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${isActive ? "bg-cyan-500 text-black scale-105 shadow-lg shadow-cyan-500/20" : "bg-white/10 text-white hover:bg-white/20"}`}>{label}</button> );
const PodiumCard = ({ student, position }) => { const podiumStyles = { 1: { border: "border-yellow-400", shadow: "shadow-yellow-400/20", text: "text-yellow-300", size: "p-8", nameSize: "text-2xl", scoreSize: "text-3xl", emoji: "🥇" }, 2: { border: "border-gray-400", shadow: "shadow-gray-400/10", text: "text-gray-300", size: "p-6", nameSize: "text-xl", scoreSize: "text-2xl", emoji: "🥈" }, 3: { border: "border-orange-600", shadow: "shadow-orange-600/10", text: "text-orange-500", size: "p-6", nameSize: "text-xl", scoreSize: "text-2xl", emoji: "🥉" } }; const style = podiumStyles[position]; const initial = student.name ? student.name.trim()[0].toUpperCase() : '?'; return ( <div className={`glass-effect rounded-t-2xl text-center transform hover:scale-105 transition-transform duration-300 shadow-2xl border-2 ${style.border} ${style.shadow} ${style.size}`}><div className={`w-24 h-24 rounded-full mx-auto mb-4 border-4 flex items-center justify-center bg-slate-800 ${style.border}`}><span className="text-4xl font-black text-white">{initial}</span></div><h3 className={`${style.nameSize} font-bold text-white`}>{student.name}</h3><p className={`${style.scoreSize} font-black ${style.text}`}>{student.score} <span className="text-base font-medium">نقطة</span></p><p className="text-5xl mt-2">{style.emoji}</p></div> ); };
const LeaderboardRow = ({ student }) => { const initial = student.name ? student.name.trim()[0].toUpperCase() : '?'; return( <div className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors"><div className="w-12 text-center text-lg font-bold text-gray-400">{student.rank}</div><div className="w-10 h-10 rounded-full mx-4 flex items-center justify-center bg-cyan-900/50 border-2 border-cyan-500/50"><span className="font-bold text-cyan-300">{initial}</span></div><p className="font-bold text-white flex-grow">{student.name}</p><div className="w-24 text-center font-bold text-cyan-400 flex items-center justify-center gap-2">{student.score} <Star size={16}/></div></div> ); };
const MyRankBar = ({ userScore }) => { if (!userScore) return null; const initial = userScore.name ? userScore.name.trim()[0].toUpperCase() : '?'; return ( <div className="sticky bottom-0 mt-8 z-10"><div className="glass-effect border-2 border-cyan-500/50 rounded-2xl p-4 flex items-center shadow-lg shadow-cyan-500/10"><div className="w-12 text-center text-xl font-black text-white">#{userScore.rank}</div><div className="w-10 h-10 rounded-full mx-4 flex items-center justify-center bg-slate-700"><span className="font-bold text-white">{initial}</span></div><p className="font-bold text-white flex-grow">أنت ({userScore.name})</p><div className="text-center font-bold text-cyan-300">{userScore.score} نقطة</div></div></div> ); };
const PodiumSkeleton = () => ( <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end mb-12 animate-pulse"><div className="order-2 lg:order-1 h-64 bg-slate-800/50 rounded-t-2xl"></div><div className="order-1 lg:order-2 h-80 bg-slate-800/50 rounded-t-2xl"></div><div className="order-3 lg:order-3 h-64 bg-slate-800/50 rounded-t-2xl"></div></div> );
const ListSkeleton = () => ( <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => ( <div key={i} className="flex items-center p-3 rounded-lg bg-slate-800/50 animate-pulse h-16"></div> ))}</div> );

// --- Main Leaderboard Component ---
export default function Rewards() {
    const [yearFilter, setYearFilter] = useState("all");
    const mainContentRef = useRef(null);
    const cookies = new Cookies();
    const token = cookies.get("token");

    // نفترض أن هذا الطلب سيرجع 'studentYears' مع بقية بيانات الطالب
    const { data: userScore, isLoading: isUserScoreLoading } = useQuery({
        queryKey: ["userScoreAndRank"],
        queryFn: () => axios.get("/api/Student/GetStudentRankAndScore", {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.data),
    });

    const { data: topStudents, isLoading: isTopStudentsLoading } = useQuery({
        queryKey: ["topStudents"],
        queryFn: () => axios.get(`/api/Student/getTopStudentsByScore`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.data),
    });
    
    const filteredStudents = useMemo(() => {
        if (!topStudents) return [];
        const filtered = yearFilter === "all"
            ? topStudents
            : topStudents.filter(student => student.studentYears === yearFilter);
        
        return filtered.map((student, index) => ({
            ...student,
            rank: index + 1
        }));
    }, [topStudents, yearFilter]);

    const currentUserInList = useMemo(() => {
        if (!userScore || !filteredStudents) return null;
        return filteredStudents.find(student => student.name === userScore.name);
    }, [filteredStudents, userScore]);

    const displayedRank = currentUserInList ? currentUserInList.rank : userScore?.rank;
    const userScoreForBar = userScore ? { ...userScore, rank: displayedRank } : null;

    const topThree = filteredStudents.slice(0, 3);
    const restOfList = filteredStudents.slice(3);
    
    // ======================= التعديل هنا =======================
    // 1. تحديد ما إذا كان يجب عرض شريط الترتيب الخاص بالمستخدم
    const shouldShowMyRankBar = useMemo(() => {
        if (!userScore) return false;
        // اعرض الشريط دائماً إذا كان الفلتر "الكل"
        if (yearFilter === "all") return true;
        // اعرض الشريط فقط إذا كان الفلتر يطابق سنة المستخدم الدراسية
        // نفترض أن userScore يحتوي على studentYears
        return yearFilter === userScore.studentYears;
    }, [yearFilter, userScore]);
    // ===================== نهاية التعديل =====================

    const isLoading = isTopStudentsLoading || isUserScoreLoading;
    if (isLoading) return <Loading message="جاري تحميل لوحة الشرف..." />;

    return (
        <div className="min-h-screen text-gray-100 overflow-hidden w-full" dir="rtl" style={{ fontFamily: "Cairo, sans-serif" }}>
            <Helmet><title>لوحة الشرف</title></Helmet>
            <Suspense fallback={<div className="fixed inset-0 bg-black -z-10" />}>
                <StarfieldBackground mainContentRef={mainContentRef} />
            </Suspense>

            <main ref={mainContentRef} className="flex-1 h-screen p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-black/20">
                <motion.h1 initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="text-4xl font-black text-white mb-2 title-glow">لوحة شرف المحاضرة</motion.h1>
                <motion.p initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} className="text-gray-400 text-lg mb-8">ساحة المنافسة لأقوى العباقرة في منصتنا التعليمية.</motion.p>

                <div className="flex items-center gap-4 mb-8 flex-wrap glass-effect p-2 rounded-xl">
                    <FilterButton label="كل السنوات" isActive={yearFilter === "all"} onClick={() => setYearFilter("all")} />
                    <FilterButton label="الصف الأول الثانوي" isActive={yearFilter === 1} onClick={() => setYearFilter(1)} />
                    <FilterButton label="الصف الثاني الثانوي" isActive={yearFilter === 2} onClick={() => setYearFilter(2)} />
                    <FilterButton label="الصف الثالث الثانوي" isActive={yearFilter === 3} onClick={() => setYearFilter(3)} />
                </div>

                {isLoading ? <PodiumSkeleton /> : (
                    topThree.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end mb-12">
                            {topThree[1] && <div className="order-2 lg:order-1"><PodiumCard student={topThree[1]} position={2} /></div>}
                            {topThree[0] && <div className="order-1 lg:order-2"><PodiumCard student={topThree[0]} position={1} /></div>}
                            {topThree[2] && <div className="order-3 lg:order-3"><PodiumCard student={topThree[2]} position={3} /></div>}
                        </div>
                    )
                )}

                <div className="glass-effect rounded-2xl p-4 shadow-2xl">
                    {isLoading ? <ListSkeleton /> : (
                        restOfList.length > 0 ? (
                            <div className="space-y-2">
                                {restOfList.map((student) => <LeaderboardRow key={`${student.name}-${student.rank}`} student={student} />)}
                            </div>
                        ) : (
                           !isLoading && filteredStudents.length <= 3 && <p className="text-center text-gray-400 py-8">لا يوجد طلاب آخرين لعرضهم في هذا الترتيب.</p>
                        )
                    )}
                </div>
                
                {/* 2. عرض الشريط السفلي فقط عند تحقق الشرط */}
                {shouldShowMyRankBar && <MyRankBar userScore={userScoreForBar} />}
            </main>
        </div>
    );
}