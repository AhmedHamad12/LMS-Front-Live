import React from "react";

const topTeachers = [
  {
    name: "أ. خالد صقر",
    earnings: "12,500 جنيه",
    students: 1345,
    avatar: "https://placehold.co/40x40/000000/ffffff?text=أ.خ",
    rank: "#1",
    color: "text-yellow-400",
  },
  {
    name: "أ. منى علي",
    earnings: "9,800 جنيه",
    students: 950,
    avatar: "https://placehold.co/40x40/ffffff/000000?text=أ.م",
    rank: "#2",
    color: "text-gray-400",
  },
  {
    name: "أ. أحمد السيد",
    earnings: "7,200 جنيه",
    students: 810,
    avatar: "https://placehold.co/40x40/ffffff/000000?text=أ.أ",
    rank: "#3",
    color: "text-yellow-700",
  },
];

const HighestRevenue = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">أعلى المدرسين أرباحًا (الشهر الحالي)</h2>
      <div className="glass-effect rounded-2xl p-4 space-y-2">
        {topTeachers.map((teacher) => (
          <div key={teacher.name} className="p-3 flex items-center hover:bg-white/5 rounded-lg">
            <img src={teacher.avatar} className="w-10 h-10 rounded-full ml-3" />
            <div>
              <p className="font-bold text-white">{teacher.name}</p>
              <p className="text-xs text-gray-400">
                {teacher.earnings} • {teacher.students} طالب
              </p>
            </div>
            <p className={`mr-auto font-bold ${teacher.color}`}>{teacher.rank}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HighestRevenue;
