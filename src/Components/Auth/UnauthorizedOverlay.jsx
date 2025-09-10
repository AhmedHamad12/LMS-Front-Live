import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";


const UnauthorizedOverlay = () => {
  const { showUnauthorized, unauthorizedMessage, hideUnauthorizedOverlay } = useAuth();

  if (!showUnauthorized) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80">
      <div className="bg-[rgba(10,10,25,0.5)] backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-xl max-w-md mx-4">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">مشكلة في الصلاحيات</h2>
          <p className="text-gray-400 mb-6">{unauthorizedMessage}</p>
          <div className="space-y-3">
            <Link
            onClick={hideUnauthorizedOverlay}
              to="/login"
              className="inline-block w-full text-center px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-400 transition-colors"
            >
              إعادة تسجيل الدخول
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedOverlay;


