import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) {
      setError('يرجى توفير  الرقم المكون من 6 خانات');
      return;
    }
    
    //TODO: try catch block for api call , or outer async method and await here

  };

  return (
    <div className="flex min-h-screen items-center justify-center  text-white">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/5 bg-[#0a0a19]/50 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-lg">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-white title-glow">رمز التحقق</h2>
            <p className="mt-2 text-gray-400">أدخل الرمز المرسل إلى بريدك الإلكتروني</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-bold text-gray-300 mb-2">رمز التحقق</label>
              <input
              dir='ltr'
                id="otp"
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="6-digit code"
                disabled={loading}
                className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-center tracking-widest placeholder-gray-500 transition-all duration-300 focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0,191,255,0.3)] focus:outline-none"
              />
            </div>
            {error && <div className="text-red-400 text-sm font-bold text-center">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg border border-transparent bg-[#00BFFF] px-4 py-3 text-sm font-bold text-black shadow-sm shadow-[rgba(0,191,255,0.4)] transition-all duration-300 hover:translate-y-[2px] hover:shadow-[0_0_25px_rgb(0_191_255_/_0.7)] disabled:opacity-60"
            >
              {loading ? 'جاري التحقق...' : 'تحقق'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTP;