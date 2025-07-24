import { useState, useRef, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button, Tooltip } from "@mui/material";
import axios from "axios";
import "../../styles/Message.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import ImageShow from "../Shared/ImageShow";

export default function Message({
  id,
  sender,
  senderId,
  text,
  time,
  myId,
  selectedId,
  socketRef,
  isGroupChat,
  groupId,
  read,
  isImage,
  isAudio,
  isFile,
}) {
  const isMine = senderId === myId;
  const [showFull, setShowFull] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const [editText, setEditText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      if (!isGroupChat) {
        await axios.delete(`http://localhost:8080/api/messages/delete/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        const message = {
          username: sender,
          messageId: id,
          senderId,
          receiverId: selectedId,
        };
        socketRef.current.emit("send_delete_message", message);
      } else {
        await axios.delete(
          `http://localhost:8080/api/group/delete/message/${id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        const message = {
          username: sender,
          messageId: id,
          senderId,
          groupId,
        };
        socketRef.current.emit("send_delete_group_message", message);
      }
    } catch (er) {
      if (er.repsonse && er.response.status === 401) {
        navigate("/login");
      } else {
        console.error(er);
      }
    }
  };

  const handleEdit = async (newText) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.put(
        `http://localhost:8080/api/messages/update/${id}`,
        { content: newText },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      if (!isGroupChat) {
        const message = {
          messageId: id,
          senderId,
          receiverId: selectedId,
          content: newText,
        };
        socketRef.current.emit("send_edit_message", message);
      } else {
        const message = {
          messageId: id,
          senderId,
          groupId,
          content: newText,
        };
        socketRef.current.emit("send_edit_group_message", message);
      }
      setIsEditing(false);
    } catch (err) {
      if (er.repsonse && er.response.status === 401) {
        navigate("/login");
      } else {
        console.error(er);
      }
    }
  };

  const handleCopy = (copyText) => {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(copyText);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = copyText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  function formatTime(t) {
    if (!t) return "";
    const date = new Date(t);
    if (isNaN(date.getTime())) return t;
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className={`message-row ${isMine ? "mine" : ""}`}>
      <div className={`message-bubble ${isMine ? "mine" : "theirs"}`}>
        {/* Grup mesajlarında göndereni göster */}
        {isGroupChat && sender && (
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: "#1976d2",
              marginBottom: 2,
              marginLeft: 2,
              letterSpacing: 0.2,
            }}
          >
            {sender}
          </div>
        )}
        {isMine && (
          <div className="message-menu-btnwrap">
            <Tooltip title="Options">
              <Button
                className="message-menu-btn"
                onClick={() => setMenuOpen((v) => !v)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#888",
                  fontSize: 18,
                  padding: 0,
                  minWidth: 0,
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                <FontAwesomeIcon
                  style={{ marginLeft: 50 }}
                  icon={faEllipsisV}
                />
              </Button>
            </Tooltip>
            {menuOpen && (
              <div ref={menuRef} className="message-menu-dropdown">
                <Button
                  className="message-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    setEditText(text);
                    setIsEditing(true);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "8px 12px",
                    cursor: "pointer",
                    color: "#222",
                  }}
                >
                  <span className="message-menu-icon">✏️</span>
                  Edit
                </Button>
                <Button
                  className="message-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    handleCopy(text);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "8px 12px",
                    cursor: "pointer",
                    color: "#222",
                  }}
                >
                  <span className="message-menu-icon">📋</span>
                  Copy
                </Button>
                <Button
                  className="message-menu-item message-menu-delete"
                  onClick={() => {
                    setMenuOpen(false);
                    handleDelete();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "8px 12px",
                    cursor: "pointer",
                    color: "#d32f2f",
                  }}
                >
                  <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
                  Delete
                </Button>
              </div>
            )}
          </div>
        )}
        {!isEditing ? (
          isImage && text !== "This message has been deleted" ? (
            <Tooltip title="Show Fullscreen">
              <img
                src={
                  typeof text === "string" && text.startsWith("http")
                    ? text
                    : typeof text === "string"
                    ? `http://localhost:8080${
                        text.startsWith("/") ? "" : "/"
                      }${text}`
                    : null
                }
                alt="Sent"
                className="message-image"
                style={{
                  maxWidth: "200px",
                  borderRadius: 8,
                  display: "block",
                  cursor: "pointer",
                }}
                onClick={() => setShowFull(true)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "data:image/svg+xml;utf8,<svg width='150' height='100' xmlns='http://www.w3.org/2000/svg'><rect width='150' height='100' fill='%23eee'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='14'>Image not found</text></svg>";
                }}
              />
            </Tooltip>
          ) : isAudio && text !== "This message has been deleted" ? (
            <audio controls style={{ maxWidth: "100%" }}>
              <source
                src={
                  typeof text === "string"
                    ? `http://localhost:8080${
                        text.startsWith("/") ? "" : "/"
                      }${text}`
                    : null
                }
                type="audio/webm"
              />
              Tarayıcınız ses öğesini desteklemiyor.
            </audio>
          ) : isFile && text !== "This message has been deleted" ? (
            <div>
              <p>{text.substring(text.lastIndexOf('-') + 1)}</p>
              <a
                href={`http://localhost:8080${
                  text.startsWith("/") ? "" : "/"
                }${text}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: "underline",
                  color: "#007bff",
                }}
              >
                Download
              </a>
            </div>
          ) : (
            <span className="message-text">
              {typeof text === "string" ? text : ""}
            </span>
          )
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEdit(editText);
            }}
            style={{ width: "100%" }}
          >
            <input
              className="message-edit-input"
              type="text"
              value={editText}
              autoFocus
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleEdit(editText);
                } else if (e.key === "Escape") {
                  setIsEditing(false);
                }
              }}
              style={{
                fontSize: 15,
                width: "100%",
                borderRadius: 6,
                border: "1px solid #ccc",
                padding: "4px 8px",
                marginBottom: 4,
              }}
            />
            <Button
              className="message-edit-save"
              type="button"
              size="small"
              onClick={() => handleEdit(editText)}
              style={{
                marginRight: 8,
                fontSize: 12,
                padding: "2px 8px",
                minWidth: 0,
              }}
            >
              Kaydet
            </Button>
            <Button
              className="message-edit-cancel"
              type="button"
              size="small"
              onClick={() => setIsEditing(false)}
              style={{
                fontSize: 12,
                padding: "2px 8px",
                minWidth: 0,
              }}
            >
              Vazgeç
            </Button>
          </form>
        )}
        <span className="message-time">
          {formatTime(time)}
          {isMine && (
            <span
              style={{
                marginLeft: 8,
                fontSize: 13,
                verticalAlign: "middle",
                color: read ? "#aaa" : "#2196f3",
              }}
              title={read ? "Seen" : "send"}
            >
              {read ? "✓✓" : "✓"}
            </span>
          )}
        </span>
      </div>
      {showFull && (
        <ImageShow
          src={"http://localhost:8080" + text}
          onClose={() => {
            setShowFull(false);
          }}
        />
      )}
    </div>
  );
}
