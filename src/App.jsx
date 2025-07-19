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

function App() {
  return (
    <>

      <BackgroundAnimation/>

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
          <Route
            path="/teacher/earn"
            element={<Earn />}
          />


          <Route path="/admin" element={<Admin/>}>
              <Route path="dashboard" element={<AdminDashboard/>}/>
              <Route path="users" element={<Users/>}/>
              <Route path="courses" element={<Courses/>}/>
              <Route path="reports" element={<Reports/>}/>

          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
