import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CourseManagement from "./pages/teacher/CourseManagement";
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherStudents from "./pages/teacher/Students";
import Earn from "./pages/teacher/Earn";

function App() {
  return (
    <>
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
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
