import { useEffect } from "react";
import axios from "axios";

export default function useChatSocket(
  socketRef,
  user,
  token,
  setMessagesByUser,
  computeConversationKey
) {
  useEffect(() => {
    if (!socketRef.current || !user.id) return;

    const fetchMessagesFor = async (partnerId) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/messages/sender/${user.id}/receiver/${partnerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const convKey = computeConversationKey(partnerId);
        setMessagesByUser((prev) => ({
          ...prev,
          [convKey]: Array.isArray(response.data)
            ? response.data.map((msg) => ({
                id: msg.id,
                sender: msg.sender?.username || "Bilinmeyen",
                senderId: msg.sender?.id,
                text: msg.content,
                time: msg.time,
              }))
            : [],
        }));
      } catch (e) {
        console.error(e);
      }
    };

    const handlePrivateMessage = (data) => {
      const {
        senderId,
        receiverId,
        messageId,
        content,
        time: incomingTime,
        senderUsername,
        read,
      } = data;
      const partnerId = senderId === user.id ? receiverId : senderId;
      const convKey = computeConversationKey(partnerId);
      const timeStamp = incomingTime || new Date().toISOString();
      setMessagesByUser((prev) => ({
        ...prev,
        [convKey]: [
          ...(prev[convKey] || []),
          {
            id: messageId,
            sender: senderId === user.id ? "Sen" : senderUsername,
            senderId,
            text: content,
            time: timeStamp,
          },
        ],
      }));
    };

    const handleDeleteMessage = (data) => {
      const { senderId, receiverId, messageId } = data;
      const partnerId = senderId === user.id ? receiverId : senderId;
      const convKey = computeConversationKey(partnerId);
      setMessagesByUser((prev) => {
        const prevMsgs = prev[convKey] || [];
        const updatedMsgs = prevMsgs
          .map((msg) => {
            if (String(msg.id) === String(messageId)) {
              if (msg.isDeleted) {
                return null;
              }
              return {
                ...msg,
                text: "This message has been deleted",
                isDeleted: true,
              };
            }
            return msg;
          })
          .filter((msg) => msg !== null);

        return {
          ...prev,
          [convKey]: updatedMsgs,
        };
      });
    };

    const handleDeleteGroupMessage = (data) => {
      const { senderId, groupId, messageId, type } = data;
      const convKey = groupId;

      setMessagesByUser((prev) => {
        const prevMsgs = prev[convKey] || [];
        const updatedMsgs = prevMsgs
          .map((msg) => {
            if (String(msg.id) === String(messageId)) {
              if (type === "hard") {
                return null; // tamamen sil
              }
              if (msg.isDeleted) {
                return null;
              }
              return {
                ...msg,
                text: "This message has been deleted",
                isDeleted: true,
              };
            }
            return msg;
          })
          .filter((msg) => msg !== null);

        return {
          ...prev,
          [convKey]: updatedMsgs,
        };
      });
    };

    const handleEditMessage = (data) => {
      const { senderId, receiverId, messageId, content } = data;
      const partnerId = senderId === user.id ? receiverId : senderId;
      const convKey = computeConversationKey(partnerId);
      setMessagesByUser((prev) => ({
        ...prev,
        [convKey]: (prev[convKey] || []).map((msg) =>
          String(msg.id) === String(messageId) ? { ...msg, text: content } : msg
        ),
      }));
      fetchMessagesFor(partnerId);
    };

    const handleRoomMessage = (data) => {
      const { messageId, content, groupId, senderId, senderName } = data;
      if (senderId === user.id) return;
      setMessagesByUser((prev) => ({
        ...prev,
        [groupId]: [
          ...(prev[groupId] || []),
          {
            id: messageId,
            sender: senderName,
            senderId,
            text: content,
            time: new Date().toISOString(),
          },
        ],
      }));
    };

    const handleReadMessage = (data) => {
      const { messageId, receiverId, senderId } = data;
      if (!messageId || !receiverId || senderId !== user.id) return;
      setMessagesByUser((prev) => {
        const updated = {};
        for (const key in prev) {
          updated[key] = prev[key].map((msg) =>
            String(msg.id) === String(messageId) ? { ...msg, read: true } : msg
          );
        }
        return { ...prev, ...updated };
      });
    };

    socketRef.current.on("private_message", handlePrivateMessage);
    socketRef.current.on("delete_message", handleDeleteMessage);
    socketRef.current.on("edit_message", handleEditMessage);
    socketRef.current.on("delete_group_message", handleDeleteGroupMessage);
    socketRef.current.on("room_message", handleRoomMessage);
    socketRef.current.on("message_read", handleReadMessage);

    return () => {
      socketRef.current.off("private_message", handlePrivateMessage);
      socketRef.current.off("delete_message", handleDeleteMessage);
      socketRef.current.off("edit_message", handleEditMessage);
      socketRef.current.off("delete_group_message", handleDeleteGroupMessage);
      socketRef.current.off("room_message", handleRoomMessage);
      socketRef.current.off("message_read", handleReadMessage);
    };
  }, [user.id, socketRef, token]);
}
