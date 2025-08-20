import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import api from "../../api/axios";
import toast from "react-hot-toast";

const MyExams = () => {
  const [filter, setFilter] = useState("new");
  const [showStartModal, setShowStartModal] = useState(false);
  const [showExamInterface, setShowExamInterface] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [answers, setAnswers] = useState([]);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setloading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [attemptId, setAttemptId] = useState(null)
  const [exams, setExams] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const canvasRef = useRef(null);
  const mainContentRef = useRef(null);

  const [timeLeft, setTimeLeft] = useState(null); // store remaining time in seconds
  const timerRef = useRef(null); // to keep track of interval

  useEffect(()=>{
   

    const fetchExams = async()=>{
      try {
        setloading(true)
        const response = await api.get("/api/Quiz/getQuizForStudent")
        const formattedExams = response.data.map((exam)=>(
          {
            id: exam.id,
            course:exam.courseName,//TODO:fix by backend
            title:exam.title,
            status:exam.status === 0 ? "new":exam.status === 1 ? "processing": "missed",
            questions:exam.questions,
            time:exam.time,
            points:exam.score,
            deadline:new Date(exam.deadline).toLocaleTimeString('ar-EG',{
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            rank:exam.rank,
          }
        ))
        setExams(formattedExams)
        console.log("exams",response.data);
        console.log("formattedExams",formattedExams);
        
        
      } catch (error) {
        console.log(error);
        
      }
      finally{
        setloading(false)
      }
    }
    fetchExams()

  },[])

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      clearInterval(timerRef.current);
      handleFinishExam();
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
  
    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleAnswerSelect = (questionId, idx, text) => {
    setSelectedAnswer(idx);
  
    setAnswers((prev) => {
      const existing = prev.find((ans) => ans.questionId === questionId);
  
      if (existing) {
        // replace old answer for this question
        return prev.map((ans) =>
          ans.questionId === questionId ? { questionId, answerIndex: idx, answerText: text } : ans
        );
      } else {
        // add new answer
        return [...prev, { questionId, answerIndex: idx, answerText: text }];
      }
    });
  };
  

  const selectedForThisQuestion = answers.find(
    (ans) => ans.questionId === questions[currentQuestionIndex].id
  );
  


  const filteredExams = exams.filter(
    (exam) => filter === "" || exam.status === filter
  );

  const prepareExam = (exam) => {
    setCurrentExam(exam);
    setShowStartModal(true);
  };

  const startExam = () => {
    setShowStartModal(false);
    setShowExamInterface(true);
    console.log("currentExam",currentExam);
    const getExamQuestions = async()=>{
      try {
        setloading(true)
        const response = await api.get(`/api/Quiz/${currentExam.id}/questions`)
        setQuestions(response.data)
        console.log("questions",response.data);
        
      } catch (error) {
        toast.error("حدث خطأ ما")
      }finally{
        setloading(false)
      }
    }
    getExamQuestions()

    
    setTimeLeft(currentExam.time * 60);

    const getAttemptId = async()=>{
      try {
        const response = await api.get(`/api/Quiz/${currentExam.id}/start`)
        setAttemptId(response.data.attemptId)
      } catch (error) {
        console.log(error);
        
      }
    }
    getAttemptId()

  };

  const handleFinishExam = async()=>{
    setShowExamInterface(false)
    console.log("answers",answers);
    
    const formattedAnswers = {
      quizId: currentExam.id,
      submitAnswerResponseDtos: answers.map((ans) => ({
        questionId: ans.questionId,
        selectedOptionId: ans.answerIndex, // index of selected option
        writtenText: ans.answerText || ""  // fallback for written answers
      }))
    };

    console.log("formatted answers ",formattedAnswers);

    try {
      const submitRes = await api.post("/api/Quiz/submit-answer",formattedAnswers)

      const finalizeRes = await api.post(`/api/Quiz/attempts/${attemptId}/finish`)
      
    toast.success("تم إرسال الإجابات وإنهاء المحاولة بنجاح!");

    } catch (error) {
      toast.error("حدث خطأ ما")
    }


    setCurrentQuestionIndex(0)
  }

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      new: { text: "جديد", classes: "text-yellow-300 bg-yellow-500/20" },
      graded: { text: "تم التقييم", classes: "text-green-300 bg-green-500/20" },
      missed: { text: "فائت", classes: "text-red-300 bg-red-500/20" },
      processing: { text: "قيد المعالجة", classes: "text-blue-300 bg-blue-500/20" },

    };

    const config = statusConfig[status];
    return (
      <span
        className={`text-xs font-bold px-2 py-1 rounded-full ${config.classes}`}
      >
        {config.text}
      </span>
    );
  };

  const ExamCard = ({ exam }) => (
    <div
      className={`backdrop-blur-lg bg-gradient-to-br from-slate-800/40 to-slate-900/50 border border-white/5 rounded-2xl p-6 flex flex-col justify-between transform hover:-translate-y-2 transition-transform duration-300 ${
        exam.status === "missed" ? "border-red-500/30" : ""
      }`}
    >
      <div>
        <div className="flex justify-between items-start">
          <p className="text-sm font-bold text-cyan-300">{exam.course}</p>
          <StatusBadge status={exam.status} />
        </div>
        <h3 className="text-xl font-bold text-white mt-1 mb-4">{exam.title}</h3>
        {exam.status === "new" && (
          <div className="text-sm text-yellow-400 flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>
              متاح حتى: <span className="font-bold">{exam.deadline}</span>
            </span>
          </div>
        )}
        <div className="border-t border-b border-white/5 py-4 my-4 flex justify-around text-center text-xs">
          <div>
            <p className="font-bold text-lg text-white">{exam.questions}</p>
            <p className="text-gray-400">سؤال</p>
          </div>
          <div>
            <p className="font-bold text-lg text-white">{exam.time}</p>
            <p className="text-gray-400">دقيقة</p>
          </div>
          <div>
            <p
              className={`font-bold text-lg ${
                exam.status === "missed" ? "text-red-400" : "text-white"
              }`}
            >
              {exam.points}
            </p>
            <p className="text-gray-400">نقطة</p>
          </div>
        </div>
        {exam.status === "graded" && (
          <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/40 to-slate-900/50 border border-white/5 rounded-lg p-3 text-center mb-6">
            <p className="text-sm text-gray-300">النتيجة</p>
            <p className="text-2xl font-black text-green-400">{exam.score}</p>
            <p className="text-xs text-green-400">ترتيبك: {exam.rank}</p>
          </div>
        )}
      </div>
      {exam.status === "new" && (
        <button
          onClick={() => prepareExam(exam)}
          className="w-full text-center block p-3 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors"
        >
          ابدأ المحاكاة
        </button>
      )}
      {exam.status === "graded" && (
        <button className="w-full text-center block p-3 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors">
          عرض التقرير
        </button>
      )}
      {exam.status === "missed" && (
        <button className="w-full text-center block p-3 rounded-lg bg-red-800/50 text-red-300 font-bold cursor-not-allowed">
          فات الموعد
        </button>
      )}
    </div>
  );

  const FilterButton = ({ value, children, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
        isActive
          ? "bg-cyan-500 text-black"
          : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );

  const NavItem = ({ href, icon, label, isActive = false }) => (
    <a
      href={href}
      className={`flex items-center justify-center lg:justify-start p-3 rounded-lg transition-colors ${
        isActive
          ? "bg-cyan-500/20 text-white font-bold"
          : "text-gray-300 hover:bg-white/10"
      }`}
      title={label}
    >
      {icon}
      <span className="hidden lg:inline mr-3">{label}</span>
    </a>
  );

  return (
    <div
      className=" text-gray-100 min-h-screen overflow-hidden w-full"
      style={{ fontFamily: "Cairo, sans-serif" }}
    >
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-screen -z-10"
      />

      {/* Start Exam Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/40 to-slate-900/50 border border-yellow-500/30 rounded-2xl w-full max-w-lg text-center p-8 shadow-2xl shadow-yellow-500/10">
            <svg
              className="w-16 h-16 mx-auto text-yellow-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">
              تنبيه قبل بدء الامتحان!
            </h2>
            <p className="text-gray-300 mb-6">
              أنت على وشك بدء امتحان '{currentExam?.title}'.
            </p>
            <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/40 to-slate-900/50 border border-white/5 rounded-lg p-4 space-y-3 text-sm text-gray-300 mb-6">
              <p>
                » هذا الامتحان متاح حتى:{" "}
                <span className="font-bold text-white">
                  {currentExam?.deadline}
                </span>
                .
              </p>
              <p>
                » مدة الامتحان الفعلية:{" "}
                <span className="font-bold text-white">
                  {currentExam?.time} دقيقة
                </span>
                .
              </p>
              <p>» لا يمكنك إيقاف المؤقت بعد البدء.</p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowStartModal(false)}
                className="px-8 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={startExam}
                className="px-8 py-2 rounded-lg bg-yellow-400 text-black hover:bg-yellow-300 transition-colors font-bold"
              >
                ابدأ الامتحان الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Interface */}
      {showExamInterface && (
  <div className="fixed inset-0 bg-black z-40 flex flex-col">
    <header className="p-4 flex-shrink-0 backdrop-blur-lg bg-gradient-to-br from-slate-800/40 to-slate-900/50 border border-white/5 flex justify-between items-center border-b border-white/5">
      <div>
        <p className="text-sm text-cyan-300">{currentExam?.course}</p>
        <h2 className="text-xl font-bold text-white">{currentExam?.title}</h2>
      </div>
      <div className="text-center">
        <p className="text-sm text-red-400">الوقت المتبقي</p>
        <p className="text-2xl font-bold font-mono">
  {timeLeft !== null ? formatTime(timeLeft) : `${currentExam?.time}:00`}
</p>

      </div>
    </header>

    <div className="flex-grow p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl">
        {questions.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="font-bold">
                السؤال {currentQuestionIndex + 1} من {questions.length}
              </p>
              <div className="w-1/2 h-2 bg-gray-700 rounded-full">
                <div
                  className="h-2 bg-cyan-400 rounded-full"
                  style={{
                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/40 to-slate-900/50 border border-white/5 p-8 rounded-lg">
              <p className="text-xl font-bold leading-relaxed mb-8">
                {questions[currentQuestionIndex].text}
              </p>

              {/* optional image */}
              {questions[currentQuestionIndex].imageUrl && (
                <img
                  src={questions[currentQuestionIndex].imageUrl}
                  alt="question"
                  className="mb-6 rounded-lg"
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions[currentQuestionIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      handleAnswerSelect(
                        questions[currentQuestionIndex].id,
                        idx,
                        opt.text
                      )
                    }
                    
                    className={`p-4 rounded-lg border text-right transition-colors ${
                      selectedForThisQuestion?.answerIndex === idx
                        ? "bg-cyan-500/20 border-cyan-500"
                        : "border-gray-600 hover:bg-cyan-500/10 hover:border-cyan-500/40"
                    }`}
                    
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>

    <footer className="p-4 flex-shrink-0 backdrop-blur-lg bg-gradient-to-br from-slate-800/40 to-slate-900/50 border border-white/5 flex justify-center items-center border-t gap-5 border-white/5">
      <button
        onClick={() => handleFinishExam()}
        className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors font-bold"
      >
        إنهاء وتسليم الإجابات
      </button>

      <button
        disabled={currentQuestionIndex === questions.length - 1}
        onClick={() =>
          setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1))
        }
        className="px-6 py-2 rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 transition-colors font-bold disabled:opacity-50"
      >
        السؤال التالي
      </button>
      <button
        disabled={currentQuestionIndex === 0}
        onClick={() =>
          setCurrentQuestionIndex((prev) => Math.min(prev - 1, questions.length - 1))
        }
        className="px-6 py-2 rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 transition-colors font-bold disabled:opacity-50"
      >
        السؤال السابق
      </button>
    </footer>
  </div>
)}

      <div className="flex h-screen w-full">
        {/* Main Content */}
        <main
          ref={mainContentRef}
          className="flex-1 p-8 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#00BFFF rgba(0,0,0,0.2)",
          }}
        >
          <style jsx>{`
            main::-webkit-scrollbar {
              width: 6px;
            }
            main::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.2);
            }
            main::-webkit-scrollbar-thumb {
              background: #00bfff;
              border-radius: 10px;
            }
            main::-webkit-scrollbar-thumb:hover {
              background: #009acd;
            }
          `}</style>

          <h1
            className="text-4xl font-black text-white mb-2"
            style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}
          >
            غرفة محاكاة الامتحانات
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            استعد لاختبار قدراتك في مهام معرفية عالية المستوى.
          </p>

          {/* Filter Buttons */}
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <FilterButton
              value="new"
              isActive={filter === "new"}
              onClick={() => setFilter("new")}
            >
              امتحانات جديدة
            </FilterButton>
            <FilterButton
              value="graded"
              isActive={filter === "graded"}
              onClick={() => setFilter("graded")}
            >
                         
              امتحانات منجزة
            </FilterButton>
            <FilterButton
              value="processing"
              isActive={filter === "processing"}
              onClick={() => setFilter("processing")}
            > 
              امتحانات قيد المعالجة
            </FilterButton>
            <FilterButton
              value="missed"
              isActive={filter === "missed"}
              onClick={() => setFilter("missed")}
            >
              امتحانات فائتة
            </FilterButton>
            <FilterButton
              value=""
              isActive={filter === ""}
              onClick={() => setFilter("")}
            >
              الكل
            </FilterButton>
          </div>

          {/* Exams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}

            {/* No results message */}
            {filteredExams.length === 0 && (
              <div className="md:col-span-2 xl:col-span-3 text-center py-16">
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
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  ></path>
                </svg>
                <h3 className="text-xl font-bold text-white">
                  لا توجد امتحانات في هذا التصنيف
                </h3>
                <p className="text-gray-400">استعد جيدًا للمهام القادمة!</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyExams;
