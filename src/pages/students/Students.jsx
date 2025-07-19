import { Outlet } from "react-router-dom";
import StudentsSideBar from "../../components/students/StudentsSideBar";

function Students() {
  return (
    <div className="flex m-0">
      <StudentsSideBar />
      <Outlet className=""/>
    </div>
  );
}

export default Students;
