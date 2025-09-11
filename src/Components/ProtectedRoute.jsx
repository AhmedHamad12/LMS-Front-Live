import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Cookies } from 'react-cookie';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import Loading from './Loading'; // استدعي كومبوننت التحميل

const ProtectedRoute = () => {
  const cookies = new Cookies();
  const token = cookies.get('token');

  // الدالة التي تجلب بيانات المستخدم الحالي
  const fetchCurrentUser = async () => {
    if (!token) return null; // لا تقم بالطلب إذا لم يكن هناك توكن
    return axios.get("/api/Account/GetCurrentUser", {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const { data: userResponse, isLoading, isError } = useQuery({
    queryKey: ['currentUserProtected', token], // اجعل الكويري يعتمد على التوكن
    queryFn: fetchCurrentUser,
    enabled: !!token, // لا تقم بتشغيل الكويري إلا عند وجود التوكن
    retry: false, // لا تعيد المحاولة في حالة فشل التوكن
    refetchOnWindowFocus: false,
  });
  
  // 1. إذا لم يكن هناك توكن على الإطلاق، وجهه لصفحة اللوجن
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. أثناء جلب بيانات المستخدم، أظهر شاشة تحميل
  if (isLoading) {
    return <Loading />;
  }
  
  // 3. إذا فشل جلب البيانات (التوكن غير صالح)، وجهه لصفحة اللوجن
  if (isError || !userResponse?.data) {
    // يمكنك هنا حذف التوكن غير الصالح إذا أردت
    // cookies.remove('token', { path: '/' });
    return <Navigate to="/login" replace />;
  }

  const user = userResponse.data;
  
  // 4. إذا كان المستخدم مدرسًا وحالته "pending"، وجهه لصفحة الانتظار
  // **--== التعديل المطلوب هنا ==--**
  // التحقق من أن الحالة هي الرقم 0 بدلاً من كلمة "pending"
  if (user.role === 'Teacher' && user.status === 0) {
    return <Navigate to="/waiting" replace />;
  }

  // 5. إذا مر من كل الشروط السابقة، اسمح له بالدخول
  return <Outlet />;
};

export default ProtectedRoute;
