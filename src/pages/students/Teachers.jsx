import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../../api/axios'; // تأكد من أن هذا هو المسار الصحيح لملف axios
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Star, Users, Search, Filter, XCircle, Info } from 'lucide-react';

import Loading from '../../Components/Loading'; // تأكد من وجود مكون التحميل لديك

// ==================================================================
// --- مكون بطاقة المدرس ---
// ==================================================================
const TeacherCard = ({ teacher }) => {
    // افترضنا هنا وجود teacher.id، تأكد من إضافته في الـ API
    const profileLink = teacher.id ? `/teacherprofile/${teacher.id}` : '#';

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
            }}
            transition={{ type: 'spring', stiffness: 100 }}
        >
            <Link to={profileLink} className="block group">
                <div className="h-full glass-effect rounded-2xl overflow-hidden border border-white/10 transform transition-all duration-300 hover:border-cyan-400/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20">
                    <div className="h-48 overflow-hidden">
                        <img 
                            src={teacher.path} 
                            alt={`${teacher.firstName} ${teacher.lastName}`}
                            className="w-full h-full object-cover object-center transform transition-transform duration-300 group-hover:scale-110"
                        />
                    </div>
                    <div className="p-5 text-center">
                        <h3 className="text-2xl font-bold text-white mb-1">{teacher.firstName} {teacher.lastName}</h3>
                        <p className="inline-block bg-cyan-500/10 text-cyan-400 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                            {teacher.subject}
                        </p>
                        <div className="flex justify-center items-center gap-6 text-slate-300">
                            <div className="flex items-center gap-2">
                                <Star className="text-yellow-400" size={20} />
                                <span>{teacher.experienceYears} سنوات خبرة</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="text-cyan-400" size={20} />
                                <span>{teacher.uniqueStudentCount} طالب</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};


// ==================================================================
// --- مكون الصفحة الرئيسي ---
// ==================================================================
export default function AllTeachers() {
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('الكل');

    const { data: teachers, isLoading, isError } = useQuery({
        queryKey: ['allTeachers'],
        queryFn: async () => {
            const response = await axios.get('/api/teacher/getAllTeacher'); // <-- تأكد أن هذا هو المسار الصحيح
            return response.data;
        },
        refetchOnWindowFocus: false,
    });

    const uniqueSubjects = useMemo(() => {
        if (!teachers) return [];
        // استخدام Set للحصول على المواد بدون تكرار
        const subjects = new Set(teachers.map(t => t.subject));
        return ['الكل', ...subjects];
    }, [teachers]);

    const filteredTeachers = useMemo(() => {
        if (!teachers) return [];
        return teachers.filter(teacher => {
            const nameMatch = `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
            const subjectMatch = subjectFilter === 'الكل' || teacher.subject === subjectFilter;
            return nameMatch && subjectMatch;
        });
    }, [teachers, searchTerm, subjectFilter]);


    if (isLoading) return <Loading message="جاري تحميل بيانات المدرسين..." />;

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center p-4">
                <XCircle size={64} className="text-red-500 mb-4" />
                <h2 className="text-3xl font-bold mb-2">حدث خطأ</h2>
                <p className="text-gray-400 mb-6">لم نتمكن من جلب بيانات المدرسين. يرجى المحاولة مرة أخرى.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-gray-100 font-[Cairo]" dir="rtl">
            <Helmet>
                <title>مدرسو المنصة</title>
            </Helmet>
            
            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl font-black text-white title-glow">تعرف على مدرسينا</h1>
                    <p className="text-xl text-slate-400 mt-4 max-w-2xl mx-auto">نخبة من أفضل المدرسين لمساعدتك على تحقيق أهدافك الأكاديمية.</p>
                </motion.div>

                {/* Filters */}
                <motion.div 
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: 0.2 }}
                    className="glass-effect p-4 rounded-xl mb-12 grid grid-cols-1 md:grid-cols-2 gap-4 sticky top-4 z-20"
                >
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text"
                            placeholder="ابحث عن مدرس بالاسم..."
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-3 pr-10 pl-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                         <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                         <select
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-3 pr-10 pl-4 text-white appearance-none focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                         >
                            {uniqueSubjects.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                            ))}
                         </select>
                    </div>
                </motion.div>

                {/* Teachers Grid */}
                {filteredTeachers.length > 0 ? (
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.07 } },
                            hidden: {}
                        }}
                    >
                        {filteredTeachers.map(teacher => (
                            <TeacherCard key={teacher.id || teacher.phone} teacher={teacher} /> // Using phone as fallback key if id is not available
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-16">
                        <Info size={48} className="mx-auto text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold text-white">لا توجد نتائج</h3>
                        <p className="text-slate-400">حاول تغيير كلمات البحث أو الفلتر.</p>
                    </div>
                )}
            </main>
        </div>
    );
}