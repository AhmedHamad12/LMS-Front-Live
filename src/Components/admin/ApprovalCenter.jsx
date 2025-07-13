import React, { useEffect, useState } from 'react';

const ApprovalCenter = () => {
  const [requests, setRequests] = useState([]);

  
  useEffect(() => {
    
    const fetchRequests = async () => {
      // TODO: Replace with actual API call 


      const fakeData = [
        {
          id: 1,
          type: 'teacher',
          name: 'أ. مروان علي',
          subject: 'كيمياء',
          avatar: 'https://placehold.co/40x40/ffffff/000000?text=م',
        },
        {
          id: 2,
          type: 'course',
          name: 'مبادئ الجيولوجيا',
          teacher: 'أ. هاني رمزي',
          avatar: 'https://placehold.co/40x40/ffffff/000000?text=ج',
        },
      ];

      setRequests(fakeData);
    };

    fetchRequests();
  }, []);

  const handleApprove = (id) => {
    // TODO: Call approve API
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const handleReject = (id) => {
    // TODO: Call reject API
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">مركز الموافقات</h2>

      <div className="glass-effect rounded-2xl p-4 space-y-3">
        {requests.length === 0 ? (
          <p className="text-sm text-gray-400">
            لا توجد طلبات جديدة في انتظار المراجعة.
          </p>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="p-3 flex items-center justify-between bg-white/5 rounded-lg"
            >
              <div className="flex items-center">
                <img
                  src={req.avatar}
                  alt="avatar"
                  className="w-10 h-10 rounded-full ml-3"
                />
                <div>
                  <p className="font-bold text-white">{req.name}</p>
                  <p
                    className={`text-xs ${
                      req.type === 'teacher'
                        ? 'text-cyan-400'
                        : 'text-purple-400'
                    }`}
                  >
                    {req.type === 'teacher'
                      ? `طلب انضمام مدرس ${req.subject}`
                      : `كورس جديد من ${req.teacher}`}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleReject(req.id)}
                  className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40"
                  title="رفض"
                >
                  <svg
                    className="w-5 h-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
                <button
                  onClick={() => handleApprove(req.id)}
                  className="p-2 rounded-full bg-green-500/20 hover:bg-green-500/40"
                  title="قبول"
                >
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApprovalCenter;
