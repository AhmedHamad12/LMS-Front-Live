import React, { useState, useMemo } from 'react';

const initialUsers = [
  { id: 1, name: 'خالد علي', email: 'khaled.ali@email.com', avatar: 'https://placehold.co/40x40/ffffff/000000?text=خ', role: 'student', status: 'active', joined: '2024-05-10' },
  { id: 2, name: 'أ. خالد صقر', email: 'khaled.sakr@email.com', avatar: 'https://placehold.co/40x40/000000/ffffff?text=أ.خ', role: 'teacher', status: 'active', joined: '2024-02-01' },
  { id: 3, name: 'سارة القحطاني', email: 'sara.q@email.com', avatar: 'https://placehold.co/40x40/ffffff/000000?text=س', role: 'student', status: 'active', joined: '2024-03-22' },
  { id: 4, name: 'أ. منى علي', email: 'mona.ali@email.com', avatar: 'https://placehold.co/40x40/000000/ffffff?text=أ.م', role: 'teacher', status: 'active', joined: '2024-03-15' },
  { id: 5, name: 'ياسر محمد', email: 'yasser.m@email.com', avatar: 'https://placehold.co/40x40/ffffff/000000?text=ي', role: 'student', status: 'banned', joined: '2024-04-05' },
];

const Users = () => {

    //TODO: API Call here , and methods for edit delete and Block Unlbock



  const [users] = useState(initialUsers);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      (filter === 'all' || user.role === filter || user.status === filter) &&
      (search === '' || user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()))
    );
  }, [users, filter, search]);

  return (
    <main id="main-content" className="flex-1 p-8 overflow-y-auto custom-scrollbar">
      <h1 className="text-4xl font-black text-white mb-2 title-glow">إدارة المستخدمين</h1>
      <p className="text-gray-400 text-lg mb-8">تحكم كامل في جميع أفراد طاقم المجرّة.</p>

      {/* Search & Filters */}
      <div className="glass-effect rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
            className="w-full search-input rounded-lg p-3 pr-10 focus:outline-none"
          />
          <svg className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'student', 'teacher', 'banned'].map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-2 rounded-lg font-bold text-xs transition-colors ${
                filter === key ? 'bg-cyan-500 text-black' : 'bg-white/10 text-white'
              }`}
            >
              {key === 'all' ? 'الكل' : key === 'student' ? 'الطلاب فقط' : key === 'teacher' ? 'المدرسون فقط' : 'المحظورون'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-effect rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-right">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 font-bold">المستخدم</th>
              <th className="px-6 py-3 font-bold">البريد الإلكتروني</th>
              <th className="px-6 py-3 font-bold">الدور</th>
              <th className="px-6 py-3 font-bold">الحالة</th>
              <th className="px-6 py-3 font-bold">تاريخ الانضمام</th>
              <th className="px-6 py-3 font-bold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img src={user.avatar} className="w-10 h-10 rounded-full ml-3" alt={user.name} />
                      <span className="font-bold">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      user.role === 'student' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {user.role === 'student' ? 'طالب' : 'مدرس'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 text-xs font-bold ${
                      user.status === 'active' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        user.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      {user.status === 'active' ? 'نشط' : 'محظور'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{user.joined}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button title="تعديل">
                        <svg className="w-5 h-5 text-gray-400 hover:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button title="حظر/إلغاء الحظر">
                        <svg className="w-5 h-5 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                      <button title="حذف">
                        <svg className="w-5 h-5 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-16">
                  <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-xl font-bold text-white">لا يوجد مستخدمون يطابقون بحثك</h3>
                  <p className="text-gray-400">حاول تغيير كلمات البحث أو الفلتر.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Users;
