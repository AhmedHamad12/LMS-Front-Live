import React, { useEffect, useState } from 'react';
import api from "../../api/axios.js"
import toast from 'react-hot-toast';

const ApprovalCenter = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    // TODO: Replace with actual API call 


    try {
      const response = await api.get("/api/Teacher/GetPendingTeachers")
      setRequests(response.data);

    } catch (error) {
      toast.error(error.response.data.slice(0,-1))
      
    }

  };

  
  useEffect(() => {
    
 

    fetchRequests();
  }, []);

  const handleApprove = async (teacherId,fname,lname) => {
    console.log(teacherId);
    
    
    try {
       const response = await api.put(`/api/Teacher/ApprovedTeacherByAdmin?teacherId=${teacherId}`)
       setRequests((prev) => prev.filter((r) => r.id !== teacherId));
//optimistic update
      

       toast.success(`successfully APPROVED ${fname}`)
    } catch (error) {
      toast.error("an error occurred")
    }
    
    

  };

  const handleReject = async (teacherId,fname,lname) => {
    try {
      const response = await api.put(`/api/Teacher/RejectTeacherByAdmin?teacherId=${teacherId}`)
      setRequests((prev) => prev.filter((r) => r.id !== teacherId));
//optimistic update 
     

      toast.success(`successfully REJECTED ${fname}`)

   } catch (error) {
     toast.error("an error occurred")
   }
   
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
                  src={req.path}
                  alt="avatar"
                  className="w-10 h-10 rounded-full ml-3"
                />
                <div>
                  <p className="font-bold text-white">{req.firstName} {req.lastName}</p>
                  <p
                    className={`text-xs 
                     text-purple-400
                    }`}
                  >
                    {/* {req.type === 'teacher'
                      ? `طلب انضمام مدرس ${req.subject}`
                      : `كورس جديد من ${req.teacher}`} */}
                      طلب انضمام مدرس {req.subject}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleReject(req.id,req.firstName,req.lastName)}
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
                  onClick={() => handleApprove(req.id,req.firstName,req.lastName)}
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
