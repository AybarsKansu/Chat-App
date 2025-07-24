import Message from "./Message";
import MessageInput from "./MessageInput";
import axios from "axios";
import { useUser } from "../../config/UserStore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/ChatWindow.css";
import useSocketConnection from "../../useSocket";
import useChatSocket from "../../utils/useChatSocket";
import useDebounce from "../../hooks/Debounce";
import ChatSidebar from "./ChatSidebar";
import ChatHeading from "../Shared/ChatHeading";
import { useRef } from "react";

export default function ChatWindow() {
  const { user } = useUser();
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [messagesByUser, setMessagesByUser] = useState({});
  const navigate = useNavigate();
  const { userId, groupId } = useParams();
  const isGroupChat = !!groupId;
  const [selectedUser, setSelectedUser] = useState();
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState([]);
  const socketRef = useSocketConnection(token, user.id);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesContainerRef = useRef(null);

  const computeConversationKey = (partnerId) => {
    if (!partnerId || !user.id) return null;
    return Math.min(partnerId, user.id) + "_" + Math.max(partnerId, user.id);
  };

  // Fetch recent contacts
  const fetchUsers = async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(
        `http://localhost:8080/api/messages/contacts/${user.id}`,
        { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
      );
      if (response.data) {
        setUsers(
          response.data.map((data) => ({
            id: data.id,
            username: data.active ? data.username : "[deleted user]",
            active: data.active,
          }))
        );
      }
    } catch (er) {
      if (er.response && er.response.status === 401) {
        navigate("/login");
      } else {
        console.error(er);
      }
    }
  };
  useEffect(() => {
    if (user.id) fetchUsers();
  }, [user.id, token]);

  // Fetch all users, excluding self
  const fetchAllUsers = async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(`http://localhost:8080/api/users`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      if (response.data) {
        setAllUsers(
          response.data
            .filter((data) => data.id !== user.id)
            .map((data) => ({ id: data.id, username: data.username }))
        );
      }
    } catch (er) {
      if (er.response && er.response.status === 401) {
        navigate("/login");
      } else {
        console.error(er);
      }
    }
  };
  useEffect(() => {
    fetchAllUsers();
  }, []);
  
  const fetchGroups = async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(
        `http://localhost:8080/api/users/user/${user.id}/groups`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );
      if (response.data) {
        setAllGroups(response.data);
        const filtered = response.data.filter((group) =>
          group.members?.some((member) => member.id === user.id)
        );
        setUserGroups(filtered);
      }
    } catch (er) {
      if (er.response && er.response.status === 401) {
        navigate("/login");
      } else {
        console.error(er);
      }
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [token, user.id]);

  // Kullanıcıya ait gruplara socket ile katıl
  useEffect(() => {
    if (!socketRef.current || !user.id || !allGroups.length) return;
    allGroups.forEach((group) => {
      socketRef.current.emit("send_message_to_server", {
        type: "JOIN",
        roomId: group.id,
        senderId: user.id,
        receiverId: user.id,
        content: `Grup ${group.groupName} odasına katıldınız.`,
      });
    });
  }, [allGroups, user.id, socketRef]);

  const fetchMessages = async () => {
    if (!user.id) return;
    if (!isGroupChat && !selectedUser) return;
    if (isGroupChat && !groupId) return;
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      if (!isGroupChat) {
        const response = await axios.get(
          `http://localhost:8080/api/messages/sender/${user.id}/receiver/${selectedUser.id}`,
          { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
        );
        const convKey = computeConversationKey(selectedUser.id);
        if (Array.isArray(response.data)) {
          const mappedMessages = response.data.map((msg) => ({
            id: msg.id,
            sender: msg.sender?.username,
            senderId: msg.sender?.id,
            text: msg.content,
            time: msg.time,
            read: msg.read,
            isImage: !!msg.image,
            isFile: !!msg.file,
            isAudio: !!msg.audio,
          }));
          setMessagesByUser((prev) => ({
            ...prev,
            [convKey]: mappedMessages,
          }));
        } else {
          setMessagesByUser((prev) => ({ ...prev, [convKey]: [] }));
        }
      } else {
        const response = await axios.get(
          `http://localhost:8080/api/group/${groupId}/messages`,
          {
            headers: { Authorization: token ? `Bearer ${token}` : undefined },
          }
        );
        if (Array.isArray(response.data)) {
          setMessagesByUser((prev) => ({
            ...prev,
            [groupId]: response.data.map((msg) => ({
              id: msg.id,
              sender: msg.sender?.username || "Bilinmeyen",
              senderId: msg.sender?.id,
              text: msg.content,
              time: msg.time,
              isImage: !!msg.image,
              isFile: !!msg.file,
              isAudio: !!msg.audio,
            })),
          }));
        } else {
          setMessagesByUser((prev) => ({ ...prev, [groupId]: [] }));
        }
      }
    } catch (er) {
      if (er.response && er.response.status === 401) {
        navigate("/login");
      } else {
        console.error(er);
      }
    }
  };
  useEffect(() => {
    fetchMessages();
  }, [selectedUser, user.id, token, groupId, isGroupChat]);

  // Search with debounce, hide self
  useEffect(() => {
    if (!isSearching) {
      setSearchResults([]);
      return;
    }
    if (!debouncedSearchTerm) {
      setSearchResults([]);
      return;
    }
    const filtered = allUsers.filter((u) =>
      u.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
    setSearchResults(filtered);
  }, [debouncedSearchTerm, isSearching, allUsers]);

  // Update selectedUser on URL/user list change
  useEffect(() => {
    if (!users.length) return;
    if (userId) {
      const found = users.find((u) => String(u.id) === String(userId));
      setSelectedUser(found);
    } else {
      setSelectedUser(undefined);
    }
  }, [users, userId]);

  // Socket event handlers: private, delete, edit
  useChatSocket(
    socketRef,
    user,
    token,
    setMessagesByUser,
    computeConversationKey,
    groupId, // yeni parametre
    isGroupChat // yeni parametre
  );

  const readMessages = () => {
    let msgs = [];
    if (isGroupChat) {
      msgs = messagesByUser[groupId] || [];
    } else if (selectedUser && computeConversationKey(selectedUser.id)) {
      msgs = messagesByUser[computeConversationKey(selectedUser.id)] || [];
    }
    const unreadIds = msgs
      .filter((msg) => msg.senderId !== user.id && msg.id !== undefined)
      .map((msg) => msg.id);
    if (unreadIds.length > 0) {
      const response = axios.post(
        "http://localhost:8080/api/messages/mark/read",
        {
          messageIds: unreadIds,
          readerId: user.id,
        },
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );
      unreadIds.forEach((messageId) => {
        socketRef.current?.emit("read_message", {
          messageId,
          receiverId: user.id,
          senderId: selectedUser?.id,
        });
      });
    }
  };

  useEffect(() => {
    readMessages();
  }, [selectedUser, groupId, isGroupChat, user.id, token, socketRef]);

  const handleSendMessage = async (msg) => {
    if (!user.id) return;
    if (!isGroupChat && !selectedUser) return;
    if (isGroupChat && !groupId) return;
    // Görsel mesajı kontrol et
    if (typeof msg === "object" && msg.isImage) {
      // Görsel mesajı
      try {
        if (!token) {
          navigate("/login");
          return;
        }
        if (!isGroupChat) {
          const convKey = computeConversationKey(selectedUser.id);
          const time = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          setMessagesByUser((prev) => ({
            ...prev,
            [convKey]: [
              ...(prev[convKey] || []),
              {
                id: msg.id,
                sender: user.username,
                senderId: user.id,
                text: msg.text,
                time,
                isImage: !!msg.image,
                isFile: !!msg.file,
                isAudio: !!msg.audio,
              },
            ],
          }));
          socketRef.current.emit("send_message_to_server", {
            type: "PRIVATE",
            messageId: msg.id,
            content: msg.text,
            senderId: user.id,
            receiverId: selectedUser.id,
            time,
            isImage: true,
            isFile,
            isAudio,
          });
        } else {
          const time = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          setMessagesByUser((prev) => ({
            ...prev,
            [groupId]: [
              ...(prev[groupId] || []),
              {
                id: msg.id || Date.now(),
                sender: user.username,
                senderId: user.id,
                text: msg.text,
                time,
                isImage: true,
              },
            ],
          }));
          socketRef.current.emit("group_message", {
            messageId: msg.id,
            content: msg.text,
            senderId: user.id,
            groupId: groupId,
            senderName: user.username,
          });
        }
      } catch (er) {
        if (er.response && er.response.status === 401) {
          navigate("/login");
        } else {
          console.error(er);
        }
      }
      return;
    }
    if (typeof msg === "object" && msg.isFile) {
      try {
        const time = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        if (!isGroupChat) {
          const convKey = computeConversationKey(selectedUser.id);
          setMessagesByUser((prev) => ({
            ...prev,
            [convKey]: [
              ...(prev[convKey] || []),
              {
                id: msg.id,
                sender: user.username,
                senderId: user.id,
                text: msg.text,
                time,
                isFile: true,
              },
            ],
          }));

          socketRef.current.emit("send_message_to_server", {
            type: "PRIVATE",
            messageId: msg.id,
            content: msg.text,
            senderId: user.id,
            receiverId: selectedUser.id,
            time,
          });
        } else {
          setMessagesByUser((prev) => ({
            ...prev,
            [groupId]: [
              ...(prev[groupId] || []),
              {
                id: msg.id || Date.now(),
                sender: user.username,
                senderId: user.id,
                text: msg.text,
                time,
                isImage: true,
              },
            ],
          }));
          socketRef.current.emit("group_message", {
            messageId: msg.id,
            content: msg.text,
            senderId: user.id,
            groupId: groupId,
            senderName: user.username,
          });
        }
      } catch (err) {
        console.error("Ses mesajı gönderilirken hata:", err);
      }
      return;
    }
    if (typeof msg === "object" && msg.isAudio) {
      try {
        const time = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        if (!isGroupChat) {
          const convKey = computeConversationKey(selectedUser.id);
          setMessagesByUser((prev) => ({
            ...prev,
            [groupId]: [
              ...(prev[groupId] || []),
              {
                id: msg.id,
                sender: user.username,
                senderId: user.id,
                text: msg.text,
                time,
                isImage: true,
              },
            ],
          }));
          socketRef.current.emit("group_message", {
            messageId: msg.id,
            content: msg.text,
            senderId: user.id,
            groupId: groupId,
            senderName: user.username,
          });
        }
      } catch (err) {
        console.error("Dosya gönderilirken hata:", err);
      }
      return;
    }
    // if (typeof msg === "object" && msg.isAudio) {
    //   try {
    //     const time = new Date().toLocaleTimeString([], {
    //       hour: "2-digit",
    //       minute: "2-digit",
    //     });

    //     if (!isGroupChat) {
    //       const convKey = computeConversationKey(selectedUser.id);
    //       setMessagesByUser((prev) => ({
    //         ...prev,
    //         [convKey]: [
    //           ...(prev[convKey] || []),
    //           {
    //             id: msg.id || Date.now(),
    //             sender: user.username,
    //             senderId: user.id,
    //             text: msg.text,
    //             time,
    //             isAudio: true,
    //           },
    //         ],
    //       }));

    //       socketRef.current.emit("send_message_to_server", {
    //         type: "PRIVATE",
    //         messageId: msg.id,
    //         content: msg.text,
    //         senderId: user.id,
    //         receiverId: selectedUser.id,
    //         time,
    //         isAudio: true,
    //       });
    //     }
    //   } catch (err) {
    //     console.error("Ses mesajı gönderilirken hata:", err);
    //   }
    //   return;
    // }
    if (!String(msg).startsWith("http://")) {
      if (!isGroupChat) {
        if (!selectedUser) return;
        try {
          if (!token) {
            navigate("/login");
            return;
          }

          const response = await axios.post(
            `http://localhost:8080/api/messages/send`,
            {
              content: msg,
              sender: { id: user.id },
              receiver: { id: selectedUser.id },
            },
            {
              headers: { Authorization: token ? `Bearer ${token}` : undefined },
            }
          );
          const convKey = computeConversationKey(selectedUser.id);
          const time = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          setMessagesByUser((prev) => ({
            ...prev,
            [convKey]: [
              ...(prev[convKey] || []),
              {
                id: response.data.id,
                sender: user.username,
                senderId: user.id,
                text: msg,
                time,
              },
            ],
          }));
          socketRef.current.emit("send_message_to_server", {
            type: "PRIVATE",
            messageId: response.data.id.id,
            content: msg,
            senderId: user.id,
            receiverId: selectedUser.id,
            time,
            read: response.data.read,
          });
        } catch (er) {
          if (er.response && er.response.status === 401) {
            navigate("/login");
          } else {
            console.error(er);
          }
        }
      } else {
        try {
          //Grup mesajı buraya geliyor ilk
          if (!token) {
            navigate("/login");
            return;
          }
          const response = await axios.post(
            `http://localhost:8080/api/group/${groupId}/messages/send`,
            {
              content: msg,
              sender: {
                id: user.id,
              },
              isDeleted: false,
            },
            {
              headers: { Authorization: token ? `Bearer ${token}` : undefined },
            }
          );
          const time = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          setMessagesByUser((prev) => ({
            ...prev,
            [groupId]: [
              ...(prev[groupId] || []),
              {
                id: response.data.id,
                sender: user.username,
                senderId: user.id,
                text: msg,
                time,
              },
            ],
          }));
          socketRef.current.emit("group_message", {
            messageId: response.data.id,
            content: msg,
            senderId: user.id,
            groupId: groupId,
            senderName: user.username,
          });
        } catch (er) {
          if (er.response && er.response.status === 401) {
            navigate("/login");
          } else {
            console.error(er);
          }
        }
      }
    }
  };

  const conversationKey =
    selectedUser && user.id ? computeConversationKey(selectedUser.id) : null;

  // Mesajlar yüklendiğinde scroll'u en alta kaydıran fonksiyon
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Mesajlar veya kullanıcı/grup değiştiğinde en alta kaydır
  useEffect(() => {
    scrollToBottom();
  }, [selectedUser, groupId, messagesByUser, isGroupChat]);

  // Grup adı veya kullanıcı adı belirle
  const currentGroup = isGroupChat
    ? allGroups.find((g) => String(g.id) === String(groupId))
    : null;
  const chatHeadingUsername =
    !isGroupChat && selectedUser ? selectedUser.username.toUpperCase() : "";
  const chatHeadingGroupName =
    isGroupChat && currentGroup ? currentGroup.groupName : "";
  const chatHeadingGroupMembers =
    isGroupChat && currentGroup && currentGroup.members
      ? currentGroup.members
      : [];

  // Grup adı ve üyeleri güncelleme fonksiyonu
  const handleGroupNameUpdate = (groupId, newName, newMembers) => {
    setAllGroups((prevGroups) =>
      prevGroups.map((g) =>
        String(g.id) === String(groupId)
          ? {
              ...g,
              groupName: newName !== undefined ? newName : g.groupName,
              members: newMembers !== undefined ? newMembers : g.members,
            }
          : g
      )
    );
  };

  return (
    <div className="chatwindow-root" style={{ position: "relative" }}>
      <ChatSidebar
        users={users}
        userId={selectedUser?.id}
        allUsers={allUsers}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        isSearching={isSearching}
        setIsSearching={setIsSearching}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        debouncedSearchTerm={debouncedSearchTerm}
        user={user}
        setUsers={setUsers}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        allGroups={allGroups}
        userGroups={userGroups}
        setAllGroups={setAllGroups}
        setUserGroups={setUserGroups}
        groupId={groupId}
        socket={socketRef}
        fetchGroups={fetchGroups}
        handleGroupNameUpdate={handleGroupNameUpdate}
        // Yeni prop: okunmamış mesajlar
        unreadMap={Object.fromEntries(
          users.map((u) => {
            const convKey = computeConversationKey(u.id);
            const unread = (messagesByUser[convKey] || []).some(
              (msg) => msg.senderId === u.id && !msg.read
            );
            return [u.id, unread];
          })
        )}
      />
      <div className="chatwindow-main">
        {(selectedUser || groupId) && (
          <ChatHeading
            username={chatHeadingUsername}
            groupName={chatHeadingGroupName}
            users={users}
            allUsers={allUsers}
            groupId={groupId}
            groupMembers={chatHeadingGroupMembers}
            handleGroupNameUpdate={handleGroupNameUpdate}
          />
        )}
        <div
          className="chatwindow-messages fade-in"
          ref={messagesContainerRef}
          style={{ overflowY: "auto", flexGrow: 1 }}
        >
          {isGroupChat
            ? messagesByUser[groupId]
              ? messagesByUser[groupId].map((msg, i) => (
                  <Message
                    key={i}
                    id={msg.id}
                    sender={msg.sender}
                    senderId={msg.senderId}
                    text={
                      msg.isDeleted ? "this message has been deleted" : msg.text
                    }
                    time={msg.time}
                    myId={user.id}
                    socketRef={socketRef}
                    isGroupChat={isGroupChat}
                    groupId={groupId}
                    read={!!msg.read}
                    isImage={!!msg.isImage}
                    isAudio={!!msg.isAudio}
                    isFile={!!msg.isFile}
                    isDeleted={!!msg.isDeleted}
                  />
                ))
              : []
            : selectedUser &&
              computeConversationKey(selectedUser.id) &&
              messagesByUser[computeConversationKey(selectedUser.id)]
            ? messagesByUser[computeConversationKey(selectedUser.id)].map(
                (msg, i) => (
                  <Message
                    key={i}
                    id={msg.id}
                    sender={msg.sender}
                    senderId={msg.senderId}
                    text={
                      msg.isDeleted ? "this message has been deleted" : msg.text
                    }
                    time={msg.time}
                    myId={user.id}
                    selectedId={selectedUser.id}
                    socketRef={socketRef}
                    read={!!msg.read}
                    isImage={!!msg.isImage}
                    isAudio={!!msg.isAudio}
                    isFile={!!msg.isFile}
                    isDeleted={!!msg.isDeleted}
                  />
                )
              )
            : []}
        </div>

        <div className="chatwindow-inputarea">
          <MessageInput
            onSend={handleSendMessage}
            selectedUser={selectedUser}
            user={user}
            isGroupChat={isGroupChat}
            groupId={groupId}
          />
        </div>
      </div>
    </div>
  );
}
