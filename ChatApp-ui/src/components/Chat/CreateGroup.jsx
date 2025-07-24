import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  IconButton,
  Typography,
  Autocomplete,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { useUser } from "../../config/UserStore";

function CreateGroup({ setIsGroupCreate, users, groupId, socket, fetchGroups }) {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const { user } = useUser();
  const userId = user?.id;

  const handleCreateGroup = async (e) => {
    if (e) e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:8080/api/group/create/user/${userId}`,
        {
          groupName: groupName,
          members: selectedMembers,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      const newGroupId = response.data.id;
      // Join the creator (current user) to the group room
      const joinMessage = {
        type: "JOIN",
        roomId: newGroupId,
        senderId: userId,
        receiverId: userId,
        content: `Grup ${groupName} oluşturuldu ve siz eklendiniz.`,
      };
      socket.current.emit("send_message_to_server", joinMessage);

      selectedMembers.forEach((member) => {
        const message = {
          type: "JOIN",
          roomId: newGroupId,
          senderId: userId,
          receiverId: member.id,
          content: `Grup ${groupName} oluşturuldu ve siz eklendiniz.`,
        };
        socket.current.emit("send_message_to_server", message);
      });
      setIsGroupCreate(false);
      if (typeof fetchGroups === "function") {
        fetchGroups();
      }
      navigate(`/chat/group/${newGroupId}`);
    } catch (error) {
      console.error("Group creation failed:", error);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "2rem" }}>
      <IconButton onClick={() => setIsGroupCreate(false)} aria-label="back">
        <ArrowBackIcon />
      </IconButton>

      <Typography variant="h5" gutterBottom>
        Create Group
      </Typography>

      <form onSubmit={handleCreateGroup}>
        <TextField
          label="Group Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <Autocomplete
          multiple
          options={users}
          getOptionLabel={(option) => option.username}
          onChange={(event, newValue) => {
            setSelectedMembers(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Select Members"
              placeholder="Members"
              margin="normal"
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: "1rem" }}
        >
          Create Group
        </Button>
      </form>
    </Container>
  );
}

export default CreateGroup;
