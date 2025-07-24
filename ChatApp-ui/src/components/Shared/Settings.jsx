import React, { useState } from "react";
import {
  Switch,
  FormControlLabel,
  Typography,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { useUser } from "../../config/UserStore";

function Settings() {
  const { user } = useUser();
  const token = localStorage.getItem("token");
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("tr");
  const [theme, setTheme] = useState("light");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  const handleDeleteAccount = async () => {
    const response = await axios.post(
      `http://localhost:8080/api/users/confirm-password/${user.id}`,
      {
        oldPassword: password,
        newPassword: "",
      },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      }
    );
    if (response.data) {
      await axios.delete(`http://localhost:8080/api/users/delete/${user.id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      showSnackbar("Account deleted", "success");
      localStorage.removeItem("token");
      navigate("/login");
    } else {
      showSnackbar("Wrong password", "error");
    }
  };
  return (
    <div
      style={{
        maxWidth: 500,
        margin: "60px auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        padding: 32,
        textAlign: "left",
        position: "relative",
      }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", left: 16, top: 16 }}
      >
        Back
      </Button>

      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        Ayarlar
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <FormControlLabel
        control={
          <Switch
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            color="primary"
          />
        }
        label="Open notifications"
      />

      <Divider sx={{ my: 3 }} />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="lang-label">Language</InputLabel>
        <Select
          labelId="lang-label"
          value={language}
          label="Dil"
          onChange={(e) => setLanguage(e.target.value)}
        >
          <MenuItem value="tr">Türkçe</MenuItem>
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="de">Deutsch</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="theme-label">Theme</InputLabel>
        <Select
          labelId="theme-label"
          value={theme}
          label="Tema"
          onChange={(e) => setTheme(e.target.value)}
        >
          <MenuItem value="light">Light</MenuItem>
          <MenuItem value="dark">Dark</MenuItem>
          <MenuItem value="system">System</MenuItem>
        </Select>
      </FormControl>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        About
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        ChatApp v1.0.0
        <br />
        Geliştirici: Aybars
        <br />
        <a href="mailto:destek@chatapp.com">destek@chatapp.com</a>
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Button
        variant="outlined"
        color="error"
        onClick={() => setDeleteDialog(true)}
        sx={{ width: "100%" }}
      >
        Delete Account
      </Button>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
              Are you sure you want to delete your account? This action is
              irreversible!
            </Typography>
            <TextField
              label="Confirm your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ width: 300 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              handleDeleteAccount();
              setDeleteDialog(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Settings;
