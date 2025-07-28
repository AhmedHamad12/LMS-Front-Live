import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CourseManagement from "./pages/teacher/CourseManagement";
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
import { Toaster } from "react-hot-toast";
import Email from "./pages/auth/Reset password/Email";
import OTP from "./pages/auth/Reset password/OTP";
import ResetPassword from "./pages/auth/Reset password/ResetPassword";
import Quizzes from "./pages/teacher/Quizzes";
import Questions from "./pages/teacher/Questions";
import CreateQuiz from "./pages/teacher/CreateQuiz";

function App() {
  return (
    <>
      <BackgroundAnimation />


      <BrowserRouter>
        <Routes>
          <Route
            path="/teacher/coursemanagement"
            element={<CourseManagement />}
          />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route
            path="/teacher/teacherstudents"
            element={<TeacherStudents />} 
          />
          <Route path="/teacher/earn" element={<Earn />} />
          <Route path="/teacher/quizzes" element={<Quizzes/>}/>
          <Route path="/teacher/quizzes/create" element={<CreateQuiz/>}/>
          <Route path="/teacher/quizzes/:quizId/questions" element={<Questions/>}/>


          <Route path="/reset/email" element={<Email />} />
          <Route path="/reset/otp" element={<OTP />} />
          <Route path="/reset/new" element={<ResetPassword />} />

          <Route path="/students" element={<Students />}>
            <Route path="allcourses" element={<AllCourses />} />
            <Route path="course" element={<Course />} />
            <Route path="mytasks" element={<MyTasks />} />
            <Route path="myexams" element={<MyExams />} />
            <Route path="rewards" element={<Rewards />} />
          </Route>

          <Route path="/admin" element={<Admin />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="courses" element={<Courses />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
