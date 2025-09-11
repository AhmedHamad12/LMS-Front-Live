import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';

const Email = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('يرجى توفير البريد الالكتروني');
      return;

    }

    if(!emailRegex.test(email) ){
      setError("البريد الإلكتروني غير صالح")
      return
    }

    
    
    

    const payload = {
      email 
    }
    const sendEmail = async ()=>{
      setLoading(true)
      try {
        const response = await axios.post(`/api/email/send-reset?email=${email}`)
        navigate("/reset/check-code")
      } catch (error) {
        setError(error?.response?.data)
        
        
      }
      finally{
        setLoading(false)
      }
    }

    sendEmail()
    
  }

  return (
    <div className="flex min-h-screen items-center justify-center  text-white">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/5 bg-[#0a0a19]/50 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-lg">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-white title-glow">استعادة كلمة المرور</h2>
            <p className="mt-2 text-gray-400">أدخل بريدك الإلكتروني لإرسال رمز التحقق</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-300 mb-2">البريد الإلكتروني</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full rounded-lg border border-white/10 bg-black/20 p-3 placeholder-gray-500 transition-all duration-300 focus:border-[#00BFFF] focus:shadow-[0_0_15px_rgb(0,191,255,0.3)] focus:outline-none"
              />
            </div>
            {error && <div className="text-red-400 text-sm font-bold text-center">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg border border-transparent bg-[#00BFFF] px-4 py-3 text-sm font-bold text-black shadow-sm shadow-[rgba(0,191,255,0.4)] transition-all duration-300 hover:translate-y-[2px] hover:shadow-[0_0_25px_rgb(0_191_255_/_0.7)] disabled:opacity-60"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Email;