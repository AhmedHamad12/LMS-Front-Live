import React, { useEffect, useState } from "react";

const RecentUsers = () => {
  const [users, setUsers] = useState([]);

  // Simulate API call
  useEffect(() => {
    // TODO: Replace with real API call
    const fetchUsers = async () => {
      const fakeUsers = [
        {
          id: 1,
          name: "علي حسن",
          avatar: "https://placehold.co/40x40/ffffff/000000?text=ع",
          role: "طالب",
          roleColor: "text-gray-400",
        },
        {
          id: 2,
          name: "هناء مصطفى",
          avatar: "https://placehold.co/40x40/ffffff/000000?text=هـ",
          role: "طالب",
          roleColor: "text-gray-400",
        },
        {
          id: 3,
          name: "أ. نانسي عجرم",
          avatar: "https://placehold.co/40x40/000000/ffffff?text=أ.ن",
          role: "مدرس (في الانتظار)",
          roleColor: "text-cyan-400",
        },
      ];

      setUsers(fakeUsers);
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">آخر المنضمين للمجرّة</h2>

      <div className="glass-effect rounded-2xl p-4 space-y-3">
        {users.length === 0 ? (
          <p className="text-sm text-gray-400">لا يوجد مستخدمون جدد حالياً.</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="p-3 flex items-center justify-between bg-white/5 rounded-lg"
            >
              <div className="flex items-center">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full ml-3"
                />
                <p className="font-bold text-white">{user.name}</p>
              </div>
              <p className={`text-sm ${user.roleColor}`}>{user.role}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentUsers;
