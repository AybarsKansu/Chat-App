import React, { useState, useMemo } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PeopleIcon from "@mui/icons-material/People";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import "../../styles/ChatHeading.css";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Autocomplete,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import useDebounce from "../../hooks/Debounce";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ChatHeading({
  username,
  groupName,
  users,
  allUsers,
  groupId,
  groupMembers,
  handleGroupNameUpdate,
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [showMembers, setShowMembers] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState(groupMembers || []);
  const token = localStorage.getItem("token");

  const handleAddMembers = async () => {
    if (!groupId) return;
    try {
      await axios.put(
        `http://localhost:8080/api/group/update/${groupId}`,
        {
          groupName: groupName,
          members: selectedUsers,
        },
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );
      if (handleGroupNameUpdate) {
        handleGroupNameUpdate(groupId, groupName, selectedUsers);
      }
      setOpen(false);
    } catch (e) {
      alert("Kullanıcı eklenemedi");
    }
  };

  const handleShowMembers = () => {
    setShowMembers(true);
  };

  const showMembersInline =
    groupMembers && groupMembers.length > 0 && groupMembers.length < 3;

  const handlePersonRemove = async (id) => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.delete(
        `http://localhost:8080/api/group/delete/user/${groupId}/${id}`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );
      setShowMembers(false);
    } catch (er) {
      console.log(er);
    }
    groupMembers.filter((user) => user.id !== id);
  };

  return (
    <div className="chatheading-root">
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <span className="chatheading-title">
          {groupName ? groupName : username}
        </span>
        {showMembersInline && (
          <span
            style={{
              fontSize: 13,
              color: "#1d3263",
              fontWeight: 400,
              marginTop: 2,
              marginLeft: 2,
              letterSpacing: 0.2,
            }}
          >
            {groupMembers.map((m) => m.username).join(", ")}
          </span>
        )}
      </div>
      {groupName && (
        <div className="chatheading-icons chatheading-icons-right">
          <PeopleIcon
            className="chatheading-icon"
            onClick={handleShowMembers}
            style={{ cursor: "pointer" }}
          />
          <GroupAddIcon
            className="chatheading-icon"
            onClick={() => setOpen(true)}
            style={{ cursor: "pointer" }}
          />
          <SettingsIcon className="chatheading-icon" />
        </div>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Group Member</DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            options={users} // options={allUsers}
            getOptionLabel={(option) => option.username}
            value={selectedUsers}
            onChange={(_, newValue) => setSelectedUsers(newValue)}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search user"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            )}
            sx={{ marginBottom: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAddMembers}
            disabled={selectedUsers.length === 0}
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showMembers}
        onClose={() => setShowMembers(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Group Members</DialogTitle>
        <DialogContent>
          {groupMembers && groupMembers.length > 0 ? (
            <List dense>
              {groupMembers.map((member) => (
                <ListItem key={member.id}>
                  <ListItemText primary={member.username} />
                  <Button>
                    <PersonRemoveIcon onClick={() => handlePersonRemove(member.id)}></PersonRemoveIcon>
                  </Button>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="textSecondary">No members</Typography>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ChatHeading;
