import React from 'react';
import { useNavigate } from 'react-router-dom';

const OTP = () => {
  const navigate = useNavigate();

  const handleResendEmail = () => {
    // TODO: Implement resend password reset email functionality
    
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center text-white">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/5 bg-[#0a0a19]/50 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-lg">
          <div className="mb-8 text-center">
            {/* Email Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#00BFFF]/10 border border-[#00BFFF]/20">
              <svg 
                className="h-10 w-10 text-[#00BFFF]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
            </div>
            
            <h2 className="text-3xl font-black text-white title-glow mb-4">تحقق من بريدك الإلكتروني</h2>
            <p className="text-gray-300 text-lg mb-2">تم إرسال رابط إعادة تعيين كلمة المرور</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. 
              يرجى التحقق من صندوق الوارد الخاص بك والنقر على الرابط لإعادة تعيين كلمة المرور.
            </p>
          </div>

          <div className="space-y-4">
            {/* Tips Section */}
            <div className="rounded-lg bg-[#00BFFF]/5 border border-[#00BFFF]/10 p-4">
              <h3 className="text-[#00BFFF] font-bold text-sm mb-2">💡 نصائح مفيدة:</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• تحقق من مجلد الرسائل غير المرغوب فيها</li>
                <li>• تأكد من صحة عنوان البريد الإلكتروني</li>
                <li>• انتظر بضع دقائق إذا لم تصل الرسالة فوراً</li>
                <li>• انقر على الرابط في البريد الإلكتروني لإعادة تعيين كلمة المرور</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                          
              
              <button
                onClick={handleBackToLogin}
                className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm font-bold text-gray-300 transition-all duration-300 hover:bg-white/5 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                العودة إلى تسجيل الدخول
              </button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              إذا كنت تواجه مشاكل، يرجى التواصل مع فريق الدعم
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTP;