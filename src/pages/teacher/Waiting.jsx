import { Coffee } from "lucide-react";

function Waiting() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-slate-900"
      dir="rtl"
      style={{ fontFamily: "Cairo, sans-serif" }}
    >
      <div className="w-full max-w-md glass-effect rounded-2xl p-10 border border-white/10 bg-gradient-to-br from-slate-800/40 to-slate-900/50 backdrop-blur-lg shadow-xl text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-cyan-500/10 p-6">
            <Coffee className="h-16 w-16 text-cyan-400" />
          </div>
        </div>

        {/* Title */}
        <p dir="ltr" className="text-4xl font-bold text-gray-100 tracking-tight">
          ...يرجى الانتظار
        </p>

        {/* Message */}
        <p className="text-xl font-bold text-white">
          في انتظار تفعيل البريد الإلكتروني
        </p>

        {/* Help Section */}
        <div className="pt-6 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            هل تحتاج إلى مساعدة؟ تواصل مع فريق الدعم
          </p>
          <p className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold mt-2">
            01094870104
          </p>
        </div>
      </div>
    </div>
  );
}

export default Waiting;
