import { Button, TextField, Typography, Paper, Box } from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import "../../styles/RegisterForm.css";

export default function RegisterForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    document.body.classList.add("login-bg");
    return () => {
      document.body.classList.remove("login-bg");
    };
  }, []);

  const handleSign = async () => {
    if (!email || !username || !password) {
      showSnackbar("Please fill all blanks", "warning");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/register",
        {
          email: email,
          username: username,
          password: password,
        }
      );
      showSnackbar("Succesfully registered", "success");
      setTimeout(() => {
        navigate("/login");
      }, 400)
    } catch (err) {
      showSnackbar("Register failed.", "error");
      console.error(err);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  return (
    <Box className="registerform-root">
      <Paper elevation={8} className="registerform-paper">
        <Typography
          variant="h5"
          fontWeight={700}
          color="primary"
          mb={2}
          align="center"
        >
          Kayıt Ol
        </Typography>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSign();
          }}
        >
          <TextField
            id="register-email"
            onChange={(e) => setEmail(e.target.value)}
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            autoComplete="email"
            required
          />
          <TextField
            id="register-username"
            onChange={(e) => setUsername(e.target.value)}
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            autoComplete="username"
            required
          />
          <TextField
            id="register-password"
            onChange={(e) => setPassword(e.target.value)}
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type="password"
            autoComplete="new-password"
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
              Register
            </Button>
          </Box>
        </form>
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2">
            Already have an account?{" "}
            <span
              style={{ color: "#1976d2", cursor: "pointer", fontWeight: 500 }}
              onClick={() => navigate("/login")}
            >
              Login
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
