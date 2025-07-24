// ChatSidebar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  TextField,
  IconButton,
  Dialog,
  DialogContent,
  Button,
  Tooltip,
} from "@mui/material";
import "../../styles/ChatWindow.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ClearIcon from "@mui/icons-material/Clear";
import CreateGroup from "./CreateGroup";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useUser } from "../../config/UserStore";
import axios from "axios";

export default function ChatSidebar({
  users,
  userId,
  allUsers,
  setSearchResults,
  isSearching,
  setIsSearching,
  searchTerm,
  setSearchTerm,
  debouncedSearchTerm,
  setUsers,
  showSidebar,
  setShowSidebar,
  allGroups,
  userGroups,
  setUserGroups,
  setAllGroups,
  groupId,
  socket,
  fetchGroups,
  handleGroupNameUpdate,
  unreadMap,
}) {
  const navigate = useNavigate();
  const [plusActive, setPlusActive] = useState(false);
  const [isGroupCreate, setIsGroupCreate] = useState(false);
  const token = localStorage.getItem("token");
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState("");
  const { user } = useUser();

  const filtered = debouncedSearchTerm
    ? allUsers.filter((u) =>
        u.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    : [];

  const handleDeleteButton = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/group/delete/${groupId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      setAllGroups(
        allGroups.filter((group) => String(groupId) != String(group.id))
      );
      navigate("/");
    } catch (er) {
      console.log(er);
    }
  };

  const handleEditButton = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!text.trim()) {
      alert("Group name cannot be empty");
      return;
    }
    const group = allGroups.find((g) => g.id === groupId);
    try {
      await axios.put(
        `http://localhost:8080/api/group/update/${groupId}`,
        {
          groupName: text,
          members: null,
        },
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );

      setAllGroups((prevGroups) =>
        prevGroups.map((g) =>
          g.id === groupId ? { ...g, groupName: text } : g
        )
      );
      if (handleGroupNameUpdate) {
        handleGroupNameUpdate(groupId, text);
      }
      setIsEditing(false);
      setText("");
    } catch (er) {
      console.log(er);
    }
  };

  const handleDeleteUserFromContacts = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete?");
    if (!confirmed) return;
    setUsers(users.filter((user) => user.id !== id));
    try {
      await axios.delete(
        `http://localhost:8080/api/messages/delete/user/${user.id}-${id}`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );
    } catch (er) {
      console.log(er);
    }
  };
  return (
    <>
      <div className={`chatwindow-sidebar${showSidebar ? "" : " collapsed"}`}>
        {showSidebar && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 8,
              }}
            >
              <Tooltip title="Back">
                <IconButton
                  size="small"
                  onClick={() => setShowSidebar(false)}
                  style={{ marginRight: 4 }}
                >
                  <ArrowBackIosIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton
                size="small"
                onClick={() => {
                  if (!plusActive) {
                    setPlusActive(true);
                    setIsSearching(true);
                  } else {
                    setPlusActive(false);
                    setIsSearching(false);
                    setSearchTerm("");
                    setSearchResults([]);
                  }
                }}
                style={{ marginRight: 4 }}
              >
                {plusActive ? (
                  <Tooltip title="Cancel">
                    <ClearIcon fontSize="small" />
                  </Tooltip>
                ) : (
                  <Tooltip title="Search">
                    <AddCircleIcon fontSize="small" />
                  </Tooltip>
                )}
              </IconButton>
              <Tooltip title="Create Group">
                <IconButton
                  onClick={() => setIsGroupCreate(true)}
                  size="small"
                  style={{ marginLeft: "auto" }}
                >
                  <PersonAddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>

            <div className="chatwindow-sidebar-title">Contacts</div>
            {isSearching ? (
              <div>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  sx={{ marginBottom: 1 }}
                />
                <ul className="chatwindow-userlist">
                  {filtered.map((u) => (
                    <li
                      key={u.id}
                      className="chatwindow-user"
                      onClick={() => {
                        setUsers((prev) =>
                          prev.some((x) => x.id === u.id) ? prev : [...prev, u]
                        );
                        setIsSearching(false);
                        setPlusActive(false);
                        setSearchTerm("");
                        setSearchResults([]);
                        navigate(`/chat/${u.id}`);
                      }}
                    >
                      {u.username}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul className="chatwindow-userlist">
                {users.map((u) => (
                  <li
                    key={u.id}
                    className={
                      userId && String(userId) === String(u.id)
                        ? "chatwindow-user chatwindow-user-selected"
                        : "chatwindow-user"
                    }
                    onClick={() => navigate(`/chat/${u.id}`)}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    {u.username}
                    {unreadMap && unreadMap[u.id] && (
                      <span
                        style={{
                          marginLeft: 190,
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "#4caf50",
                          display: "inline-block",
                          border: "2px solid #fff",
                        }}
                        title="Okunmamış mesaj var"
                      ></span>
                    )}
                    {String(userId) === String(u.id) && (
                      <DeleteIcon
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteButton();
                        }}
                        style={{ marginLeft: "auto", fontSize: 18 }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div
              className="chatwindow-sidebar-section"
              style={{ marginTop: 16 }}
            >
              <div className="chatwindow-sidebar-title">Groups</div>
              {userGroups && userGroups.length > 0 ? (
                <ul className="chatwindow-userlist">
                  {userGroups.map((group, idx) => (
                    <li
                      style={{ display: "flex" }}
                      key={String(group.id) + "-" + idx}
                      className={
                        groupId && String(groupId) === String(group.id)
                          ? "chatwindow-user chatwindow-user-selected"
                          : "chatwindow-user"
                      }
                      onClick={() => navigate(`/chat/group/${group.id}`)}
                    >
                      {group.groupName}
                      {groupId && String(groupId) === String(group.id) && (
                        <>
                          <EditIcon
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditing(true);
                              setText(group.groupName);
                            }}
                            style={{ fontSize: 18, marginLeft: 135 }}
                          />
                          <DeleteIcon
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteButton();
                            }}
                            style={{ marginLeft: 10, fontSize: 18 }}
                          />
                        </>
                      )}
                    </li>
                  ))}
                  {isEditing && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: 8,
                        gap: 8,
                      }}
                    >
                      <TextField
                        size="small"
                        value={text ? text : ""}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter new group name"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleEditButton(e);
                          }
                        }}
                      />
                      <Button onClick={handleEditButton}>Save</Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </ul>
              ) : (
                <ul className="chatwindow-userlist"></ul>
              )}
            </div>
          </>
        )}
      </div>

      {!showSidebar && (
        <IconButton
          size="small"
          onClick={() => setShowSidebar(true)}
          style={{ margin: 8 }}
        >
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      )}

      <Dialog
        open={isGroupCreate}
        onClose={() => setIsGroupCreate(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent>
          <CreateGroup
            setIsGroupCreate={setIsGroupCreate}
            userId={userId}
            users={users}
            groupId={groupId}
            socket={socket}
            fetchGroups={fetchGroups}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
