import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../../api/axios';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Loading from '../../Components/Loading';
import { XCircle, Clock, BookOpen, Layers, Users, Play, Lock } from 'lucide-react';

// You can re-use your StarfieldBackground component if you have it
// import StarfieldBackground from '../../Components/StarfieldBackground';

const Stat = ({ icon, label, value }) => (
    <div className="flex items-center gap-3">
        {icon}
        <span className="text-white"><span className="font-bold">{value}</span> {label}</span>
    </div>
);

const LessonItem = ({ lesson }) => (
    <div className="flex items-center justify-between p-3 rounded-lg">
        <div className="flex items-center gap-3">
            {lesson.isFreePreview 
                ? <Play size={20} className="text-cyan-400 flex-shrink-0" />
                : <Lock size={20} className="text-gray-500 flex-shrink-0" />
            }
            <p className="text-gray-200">{lesson.title}</p>
        </div>
        <div className="flex items-center gap-4">
            {lesson.isFreePreview && (
                <span className="text-xs font-bold text-cyan-400">معاينة مجانية</span>
            )}
            <p className="text-xs text-gray-500">{Math.floor(lesson.durationSeconds / 60)}:{String(lesson.durationSeconds % 60).padStart(2, '0')}</p>
        </div>
    </div>
);

export default function CoursePreview() {
    const { courseId } = useParams();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['coursePreview', courseId],
        queryFn: async () => {
            const response = await axios.get(`/api/teacher/Courses/${courseId}/Preview`);
            return response.data;
        },
        enabled: !!courseId,
    });

    if (isLoading) return <Loading message="جاري تحميل بيانات الكورس..." />;

    if (isError || !data) return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
            <XCircle size={64} className="text-red-500 mb-4" />
            <h2 className="text-3xl font-bold">هذا الكورس غير متوفر حاليًا</h2>
            <Link to="/" className="mt-6 px-6 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors">
                العودة للرئيسية
            </Link>
        </div>
    );

    const { course, ui, stats, units } = data;
    const totalHours = (stats.totalDurationSeconds / 3600).toFixed(1);

    return (
        <div className="min-h-screen bg-black text-white" style={{ fontFamily: "Cairo, sans-serif" }}>
            <Helmet><title>{course.title}</title></Helmet>
            {/* <StarfieldBackground /> */}

            <main className="container mx-auto px-4 py-12 pt-24">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="grid grid-cols-1 lg:grid-cols-5 gap-12"
                >
                    {/* --- Left Column: Course Info --- */}
                    <div className="lg:col-span-3">
                        <p className="text-cyan-400 font-bold mb-2">{course.teacher.subject}</p>
                        <h1 className="text-5xl font-black text-white title-glow mb-4">{course.title}</h1>
                        <p className="text-lg text-gray-300 mb-6">{course.description}</p>
                        
                        {/* --- Start: التعديل المطلوب هنا --- */}
                        <Link to={`/teacherProfile/${course.teacher.id}`} className="inline-flex items-center gap-4 mb-8 group">
                            <img src={course.teacher.teacherImage} alt={course.teacher.name} className="w-12 h-12 rounded-full border-2 border-cyan-500/50 transition-transform group-hover:scale-110" />
                            <div>
                                <p className="font-bold text-white group-hover:text-cyan-300 transition-colors">مقدم بواسطة: {course.teacher.name}</p>
                                <p className="text-sm text-gray-400">{course.teacher.experienceYears} سنوات من الخبرة</p>
                            </div>
                        </Link>
                        {/* --- End: التعديل المطلوب هنا --- */}
                        
                        <div className="mt-8">
                            <h2 className="text-3xl font-bold mb-4">محتويات الكورس</h2>
                            <div className="space-y-4">
                                {units.map(unit => (
                                    <div key={unit.id} className="glass-effect rounded-xl border border-white/10">
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg text-white">{unit.title}</h3>
                                            <p className="text-sm text-gray-400">{unit.description}</p>
                                        </div>
                                        <div className="border-t border-white/10">
                                            {unit.lessons.map(lesson => <LessonItem key={lesson.id} lesson={lesson} />)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- Right Column: Purchase Card --- */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-24">
                            <div className="glass-effect rounded-2xl overflow-hidden border border-white/10">
                                <img src={course.courseImage} alt={course.title} className="w-full h-56 object-cover" />
                                <div className="p-6">
                                    <p className="text-4xl font-black text-center mb-4">{course.price} <span className="text-lg">ج.م</span></p>
                                    
                                    <a href={ui.isAuthenticated ? "/student/allcourses" : "/login"} className="w-full block text-center rounded-lg bg-cyan-500 px-8 py-4 text-lg font-bold text-black transition-all duration-300 hover:bg-cyan-400 hover:scale-105">
                                        {ui.isAuthenticated ? 'الذهاب إلى كورساتي' : 'سجل لتشترك الآن'}
                                    </a>

                                    <div className="space-y-3 mt-6 pt-6 border-t border-white/10 text-sm text-gray-300">
                                        <h4 className="font-bold text-white text-base mb-2">هذا الكورس يتضمن:</h4>
                                        <Stat icon={<Layers size={20} className="text-cyan-400"/>} label="وحدة" value={stats.unitsCount} />
                                        <Stat icon={<BookOpen size={20} className="text-cyan-400"/>} label="درس" value={stats.lessonsCount} />
                                        <Stat icon={<Clock size={20} className="text-cyan-400"/>} label={`ساعة من المحتوى (${totalHours})`} value={stats.totalDurationSeconds} />
                                        <Stat icon={<Users size={20} className="text-cyan-400"/>} label="طالب مشترك" value={stats.studentsPaidCount} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}