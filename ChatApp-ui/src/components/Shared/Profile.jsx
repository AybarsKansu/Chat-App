import React, { useState } from "react";
import {
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider,
} from "@mui/material";
import { useUser } from "../../config/UserStore";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";

function Profile() {
  const { user, setUserInfo } = useUser();
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    username: user.username,
    email: user.email,
  });
  const [changePassOpen, setChangePassOpen] = useState(false);
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const handleEditOpen = () => setEditOpen(true);
  const handleEditClose = () => setEditOpen(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const handleEditSave = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.put(
        `http://localhost:8080/api/users/update/${user.id}`,
        {
          username: editData.username,
          email: editData.email,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      setUserInfo({
        username: editData.username,
        email: editData.email,
      });
    } catch (er) {
      console.log(er);
    }
    setEditOpen(false);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleChangePassOpen = () => setChangePassOpen(true);
  const handleChangePassClose = () => setChangePassOpen(false);
  const handleChangePassSave = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      if (passwords.new === passwords.confirm) {
        const response = await axios.put(
          `http://localhost:8080/api/users/update-password/${user.id}`,
          {
            oldPassword: passwords.old,
            newPassword: passwords.new,
          },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        if (response.data) {
          showSnackbar("Password changed succesfully", "success");
          setTimeout(() => navigate("/login"), 500);
        } else {
          showSnackbar("Error while changing password", "error");
        }
      } else {
        showSnackbar("New passwords do not match", "error");
      }
    } catch (er) {
      console.log(er);
    }
    setChangePassOpen(false);
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
        textAlign: "center",
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
      <Avatar
        sx={{
          width: 96,
          height: 96,
          margin: "0 auto",
          fontSize: 40,
          bgcolor: "#1976d2",
        }}
        src={user.avatarUrl}
      >
        {user.username ? user.username[0]?.toUpperCase() : "U"}
      </Avatar>
      <Typography variant="h5" sx={{ mt: 2 }}>
        {user.username || "Kullanıcı Adı"}
      </Typography>
      <Typography color="text.secondary">
        {user.email || "E-posta adresi"}
      </Typography>
      <Divider sx={{ my: 3 }} />
      <Button variant="outlined" onClick={handleEditOpen} sx={{ mr: 2 }}>
        Edit Profile
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleChangePassOpen}
      >
        Change Password
      </Button>

      {/* Profil Düzenle Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Username"
            fullWidth
            value={editData.username}
            onChange={(e) =>
              setEditData({ ...editData, username: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="E-mail"
            fullWidth
            value={editData.email}
            onChange={(e) =>
              setEditData({ ...editData, email: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>İptal</Button>
          <Button onClick={handleEditSave} variant="contained">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Şifre Değiştir Dialog */}
      <Dialog open={changePassOpen} onClose={handleChangePassClose}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Old Password"
            type="password"
            fullWidth
            value={passwords.old}
            onChange={(e) =>
              setPasswords({ ...passwords, old: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            value={passwords.new}
            onChange={(e) =>
              setPasswords({ ...passwords, new: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords({ ...passwords, confirm: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleChangePassClose}>Cancel</Button>
          <Button onClick={handleChangePassSave} variant="contained">
            Change
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Profile;
