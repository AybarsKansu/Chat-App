import { Button, Tooltip, Typography } from "@mui/material";
import { FaHome, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../config/UserStore";
import "../../styles/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { clearUser, user } = useUser();

  const handleLogout = () => {
    clearUser();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="navbar-root">
      <nav className="navbar-nav">
        <div className="navbar-left">
          <Tooltip title="Home">
            <Button
              onClick={() => navigate("/")}
              className="navbar-btn navbar-home"
              startIcon={<FaHome />}
            >
              Home
            </Button>
          </Tooltip>
        </div>
        <div className="navbar-right">
          <Tooltip title="Go to profile">
            <Button
              onClick={() => navigate("/profile")}
              className="navbar-btn"
              startIcon={<FaUser />}
            >
              {user.username
                ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
                : "Profile"}
            </Button>
          </Tooltip>
          <Tooltip title="Settings">
            <Button
              onClick={() => navigate("/settings")}
              className="navbar-btn"
              startIcon={<FaCog />}
            >
              Settings
            </Button>
          </Tooltip>
          <Tooltip title="Logout">
            <Button
              onClick={handleLogout}
              className="navbar-btn navbar-logout"
              startIcon={<FaSignOutAlt />}
            >
              Logout
            </Button>
          </Tooltip>
        </div>
      </nav>
    </div>
  );
}
