import axios from "axios";
import React, { useState, useMemo, useEffect } from "react";
import { toast } from "react-hot-toast";

const Users = () => {
  //TODO: replace with token logic

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9naXZlbm5hbWUiOiJBaG1lZEhhbWFkIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoiYWhtZWRoYW1hZDk4NTVAZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWRtaW4iLCJleHAiOjE3NTU2OTc1ODQsImlzcyI6Imh0dHBzOi8vbG9jYWxob3N0OjcyNTEvIiwiYXVkIjoiTXlTZWN1cmVBdWRpZW5jZSJ9.gOEg747rgPOCyUlMgeHHNwrTjKsMMFOveFC1vw3VxQ4";

  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setloading] = useState(false);
  const [confirmDelete, setconfirmDelete] = useState({
    status: false,
    email: null,
  });

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        (filter === "all" || user.role === filter || user.status === filter) &&
        (search === "" ||
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()))
    );
  }, [users, filter, search]);

  useEffect(() => {
    //TODO: apply react query later , 
    const fetchUsers = async () => {
      setloading(true);

      try {
        const response = await toast.promise(
          axios.get("http://lms278.runasp.net/api/Account/GetAllUser", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          {
            loading: "جاري جلب المستخدمين...",
            success: "تم جلب المستخدمين بنجاح!",
            error: "فشل في جلب المستخدمين",
          }
        );

        setUsers(response.data);
      } catch (error) {
        console.error(error.response?.data || error.message);
      } finally {
        setloading(false);
      }
    };

    fetchUsers();
  }, []);

  //TODO: apply delete , block , edit logic if needed

  return (
    <main
      id="main-content"
      className="flex-1 p-8 overflow-y-auto custom-scrollbar"
    >
      <h1 className="text-4xl font-black text-white mb-2 title-glow">
        إدارة المستخدمين
      </h1>
      <p className="text-gray-400 text-lg mb-8">
        تحكم كامل في جميع أفراد طاقم المجرّة.
      </p>

      {/* Search & Filters */}
      <div className="glass-effect rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
            className="w-full search-input rounded-lg p-3 pr-10 focus:outline-none"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "Student", "Teacher", "Banned"].map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-2 rounded-lg font-bold text-xs transition-colors ${
                filter === key
                  ? "bg-cyan-500 text-black"
                  : "bg-white/10 text-white"
              }`}
            >
              {key === "all"
                ? "الكل"
                : key === "Student"
                ? "الطلاب فقط"
                : key === "Teacher"
                ? "المدرسون فقط"
                : "المحظورون"}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-effect rounded-2xl overflow-x-auto  ">
        <table className="w-full text-sm text-right  ">
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
              filteredUsers.map((user, index) => (
                <tr
                  key={index}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="font-bold">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        user.role === "Student"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-purple-500/20 text-purple-300"
                      }`}
                    >
                      {user.role === "Student" ? "طالب" : "مدرس"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`flex items-center gap-2 text-xs font-bold ${
                        user.status === "Active"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          user.status === "Active"
                            ? "bg-green-400"
                            : "bg-red-400"
                        }`}
                      />
                      {user.status === "Active" ? "نشط" : "محظور"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(user.acceptedAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 min-w-40">
                    {confirmDelete.status &&
                    confirmDelete.email === user.email ? (
                      // Show confirm/cancel ONLY for this row
                      <div className="flex  justify-start gap-2 min-w-20">
                        <button
                          className="p-2 rounded-md hover:bg-red-500/20 transition-colors"
                          title="تأكيد الحذف"
                          onClick={() => {
                            // You can add delete logic here
                            console.log("Deleting", user.email);
                            setconfirmDelete({ status: false, email: null });
                          }}
                        >
                          <svg
                            className="w-5 h-5 text-red-500 hover:text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                        <button
                          className="p-2 rounded-md hover:bg-gray-500/20 transition-colors"
                          title="إلغاء"
                          onClick={() =>
                            setconfirmDelete({ status: false, email: null })
                          }
                        >
                          <svg
                            className="w-5 h-5 text-gray-400 hover:text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      // Default buttons (Edit, Ban, Delete)
                      <div className="flex justify-start gap-2 min-w-20">
                        <button title="تعديل">
                          <svg
                            className="w-5 h-5 text-gray-400 hover:text-cyan-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button title="حظر/إلغاء الحظر">
                          <svg
                            className="w-5 h-5 text-gray-400 hover:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            setconfirmDelete({
                              status: true,
                              email: user.email,
                            })
                          }
                          title="حذف"
                        >
                          <svg
                            className="w-5 h-5 text-gray-400 hover:text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-16">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-600 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-white">
                    لا يوجد مستخدمون يطابقون بحثك
                  </h3>
                  <p className="text-gray-400">
                    حاول تغيير كلمات البحث أو الفلتر.
                  </p>
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
