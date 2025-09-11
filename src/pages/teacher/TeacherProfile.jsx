import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../../api/axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import Loading from '../../Components/Loading';
import { Star, Users, BookOpen, XCircle } from 'lucide-react';
import { Cookies } from 'react-cookie';

// --- Helper Components ---

const StatCard = ({ icon, label, value }) => (
    <div className="glass-effect p-4 rounded-xl flex items-center gap-4 border border-transparent hover:border-cyan-500/50 transition-colors duration-300">
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
const CourseCard = ({ course, isEnrolled }) => {
    const navigate = useNavigate();
    const cookies = new Cookies();
    const token = cookies.get("token");

    const handleButtonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isEnrolled) {
            // <-- المسار الصحيح الذي طلبته
            navigate(`/student/course/data/${course.id}`);
            return;
        }
        
        if (!token) {
            toast.error("يجب عليك تسجيل الدخول أولاً");
            navigate('/login');
        } else {
            navigate(`/coursepreview/${course.id}`);
        }
    };

    return (
        // <-- المسار الصحيح الذي طلبته للـ Link
        <Link to={isEnrolled ? `/student/course/data/${course.id}` : `/coursepreview/${course.id}`} key={course.id} className="block">
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                }}
                className="glass-effect rounded-2xl overflow-hidden flex flex-col group border border-white/10 h-full transform hover:-translate-y-2 transition-all duration-300 hover:border-cyan-400/30"
            >
                <div className="overflow-hidden h-48">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 flex-grow">{course.description}</p>
                    <div className="flex justify-between items-center mt-auto pt-4">
                        <p className="text-2xl font-black text-cyan-400">{course.price} <span className="text-sm">ج.م</span></p>
                        <button 
                            onClick={handleButtonClick} 
                            className={`px-6 py-2 rounded-lg font-bold transition-colors relative z-10 ${
                                isEnrolled 
                                ? 'bg-green-600 text-white hover:bg-green-500' 
                                : 'bg-cyan-500 text-black hover:bg-cyan-400'
                            }`}
                        >
                            {isEnrolled ? "الذهاب للكورس" : "عرض الكورس"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};


// --- Main Teacher Profile Component ---
export default function TeacherPublicProfile() {
    const { teacherId } = useParams();
    const cookies = new Cookies();
    const token = cookies.get("token");

    const { data: teacherData, isLoading: isLoadingTeacher, isError } = useQuery({
        queryKey: ['teacherProfile', teacherId],
        queryFn: async () => {
            const response = await axios.get(`/api/Teacher/TeacherProfile?teacherId=${teacherId}`);
            return response.data;
        },
        enabled: !!teacherId,
        refetchOnWindowFocus: false,
    });
    
    const { data: myCoursesData, isLoading: isLoadingMyCourses } = useQuery({
        queryKey: ['myCourses'],
        queryFn: () => axios.get('/api/StudentCourse/MyCourses', { headers: { Authorization: `Bearer ${token}` } }),
        enabled: !!token, 
        refetchOnWindowFocus: false,
    });

    const enrolledCourseIds = useMemo(() => {
        if (!myCoursesData?.data) return new Set();
        return new Set(myCoursesData.data.map(course => course.id));
    }, [myCoursesData]);

    if (isLoadingTeacher || isLoadingMyCourses) {
        return <Loading message="جاري تحميل البيانات..." />;
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
        <div className="min-h-screen bg-black text-gray-100 relative" style={{ fontFamily: "Cairo, sans-serif" }}>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-cyan-900/50 to-transparent -z-0"></div>
            
            <Helmet>
                <title>{teacherData?.firstName} {teacherData?.lastName}</title>
            </Helmet>
            
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
                {/* --- Profile Header (Hero Section) --- */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center gap-8 mb-16 text-center"
                >
                    <img src={teacherData.path} alt={`${teacherData.firstName} ${teacherData.lastName}`} className="w-48 h-48 rounded-full border-4 border-cyan-500/50 object-cover object-top shadow-2xl shadow-cyan-500/30" />
                    <div className="flex-grow">
                        <h1 className="text-5xl lg:text-6xl font-black text-white title-glow">{teacherData.firstName} {teacherData.lastName}</h1>
                        <p className="text-2xl text-cyan-400 mt-2">{teacherData.subject}</p>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <StatCard icon={<Star size={20} />} label="سنوات الخبرة" value={teacherData.experienceYears} />
                            <StatCard icon={<Users size={20} />} label="عدد الطلاب" value={teacherData.uniqueStudentCount} />
                            <StatCard icon={<BookOpen size={20} />} label="عدد الكورسات" value={teacherData.courses.length} />
                        </div>
                    </div>
                </motion.div>

                {/* --- Courses Section --- */}
                <div>
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-white inline-block relative title-glow">
                            كورسات يقدمها المدرس
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-cyan-500 rounded-full"></span>
                        </h2>
                    </div>
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
                            <CourseCard 
                                key={course.id} 
                                course={course} 
                                isEnrolled={enrolledCourseIds.has(course.id)} 
                            />
                        ))}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}