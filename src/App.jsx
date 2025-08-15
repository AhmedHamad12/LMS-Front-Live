import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
// import CourseManagement from "./pages/teacher/CourseManagement";
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherStudents from "./pages/teacher/Students";
import Earn from "./pages/teacher/Earn";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Admin from "./pages/admin/Admin";
import Users from "./pages/admin/Users";
import Courses from "./pages/admin/Courses";
import Reports from "./pages/admin/Reports";
import BackgroundAnimation from "./Components/BackgroundAnimation";
import AllCourses from "./pages/students/AllCourses";
import Course from "./pages/students/Course";
import MyTasks from "./pages/students/MyTasks";
import MyExams from "./pages/students/MyExams";
import Rewards from "./pages/students/Rewards";
import Students from "./pages/students/Students";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import AddStudent from "./pages/auth/AddStudent";
import AddTeacher from "./pages/auth/AddTeacher";
import StudentRegister from "./pages/auth/StudentRegister";
import TeacherSignup from "./pages/auth/TeacherSignup";
import LoginAdmin from "./pages/auth/LoginAdmin";
import Dashboard from "./pages/students/Dashboard";
import MyCourses from "./pages/students/MyCourses";
import Profile from "./pages/students/Profile";
import Prize from "./pages/students/Prize";

import { Toaster } from "react-hot-toast";
import Email from "./pages/auth/Reset password/Email";
import OTP from "./pages/auth/Reset password/OTP";
import ResetPassword from "./pages/auth/Reset password/ResetPassword";
import Quizzes from "./pages/teacher/Quizzes";
import Questions from "./pages/teacher/Questions";
import CreateQuiz from "./pages/teacher/CreateQuiz";
import Submissions from "./pages/teacher/Submissions";
import AddLesson from "./pages/teacher/AddLesson";
import AddCourse from "./pages/teacher/AddCourse";
import AddChapter from "./pages/teacher/AddChapter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import CourseManagement from "./pages/teacher/CourseManagement";
import CourseData from "./pages/students/CourseData";
import Teacher from "./pages/teacher/Teacher";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import UnauthorizedOverlay from "./Components/Auth/UnauthorizedOverlay";
import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { setUnauthorizedHandler } from "./api/axios";
import DetailedSubmissions from "./pages/teacher/DetailedSubmissions.jsx";

// Component to wire up the auth context with axios
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
      <AuthProvider>
        <AuthInitializer />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/teacher" element={<Teacher />}>
              <Route
                path="addlesson/:courseId/:chapterId"
                element={<AddLesson />}
              />
              <Route path={`addchapter/:courseId`} element={<AddChapter />} />
              <Route path="addcourse" element={<AddCourse />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="teacherstudents" element={<TeacherStudents />} />
              <Route
                path="course/mange/:courseId"
                element={<CourseManagement />}
              />
              <Route path="earn" element={<Earn />} />
              <Route path="quizzes" element={<Quizzes />} />
              <Route path="quizzes/create" element={<CreateQuiz />} />
              <Route path="quizzes/:quizId/questions" element={<Questions />} />
              <Route path="quizzes/:quizId/submissions" element={<Submissions />} />
              <Route path="quizzes/:quizId/submissions/:submissionId" element={<DetailedSubmissions />} />


              
            </Route>

            <Route path="/reset/email" element={<Email />} />
            <Route path="/reset/check-code" element={<OTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/students" element={<Students />}>
              <Route path="allcourses" element={<AllCourses />} />
              <Route path="course" element={<Course />} />
              <Route path="course/data/:courseId" element={<CourseData />} />
              <Route path="mytasks" element={<MyTasks />} />
              <Route path="myexams" element={<MyExams />} />
              <Route path="rewards" element={<Rewards />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="mycourses" element={<MyCourses />} />
              <Route path="profile" element={<Profile />} />
              <Route path="prize" element={<Prize />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/add-student" element={<AddStudent />} />
            <Route path="/add-teacher" element={<AddTeacher />} />
            <Route path="/student-signup" element={<StudentRegister />} />
            <Route path="/teacher-signup" element={<TeacherSignup />} />
            <Route path="/login-admin" element={<LoginAdmin />} />

            <Route path="/admin" element={<Admin />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="courses" element={<Courses />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Routes>
          <UnauthorizedOverlay />
        </BrowserRouter>
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
