import {
  Button,
  TextField,
  Typography,
  Paper,
  Box,
  Snackbar,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../config/UserStore";
import Alert from "@mui/material/Alert";
import "../../styles/LoginForm.css";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const { setUserInfo } = useUser();

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    document.body.classList.add("login-bg");
    return () => {
      document.body.classList.remove("login-bg");
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        username: username,
        password: password,
      });
      setUserInfo({
        id: res.data.id,
        username: res.data.username,
        email: res.data.email,
      });
      localStorage.setItem("token", res.data.token);
      setTimeout(() => {
        navigate("/");
      }, 1000);
      showSnackbar("Successfully logined", "success");
    } catch (err) {
      showSnackbar("Error", "error");
    }
  };

  return (
    <Box className="loginform-root">
      <Paper elevation={8} className="loginform-paper">
        <Typography
          variant="h5"
          fontWeight={700}
          color="primary"
          mb={2}
          align="center"
        >
          Login
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            onChange={(e) => setUsername(e.target.value)}
            id="login-username"
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            autoComplete="username"
            required
          />
          <TextField
            onChange={(e) => setPassword(e.target.value)}
            id="login-password"
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type="password"
            autoComplete="current-password"
            required
          />
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                borderRadius: 2,
                px: 4,
                fontWeight: 600,
                background: "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)",
                color: "#fff",
                boxShadow: "0 2px 8px rgba(67,233,123,0.12)",
              }}
            >
              Login
            </Button>
          </Box>
        </form>
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2">
            Don't have an account?{" "}
            <span
              style={{
                color: "#1976d2",
                cursor: "pointer",
                fontWeight: 500,
              }}
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </Typography>
        </Box>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
