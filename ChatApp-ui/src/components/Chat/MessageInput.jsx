import { Button, TextField, IconButton, Tooltip } from "@mui/material";
import { useRef, useState } from "react";
import "../../styles/MessageInput.css";
import EmojiPicker from "emoji-picker-react";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import ImageIcon from "@mui/icons-material/Image";
import MicIcon from "@mui/icons-material/Mic";
import SendIcon from "@mui/icons-material/Send";
import ClearIcon from "@mui/icons-material/Clear";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import axios from "axios";

export default function MessageInput({
  onSend,
  selectedUser,
  user,
  isGroupChat,
  groupId,
}) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef();
  const fileAttachmentRef = useRef();

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const token = localStorage.getItem("token");

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend && onSend(text);
    setText("");
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; //kullanıcının seçtiği ilk dosyayı alır
    if (!file) {
      return;
    }
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("receiverId", isGroupChat ? groupId :selectedUser.id);
      formData.append("senderId", user.id);
      const response = await axios.post(
        isGroupChat
          ? `http://localhost:8080/api/group/send/image`
          : `http://localhost:8080/api/messages/image`,
        formData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      const { id, url } = response.data;
      onSend &&
        onSend({
          id,
          text: url,
          isImage: true,
          time: new Date().toISOString(),
          senderId: user.id,
          sender: user.username,
        });
      setText("");
      setShowEmojiPicker(false);
    } catch (er) {
      console.log(er);
    }
  };

  const handleFileAttachment = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("receiverId", isGroupChat ? groupId :selectedUser.id);
      formData.append("senderId", user.id);

      const response = await axios.post(
        isGroupChat
          ? `http://localhost:8080/api/group/send/file`
          : `http://localhost:8080/api/messages/file`,
        formData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      const { id, content } = response.data;
      onSend &&
        onSend({
          id,
          text: content,
          isAttachment: true,
          time: new Date().toISOString(),
          senderId: user.id,
          sender: user.username,
        });
    } catch (err) {
      console.error("Dosya gönderimi hatası:", err);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    setAudioBlob(null);
    setMediaRecorder(null);
    setIsRecording(false);
  };
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });

      // Doğrudan gönder
      sendAudioMessage(blob);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const sendAudioMessage = async (blob) => {
    const formData = new FormData();
    formData.append("audio", blob, "voiceMessage.webm");
    formData.append("receiverId", selectedUser.id);
    formData.append("senderId", user.id);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/messages/audio",
        formData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { id, content } = response.data;
      onSend &&
        onSend({
          id,
          text: content,
          isAudio: true,
          time: new Date().toISOString(),
          senderId: user.id,
          sender: user.username,
        });
    } catch (err) {
      console.error("Ses gönderimi hatası:", err);
    }
  };

  return (
    <div className="message-input-root" style={{ position: "relative" }}>
      <Tooltip title="Send Emoji">
        <IconButton
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{ marginRight: 4 }}
        >
          <EmojiEmotionsIcon />
        </IconButton>
      </Tooltip>
      {showEmojiPicker && (
        <div
          style={{ position: "absolute", bottom: 50, left: 0, zIndex: 1000 }}
        >
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      <TextField
        className="message-input-textfield"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend(e);
          }
        }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your message here"
        size="small"
      />
      {isRecording ? (
        <>
          <Tooltip title="Send audio">
            <IconButton
              onClick={() => {
                stopRecording();
                setIsRecording(false);
              }}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cancel">
            <IconButton onClick={cancelRecording}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <Tooltip title="Send Audio">
          <IconButton
            onClick={() => {
              startRecording();
              setIsRecording(true);
            }}
          >
            <MicIcon />
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title="Send Image">
        <IconButton onClick={() => fileInputRef.current.click()}>
          <ImageIcon />
        </IconButton>
      </Tooltip>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={fileAttachmentRef}
        onChange={handleFileAttachment}
        style={{ display: "none" }}
      />
      <Tooltip title="Attach File">
        <IconButton onClick={() => fileAttachmentRef.current.click()}>
          <AttachFileIcon></AttachFileIcon>
        </IconButton>
      </Tooltip>
      <Tooltip title="Send Message">
        <Button
          className="message-input-sendbtn"
          onClick={(e) => handleSend(e)}
          variant="contained"
        >
          Send
        </Button>
      </Tooltip>
    </div>
  );
}
