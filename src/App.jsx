import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import LeaderboardPage from "./pages/students/LeaderboardPage.jsx";
// Contexts & Auth
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { useAuth } from "./hooks/useAuth";
import { setUnauthorizedHandler } from "./api/axios";
import UnauthorizedOverlay from "./Components/Auth/UnauthorizedOverlay";
import QuizReportPage from "./pages/students/QuizReportPage.jsx";
// UI & Components
import BackgroundAnimation from "./Components/BackgroundAnimation";
import ProtectedRoute from "./Components/ProtectedRoute";
// Pages - Teacher
import Teacher from "./pages/teacher/Teacher";

import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherStudents from "./pages/teacher/Students";
import Earn from "./pages/teacher/Earn";
import CourseManagement from "./pages/teacher/CourseManagement";
import AddLesson from "./pages/teacher/AddLesson";
import AddCourse from "./pages/teacher/AddCourse";
import AddChapter from "./pages/teacher/AddChapter";
import Quizzes from "./pages/teacher/Quizzes";
import Questions from "./pages/teacher/Questions";
import CreateQuiz from "./pages/teacher/CreateQuiz";
import Submissions from "./pages/teacher/Submissions";
import DetailedSubmissions from "./pages/teacher/DetailedSubmissions.jsx";
import AddAssignment from "./pages/teacher/AddAssignment";
import ExamAttempt from "./pages/students/ExamAttempt.jsx";
// Pages - Students
import Students from "./pages/students/Students";
import AllCourses from "./pages/students/AllCourses";
import Course from "./pages/students/Course";
import CourseData from "./pages/students/CourseData";
import MyTasks from "./pages/students/MyTasks";
import MyExams from "./pages/students/MyExams";
import Rewards from "./pages/students/Rewards";
import Dashboard from "./pages/students/Dashboard";
import MyCourses from "./pages/students/MyCourses";
import Profile from "./pages/students/Profile";
import Prize from "./pages/students/Prize";

// Pages - Admin
import Admin from "./pages/admin/Admin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Courses from "./pages/admin/Courses";
import Reports from "./pages/admin/Reports";

// Pages - Auth
import Login from "./pages/auth/Login";
import AddStudent from "./pages/auth/AddStudent";
import AddTeacher from "./pages/auth/AddTeacher";
import StudentRegister from "./pages/auth/StudentRegister";
import TeacherSignup from "./pages/auth/TeacherSignup";
import LoginAdmin from "./pages/auth/LoginAdmin";
import Email from "./pages/auth/Reset password/Email";
import OTP from "./pages/auth/Reset password/OTP";
import ResetPassword from "./pages/auth/Reset password/ResetPassword";


// Pages - Others
import Home from "./pages/Home";
import AIPage from "./pages/AIPage";
import NotFoundPage from "./Components/NotFound.jsx";
import LessonData from "./pages/teacher/LessonData.jsx";
import UpdateLesson from "./pages/teacher/UpdateLesson.jsx";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import Waiting from "./pages/teacher/Waiting.jsx";
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherAssignments from "./pages/teacher/TeacherAssignments.jsx";
import AssignmentSubmissions from "./pages/teacher/AssignmentSubmissions.jsx";
import CoursePreview from "./pages/teacher/CoursePreview.jsx";
import AllTeachers from "./pages/students/Teachers.jsx";
import MyTeacherProfile from "./pages/teacher/profile.jsx";
import MyStudentProfile from "./pages/students/Profile";
import CoursePlayerPage from "./pages/students/Course";
import StudentProfileCompletionGuard from "./Components/StudentProfileCompletionGuard.jsx";
// Wire auth context with axios

const AuthInitializer = () => {
  const { showUnauthorizedOverlay } = useAuth();

  useEffect(() => {
    setUnauthorizedHandler(showUnauthorizedOverlay);
  }, [showUnauthorizedOverlay]);

  return null;
};


