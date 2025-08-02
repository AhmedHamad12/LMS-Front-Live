import { Outlet } from "react-router-dom";
import StudentsSideBar from "../../components/students/StudentsSideBar";

function Students() {
  return (
    <div className="flex m-0">
      <StudentsSideBar />
      <div className="flex-1 mr-20 lg:mr-64">
        <Outlet />
      </div>
    </div>
  );
}

export default Students;
