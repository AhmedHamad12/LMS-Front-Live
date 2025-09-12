import React from "react";
import ReportsSummary from "../../Components/admin/ReportsSummary";
import MonthlyRevenue from "../../Components/admin/MonthlyRevenue";
import HighestRevenue from "../../Components/admin/HighestRevenue";

const Reports = () => {
  return (
    <main id="main-content" className="flex-1 p-8 overflow-y-auto custom-scrollbar">
      <p className="text-4xl font-black text-white mb-2 title-glow">التقارير والتحليلات</p>
      <p className="text-gray-400 text-lg mb-8">نظرة شاملة على أداء وصحة المجرّة.</p>

      <ReportsSummary />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <MonthlyRevenue />
        <HighestRevenue />
      </div>
    </main>
  );
};

export default Reports;