function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>

      <GoogleReCaptchaProvider reCaptchaKey="6LcoPL0rAAAAAO7qYR94bHWxlml-PK7KzzEtj2rR">
        <AuthProvider>
          <AuthInitializer />
          <BackgroundAnimation />
          <BrowserRouter>
            <Routes>
              {/* General */}
              <Route path="/" element={<Home />} />
              <Route path="/ai" element={<AIPage />} />
              <Route path="/waiting" element={<Waiting />} />
              <Route path="/coursepreview/:courseId" element={<CoursePreview />} />
              <Route path="/teacherProfile/:teacherId" element={<TeacherProfile />} />
              
              {/* Teacher */}
              <Route element={<ProtectedRoute />}>
              <Route path="/teacher" element={<Teacher />}>
                <Route path="addlesson" element={<AddLesson />} />
                <Route path="addchapter" element={<AddChapter />} />
                <Route path="addcourse" element={<AddCourse />} />
                <Route path="lesson" element={<LessonData />} />
                <Route path="updateLesson" element={<UpdateLesson />} />
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="teacherstudents" element={<TeacherStudents />} />
                <Route path="course/mange" element={<CourseManagement />} />
                <Route path="earn" element={<Earn />} />
                <Route path="add/assignment" element={<AddAssignment />} />
                <Route path="quizzes" element={<Quizzes />} />
                <Route path="quizzes/create" element={<CreateQuiz />} />
                <Route path="profile" element={<TeacherProfile />} />
                <Route path="Myprofile" element={<MyTeacherProfile />} />
                <Route path="assignments" element={<TeacherAssignments />} />
                <Route 
          path="/teacher/assignments/:assignmentId/submissions" 
          element={<AssignmentSubmissions />} 
        />
                <Route
                  path="quizzes/:quizId/questions"
                  element={<Questions />}
                />
                <Route
                  path="quizzes/:quizId/submissions"
                  element={<Submissions />}
                />
                <Route
                  path="quizzes/:quizId/submissions/:submissionId"
                  element={<DetailedSubmissions />}
                />
              </Route>
              </Route>

              {/* Reset Password */}
              <Route path="/reset/email" element={<Email />} />
              <Route path="/reset/check-code" element={<OTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Students */}
                <Route element={<StudentProfileCompletionGuard />}>
                <Route path="course" element={<Course />} />
                <Route path="/student" element={<Students />}>
                <Route path="allcourses" element={<AllCourses />} />
                <Route path="course/data/:courseId" element={<CoursePlayerPage />} />
                <Route path="mytasks" element={<MyTasks />} />
                <Route path="myexams" element={<MyExams />} />
                <Route path="rewards" element={<Rewards />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="mycourses" element={<MyCourses />} />
                <Route path="profile" element={<MyStudentProfile />} />
                <Route path="exam/:examId" element={<ExamAttempt />} />
                <Route path="prize" element={<Prize />} />
                <Route path="teachers" element={<AllTeachers />} />
                <Route path="quiz/report/:attemptId" element={<QuizReportPage />} />
                 <Route path="leaderboard" element={<LeaderboardPage />} />
                 </Route>
              </Route>

              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/add-student" element={<AddStudent />} />
              <Route path="/add-teacher" element={<AddTeacher />} />
              <Route path="/student-signup" element={<StudentRegister />} />
              <Route path="/teacher-signup" element={<TeacherSignup />} />
              <Route path="/login-admin" element={<LoginAdmin />} />

              {/* Admin */}
              <Route path="/admin" element={<Admin />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="courses" element={<Courses />} />
                <Route path="reports" element={<Reports />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>

            <UnauthorizedOverlay />
          </BrowserRouter>
          <Toaster />
          {/* <ReactQueryDevtools initialIsOpen={false} position="bottom-right" /> */}
        </AuthProvider>
      </GoogleReCaptchaProvider>

    </QueryClientProvider>
  );
}

export default App;
