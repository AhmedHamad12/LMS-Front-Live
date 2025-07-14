
import React from 'react';


const MonthlyRevenue = () => {

    const monthlyRevenue = [
        { month: 'يناير', value: 54000 },
        { month: 'فبراير', value: 130000 },
        { month: 'مارس', value: 45000 },
        { month: 'أبريل', value: 80000 },
        { month: 'مايو', value: 85000 },
        { month: 'يونيو', value: 100000 },
        
      ];


  const maxRevenue = Math.max(...monthlyRevenue.map((r) => r.value));

  return (
    <div className="lg:col-span-2">
      <h2 className="text-2xl font-bold mb-6">تقرير الأرباح الشهري</h2>
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-end justify-between h-64">
          {monthlyRevenue.map((item, index) => {
            const barHeight = (item.value / maxRevenue) * 100;

            return (
              <div key={index} className="flex flex-col justify-end items-center h-full w-1/6">
                <div
                  className={`w-2/4 min-h-[4px] rounded-t-lg transition-all duration-300 ${
                    item.value === maxRevenue
                      ? 'bg-cyan-500'
                      : 'bg-cyan-800 hover:bg-cyan-700'
                  }`}
                  style={{ height: `${barHeight}%` }}
                ></div>
                <p
                  className={`text-xs mt-2 ${
                    item.value === maxRevenue
                      ? 'font-bold text-white'
                      : ''
                  }`}
                >
                  {item.month}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthlyRevenue;
