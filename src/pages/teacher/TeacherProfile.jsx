import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../../api/axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import Loading from '../../Components/Loading';
import { Star, Users, BookOpen, XCircle } from 'lucide-react';

// --- Helper Components ---

const StatCard = ({ icon, label, value }) => (
    <div className="glass-effect p-4 rounded-xl flex items-center gap-4">
        <div className="bg-cyan-500/10 p-3 rounded-lg text-cyan-400">
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);

// --- MODIFIED CourseCard Component ---
const CourseCard = ({ course }) => {
    //
    const handleEnrollClick = (e) => {
        // نمنع الرابط من العمل عند الضغط على الزر
        e.preventDefault();
        e.stopPropagation();
        toast.error("يجب عليك الاشتراك في الكورس أولاً لمشاهدة المحتوى");
    };

    return (
        // --- CHANGE START: The entire card is now a link ---
        <Link to={`/coursepreview/${course.id}`} key={course.id} className="block">
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                }}
                className="glass-effect rounded-2xl overflow-hidden flex flex-col group border border-white/10 h-full transform hover:-translate-y-2 transition-transform duration-300"
            >
                <div className="overflow-hidden">
                    <img src={course.image} alt={course.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 flex-grow">{course.description}</p>
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-2xl font-black text-cyan-400">{course.price} <span className="text-sm">ج.م</span></p>
                        <button 
                            onClick={handleEnrollClick} 
                            className="px-6 py-2 rounded-lg bg-cyan-500 text-black font-bold transition-colors hover:bg-cyan-400 relative z-10"
                        >
                            اشترك الآن
                        </button>
                    </div>
                </div>
            </motion.div>
        </Link>
        // --- CHANGE END ---
    );
};


// --- Main Teacher Profile Component ---
export default function TeacherPublicProfile() {
    const { teacherId } = useParams();

    const { data: teacherData, isLoading, isError } = useQuery({
        queryKey: ['teacherProfile', teacherId],
        queryFn: async () => {
            const response = await axios.get(`/api/Teacher/TeacherProfile?teacherId=${teacherId}`);
            return response.data;
        },
        enabled: !!teacherId,
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return <Loading message="جاري تحميل بيانات المدرس..." />;
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center">
                <XCircle size={64} className="text-red-500 mb-4" />
                <h2 className="text-3xl font-bold mb-2">حدث خطأ</h2>
                <p className="text-gray-400 mb-6">لم نتمكن من العثور على بيانات هذا المدرس.</p>
                <Link to="/" className="px-6 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors">
                    العودة للرئيسية
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-gray-100" style={{ fontFamily: "Cairo, sans-serif" }}>
            <Helmet>
                <title>{teacherData?.firstName} {teacherData?.lastName}</title>
            </Helmet>
            
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {/* --- Profile Header --- */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row items-center gap-8 mb-12 text-center md:text-right"
                >
                    <img src={teacherData.path} alt={`${teacherData.firstName} ${teacherData.lastName}`} className="w-40 h-40 rounded-full border-4 border-cyan-500/50 object-cover shadow-2xl shadow-cyan-500/20" />
                    <div className="flex-grow">
                        <h1 className="text-5xl font-black text-white title-glow">{teacherData.firstName} {teacherData.lastName}</h1>
                        <p className="text-2xl text-cyan-400 mt-2">{teacherData.subject}</p>
                        <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                            <StatCard icon={<Star size={20} />} label="سنوات الخبرة" value={teacherData.experienceYears} />
                            <StatCard icon={<Users size={20} />} label="عدد الطلاب" value={teacherData.uniqueStudentCount} />
                            <StatCard icon={<BookOpen size={20} />} label="عدد الكورسات" value={teacherData.courses.length} />
                        </div>
                    </div>
                </motion.div>

                {/* --- Courses Section --- */}
                <div>
                    <h2 className="text-3xl font-bold text-white mb-8 border-b-2 border-cyan-400/20 pb-4 title-glow">كورسات يقدمها المدرس</h2>
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.1 } },
                            hidden: {}
                        }}
                    >
                        {teacherData.courses.map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}