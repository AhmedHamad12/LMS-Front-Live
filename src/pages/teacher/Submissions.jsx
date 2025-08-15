import api from "../../api/axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const Submissions = () => {
  const { quizId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);


  const navigate = useNavigate()

  useEffect(()=>{
    const fetchSubmissions = async ()=>{

      try {
        setLoading(true);
        const response = await api.get(`/api/Quiz/submissions/${quizId}`)
        setSubmissions(response.data)
        console.log("submissions :",response.data);
        
      } catch (error) {
        console.log("an error occurred :",error.response.data);
       
        
      } finally {
        setLoading(false);
      }
      
    }
    fetchSubmissions()
  },[])

  const formatDate = (dateString) => {
    if (!dateString) return "لم يتم التقديم";
    const date = new Date(dateString);
    return date.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400 bg-green-400/20';
    if (score >= 70) return 'text-cyan-400 bg-cyan-400/20';
    if (score >= 50) return 'text-yellow-400 bg-yellow-400/20';
    return 'text-red-400 bg-red-400/20';
  };

  const getStatusBadge = (submittedAt) => {
    if (submittedAt) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-400/20 text-green-400 border border-green-400/30">
          <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          تم التقديم
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-400/20 text-gray-400 border border-gray-400/30">
        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        في الانتظار
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">جاري تحميل التقديمات...</p>
        </div>
      </div>
    );
  }

  const submittedCount = submissions.filter(sub => sub.submittedAt).length;
  const pendingCount = submissions.length - submittedCount;
  const averageScore = submittedCount > 0 
    ? Math.round(submissions.filter(sub => sub.submittedAt).reduce((sum, sub) => sum + sub.score, 0) / submittedCount)
    : 0;

  return (
    <div className="min-h-screen bg-black text-white font-[Cairo]" dir="rtl">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 
            className="text-5xl font-black text-white mb-4"
            style={{ textShadow: "0 0 12px rgba(0, 191, 255, 0.6)" }}
          >
            تقارير الاختبار
          </h1>
          <p className="text-gray-400 text-lg">
            تابع أداء الطلاب في الاختبار رقم {quizId}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-effect rounded-2xl p-6 border border-white/5">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-400">إجمالي الطلاب</p>
                <p className="text-2xl font-black text-white">{submissions.length}</p>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-white/5">
            <div className="flex items-center">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-400">تم التقديم</p>
                <p className="text-2xl font-black text-white">{submittedCount}</p>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-white/5">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-400">في الانتظار</p>
                <p className="text-2xl font-black text-white">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-white/5">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-400">متوسط الدرجات</p>
                <p className="text-2xl font-black text-white">{averageScore}%</p>
              </div>
            </div>
          </div>
        </div>
        
        {submissions.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-gray-600 mb-6">
                <svg className="mx-auto h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">لا توجد تقديمات بعد</h3>
              <p className="text-gray-400 text-lg">
                ستظهر تقديمات الطلاب هنا بمجرد إكمالهم الاختبار
              </p>
            </div>
          </div>
        ) : (
          <div className="glass-effect rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">تقديمات الطلاب</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-black/20">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-300 uppercase tracking-wider">
                      الطالب
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-300 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-300 uppercase tracking-wider">
                      الدرجة
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-300 uppercase tracking-wider">
                      وقت التقديم
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-300 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {submissions.map((submission) => (
                    <tr key={submission.submissionId} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                              <span className="text-lg font-bold text-cyan-400">
                                {submission.studentName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="mr-4">
                            <div className="text-lg font-bold text-white">
                              {submission.studentName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(submission.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.submittedAt ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(submission.score)} border`}>
                            {submission.score}%
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(submission.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {submission.submittedAt ? (
                          <button onClick={()=>navigate(`/teacher/quizzes/${quizId}/submissions/${submission.submissionId}`)} className="hover:cursor-pointer text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
                            عرض التفاصيل
                          </button>
                        ) : (
                          <span className="text-gray-500">لا يوجد إجراء متاح</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Submissions;
