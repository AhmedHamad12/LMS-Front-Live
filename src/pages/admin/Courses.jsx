import React, { useMemo, useState } from "react";

const sampleCourses = [
  {
    id: 1,
    title: "الفيزياء الكونية",
    teacher: "أ. خالد صقر",
    students: 1345,
    status: "active",
    lastUpdate: "منذ 3 أيام",
    isInactive: false,
  },
  {
    id: 2,
    title: "رياضيات الفضاء",
    teacher: "أ. منى علي",
    students: 950,
    status: "active",
    lastUpdate: "منذ أسبوع",
    isInactive: false,
  },
  {
    id: 3,
    title: "الكيمياء الفلكية",
    teacher: "أ. أحمد السيد",
    students: 810,
    status: "active",
    lastUpdate: "منذ 45 يومًا",
    isInactive: true,
  },
  {
    id: 4,
    title: "الأحياء الفضائية",
    teacher: "أ. حسن محمود",
    students: 520,
    status: "pending",
    lastUpdate: "منذ يومين",
    isInactive: false,
  },
  {
    id: 5,
    title: "أساسيات البرمجة",
    teacher: "أ. سارة إبراهيم",
    students: 780,
    status: "suspended",
    lastUpdate: "منذ شهرين",
    isInactive: true,
  },
];

const Courses = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState(sampleCourses); // TODO: Replace with API

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesFilter =
        filter === "all" || course.status === filter;
      const matchesSearch =
        search === "" ||
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.teacher.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [courses, filter, search]);

  return (
    <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
      <h1 className="text-4xl font-black text-white mb-2 title-glow">
         الكورسات
      </h1>
      <p className="text-gray-400 text-lg mb-8">
        متابعة دقيقة لكل الكورسات في المنصة.
              </p>

      {/* Search and Filter */}
      <div className="glass-effect rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم الكورس أو المدرس..."
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
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { value: "all", label: "الكل" },
            { value: "active", label: "نشط" },
            { value: "pending", label: "قيد المراجعة" },
            { value: "suspended", label: "معلّق" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-2 rounded-lg font-bold text-xs transition-colors ${
                filter === value
                  ? "bg-cyan-500 text-black"
                  : "bg-white/10 text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Table */}
      <div className="glass-effect rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-right">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 font-bold">اسم الكورس</th>
              <th className="px-6 py-3 font-bold">المدرس</th>
              <th className="px-6 py-3 font-bold">عدد الطلاب</th>
              <th className="px-6 py-3 font-bold">آخر تحديث</th>
              <th className="px-6 py-3 font-bold">الحالة</th>
              <th className="px-6 py-3 font-bold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => (
              <tr
                key={course.id}
                className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                  course.isInactive ? "bg-red-900/20 hover:bg-red-900/30" : ""
                }`}
              >
                <td className="px-6 py-4 font-bold">{course.title}</td>
                <td className="px-6 py-4 text-gray-300">{course.teacher}</td>
                <td className="px-6 py-4 font-mono">{course.students}</td>
                <td
                  className={`px-6 py-4 ${
                    course.isInactive ? "text-red-400" : ""
                  }`}
                >
                  {course.lastUpdate}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      course.status === "active"
                        ? "bg-green-500/20 text-green-300"
                        : course.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {course.status === "active"
                      ? "نشط"
                      : course.status === "pending"
                      ? "قيد المراجعة"
                      : "معلّق"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <button title="عرض الكورس">
                      <svg
                        className="w-5 h-5 text-gray-400 hover:text-cyan-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <button title="تعليق الكورس">
                      <svg
                        className="w-5 h-5 text-gray-400 hover:text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
                    </button>
                    <button title="حذف الكورس">
                      <svg
                        className="w-5 h-5 text-gray-400 hover:text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <svg
              className="w-16 h-16 mx-auto text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-xl font-bold text-white">
              لا توجد كورسات تطابق بحثك
            </h3>
            <p className="text-gray-400">حاول تغيير كلمات البحث أو الفلتر.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Courses;
