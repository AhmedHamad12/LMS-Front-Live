import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  // TODO: Replace with real API call
  const resetPassword = async () => {

    setSuccess('تم إعادة تعيين كلمة المرور بنجاح!');
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || !confirm) {
      setError('يرجى توفير كلا من كلمة المرور و تأكيد كلمة المرور.');
      return;
    }
    if (!passwordRegex.test(password)) {
      setError('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل وتحتوي على حرف كبير وحرف صغير ورقم ورمز خاص.');
      return;
    }
    if (password !== confirm) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    
    //TODO: try catch block for api call , or outer async method and await here

  };

  return (
    <div className="flex min-h-screen items-center justify-center  text-white">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/5 bg-[#0a0a19]/50 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-lg">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-white title-glow">تعيين كلمة مرور جديدة</h2>
            <p className="mt-2 text-gray-400">أدخل كلمة المرور الجديدة وأكدها</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-300 mb-2">كلمة المرور الجديدة</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة"
                disabled={loading}
                className="w-full rounded-lg border border-white/10 bg-black/20 p-3 placeholder-gray-500 transition-all duration-300 focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0,191,255,0.3)] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-bold text-gray-300 mb-2">تأكيد كلمة المرور</label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="أكد كلمة المرور الجديدة"
                disabled={loading}
                className="w-full rounded-lg border border-white/10 bg-black/20 p-3 placeholder-gray-500 transition-all duration-300 focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0,191,255,0.3)] focus:outline-none"
              />
            </div>
            {error && <div className="text-red-400 text-sm font-bold text-center">{error}</div>}
            {success && <div className="text-green-400 text-sm font-bold text-center">{success}</div>}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg border border-transparent bg-[#00BFFF] px-4 py-3 text-sm font-bold text-black shadow-sm shadow-[rgba(0,191,255,0.4)] transition-all duration-300 hover:translate-y-[2px] hover:shadow-[0_0_25px_rgb(0_191_255_/_0.7)] disabled:opacity-60"
            >
              {loading ? 'جاري التعيين...' : 'تعيين كلمة المرور'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;