import React, { useState, useMemo, lazy, Suspense } from "react";
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Loading from "../../Components/Loading";
import { Star, Users, BookOpen, XCircle, Info } from "lucide-react";
import { Cookies } from "react-cookie";
import { jwtDecode } from "jwt-decode"; // <-- الخطوة 1: استيراد المكتبة الجديدة

const StarfieldBackground = lazy(() => import('../../Components/StarfieldBackground'));

// --- Helper Components ---

const StatCard = ({ icon, label, value }) => (
    <div className="glass-effect p-4 rounded-xl flex items-center gap-4 border border-transparent hover:border-cyan-500/50 transition-colors duration-300">
        <div className="bg-cyan-500/10 p-3 rounded-lg text-cyan-400">{icon}</div>
        <div>
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const getYearName = (year) => {
    const years = { 1: 'الصف الأول الثانوي', 2: 'الصف الثاني الثانوي', 3: 'الصف الثالث الثانوي' };
    return years[year] || `عام دراسي ${year}`;
};

// --- التعديل هنا: تم إضافة userRole للتعامل مع حالة المدرس
const CourseCard = ({ course, isEnrolled, isForMyYear, userRole }) => {
    const navigate = useNavigate();
    const cookies = new Cookies();
    const token = cookies.get("token");

    let buttonText = "عرض تفاصيل الكورس";
    let buttonClass = "bg-cyan-500 text-black hover:bg-cyan-400";
    let buttonAction = () => {
        if (!token) {
            toast.error("يجب عليك تسجيل الدخول أولاً");
            navigate('/login');
        } else {
            navigate(`/coursepreview/${course.id}`);
        }
    };

    if (isEnrolled) {
        buttonText = "الذهاب للكورس";
        buttonClass = "bg-green-600 text-white hover:bg-green-500";
        buttonAction = () => navigate(`/student/course/data/${course.id}`);
    } else if (userRole === 'Teacher') {
        buttonText = "لا يمكن الاشتراك";
        buttonClass = "bg-gray-500 text-gray-300 cursor-not-allowed";
        buttonAction = () => toast("لا يمكن للمدرسين الاشتراك في الكورسات.", { icon: 'ℹ️' });
    } else if (!isForMyYear) {
        buttonText = "لصف دراسي آخر";
        buttonClass = "bg-gray-500 text-gray-300 cursor-not-allowed";
        buttonAction = () => {};
    }
    
    const isClickable = !isEnrolled && userRole !== 'Teacher' && isForMyYear;

    return (
        <div className="h-full">
            <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className={`glass-effect rounded-2xl overflow-hidden flex flex-col group border border-white/10 h-full transition-all duration-300 ${isClickable ? 'transform hover:-translate-y-2 hover:border-cyan-400/30' : ''} ${!isForMyYear && userRole === 'Student' ? 'grayscale opacity-60' : ''}`}
            >
                <div className="relative overflow-hidden h-48">
                    <img src={course.image || '/default-course-image.png'} alt={course.title} className={`w-full h-full object-cover object-top ${isClickable ? 'group-hover:scale-105' : ''} transition-transform duration-300`} />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">{getYearName(course.studyYear)}</div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 flex-grow">{course.description}</p>
                    <div className="flex justify-between items-center mt-auto pt-4">
                        <p className="text-2xl font-black text-cyan-400">{course.price} <span className="text-sm">ج.م</span></p>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                buttonAction();
                            }}
                            className={`px-6 py-2 rounded-lg font-bold transition-colors relative z-10 ${buttonClass}`}
                        >
                            {buttonText}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};


// --- Main Teacher Profile Component ---
export default function TeacherPublicProfile() {
    const { teacherId } = useParams();
    const cookies = new Cookies();
    const token = cookies.get("token");

    // --- الخطوة 2: تحديد دور المستخدم من التوكن ---
    const userRole = useMemo(() => {
        if (!token) return null; // زائر
        try {
            const decodedToken = jwtDecode(token);
            // ابحث عن claim الدور، قد يختلف اسمه
            return decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null;
        } catch (error) {
            console.error("Invalid token:", error);
            return null;
        }
    }, [token]);


    // --- Data Fetching ---
    const { data: teacherData, isLoading: isLoadingTeacher, isError } = useQuery({
        queryKey: ['teacherProfile', teacherId],
        queryFn: async () => {
            const response = await axios.get(`/api/Teacher/TeacherProfile?teacherId=${teacherId}`);
            return response.data;
        },
        enabled: !!teacherId,
        refetchOnWindowFocus: false,
    });
    
    // --- الخطوة 3: جعل استدعاءات الطالب شرطية ---
    const { data: myCoursesData, isLoading: isLoadingMyCourses } = useQuery({
        queryKey: ['myCourses'],
        queryFn: () => axios.get('/api/StudentCourse/MyCourses', { headers: { Authorization: `Bearer ${token}` } }),
        enabled: !!token && userRole === 'Student', // يعمل فقط لو كان المستخدم طالباً
    });

    const { data: studentProfileData, isLoading: isLoadingStudent } = useQuery({
        queryKey: ['studentProfile'],
        queryFn: () => axios.get('/api/Student/getStudentById', { headers: { Authorization: `Bearer ${token}` } }),
        enabled: !!token && userRole === 'Student', // يعمل فقط لو كان المستخدم طالباً
        staleTime: 0, 
    });

    // --- Memoized Data Processing ---
    const enrolledCourseIds = useMemo(() => {
        if (!myCoursesData?.data) return new Set();
        return new Set(myCoursesData.data.map(course => course.id));
    }, [myCoursesData]);

    const studentYear = studentProfileData?.studentYears;
    
    // --- Render Logic ---
    const isLoading = isLoadingTeacher || (!!token && userRole === 'Student' && (isLoadingMyCourses || isLoadingStudent));
    
    if (isLoading) return <Loading message="جاري تحميل البيانات..." />;
    
    if (isError) return ( <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center"><XCircle size={64} className="text-red-500 mb-4" /><h2 className="text-3xl font-bold mb-2">حدث خطأ</h2><p className="text-gray-400 mb-6">لم نتمكن من العثور على بيانات هذا المدرس.</p><Link to="/" className="px-6 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors">العودة للرئيسية</Link></div> );

    return (
        <div className="min-h-screen bg-black text-gray-100 relative" style={{ fontFamily: "Cairo, sans-serif" }}>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-cyan-900/50 to-transparent -z-0"></div>
            <Helmet><title>{teacherData?.firstName} {teacherData?.lastName}</title></Helmet>
            
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center gap-8 mb-16 text-center">
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
                
                <div>
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-white inline-block relative title-glow">
                            كورسات يقدمها المدرس
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-cyan-500 rounded-full"></span>
                        </h2>
                    </div>

                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                        initial="hidden" animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.1 } }, hidden: {} }}
                    >
                        {teacherData?.courses?.map(course => {
                            let isForMyYear = false;
                            if (userRole === 'Student' && studentYear !== undefined && studentYear !== null) {
                                isForMyYear = (course.studyYear == studentYear);
                            } else {
                                // للزوار والمدرسين، اعتبر كل الكورسات قابلة للعرض
                                isForMyYear = true;
                            }
                            
                            return (
                                <CourseCard 
                                    key={course.id} 
                                    course={course} 
                                    isEnrolled={enrolledCourseIds.has(course.id)} 
                                    isForMyYear={isForMyYear}
                                    userRole={userRole} // <-- تمرير دور المستخدم للبطاقة
                                />
                            );
                        })}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}