import { Outlet } from "react-router-dom";
import StudentsSideBar from "../../Components/students/StudentsSideBar";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import { Cookies } from "react-cookie";
import UnauthorizedPage from "../../Components/UnAuthorized";

function Students() {
  const cookies = new Cookies();
  const token = cookies.get("token");

  const fetchUser = async () => {
    return await axios
      .get("/api/Account/GetCurrentUser", {
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.error("User data fetch error:", error);
      });
  };

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });

  console.log(user);

  return (
    <>
      {user?.data?.role === "Student" ? (
        <div className="flex m-0">
          <StudentsSideBar />
          <div className="flex-1 mr-20 lg:mr-64">
            <Outlet />
          </div>
        </div>
      ) : (
        <UnauthorizedPage />
      )}
    </>
  );
}

export default Students;
