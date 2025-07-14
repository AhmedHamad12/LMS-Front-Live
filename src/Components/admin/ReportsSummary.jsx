import React from "react";

const ReportsSummary = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
      <div className="glass-effect rounded-2xl p-6">
        <p className="text-sm text-gray-400">إجمالي أرباح المنصة</p>
        <p className="text-3xl font-black text-green-400">125,400 <span className="text-base">جنيه</span></p>
      </div>
      <div className="glass-effect rounded-2xl p-6">
        <p className="text-sm text-gray-400">متوسط الأرباح لكل مدرس</p>
        <p className="text-3xl font-black text-white">8,360 <span className="text-base">جنيه</span></p>
      </div>
      <div className="glass-effect rounded-2xl p-6">
        <p className="text-sm text-gray-400">إجمالي الطلاب</p>
        <p className="text-3xl font-black text-white">5,250 <span className="text-base">طالب</span></p>
      </div>
      <div className="glass-effect rounded-2xl p-6">
        <p className="text-sm text-gray-400">إجمالي المدرسين</p>
        <p className="text-3xl font-black text-white">15 <span className="text-base">مدرس</span></p>
      </div>
    </div>
  );
};

export default ReportsSummary;
