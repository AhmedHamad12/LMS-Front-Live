import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Cookies } from 'react-cookie';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios'; // تأكد من أن المسار صحيح
import Loading from './Loading'; // تأكد من أن المسار صحيح

const StudentProfileCompletionGuard = () => {
    // 1. جلب التوكن للتحقق من هوية المستخدم
    const cookies = new Cookies();
    const token = cookies.get('token');

    // 2. تعريف دالة لجلب بيانات المستخدم الحالي
    const fetchCurrentUser = async () => {
        // ProtectedRoute الرئيسي يضمن وجود التوكن، لكن هذا فحص إضافي
        if (!token) return null; 
        const response = await axios.get("/api/Account/GetCurrentUser", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    };

    // 3. استخدام react-query لجلب البيانات والتعامل مع حالة التحميل
    const { data: currentUser, isLoading } = useQuery({
        queryKey: ['currentUserCompletionCheck', token], 
        queryFn: fetchCurrentUser,
        enabled: !!token, // لا تقم بتشغيل الطلب إلا عند وجود التوكن
        retry: 1, // حاول مرة واحدة فقط في حالة الفشل
        refetchOnWindowFocus: false, // لا تعيد جلب البيانات عند التركيز على النافذة
    });

    // 4. أثناء جلب البيانات، أظهر شاشة تحميل
    if (isLoading) {
        return <Loading message="جاري التحقق من اكتمال بياناتك..." />;
    }

    // 5. المنطق الأساسي: بعد انتهاء التحميل، تحقق من بيانات الطالب
    // نتأكد أن المستخدم هو "طالب"، وأن studentId الخاص به غير موجود (null)
    if (currentUser && currentUser.role === 'Student' && currentUser.studentId === null) {
        // إذا كانت الشروط متحققة، وجهه لصفحة استكمال البيانات
        return <Navigate to="/add-student" replace />;
    }

    // 6. إذا كان المستخدم مدرسًا، أو طالبًا ببيانات كاملة، اسمح له بالمرور
    return <Outlet />;
};

export default StudentProfileCompletionGuard;