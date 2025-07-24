// import React, { useEffect, useState, useRef } from "react";
// import { createSocket } from "./socket";

// const ChatRoom = ({ token, userId, roomId }) => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const socketRef = useRef(null);

//   useEffect(() => {
//     const socket = createSocket(token, userId);
//     socketRef.current = socket;

//     socket.on("connect", () => {
//       console.log("Connected to socket server");

//       socket.emit("send_message_to_server", {
//         type: "JOIN",
//         room: roomId,
//       });
//     });

//     socket.on("join_room", (msg) => {
//       console.log(msg);
//     });

//     socket.on("room_message", (msg) => {
//       setMessages((prev) => [...prev, { content: msg, sender: "other" }]);
//     });

//     return () => {
//       socket.emit("send_message_to_server", {
//         type: "LEAVE",
//         room: roomId,
//       });
//       socket.disconnect();
//     };
//   }, [token, userId, roomId]);

//   const sendMessage = () => {
//     if (input.trim() !== "") {
//       socketRef.current.emit("send_message_to_server", {
//         type: "ROOM",
//         content: input,
//         room: roomId,
//         senderId: userId,
//       });
//       setMessages((prev) => [...prev, { content: input, sender: "me" }]);
//       setInput("");
//     }
//   };

//   return (
//     <div>
//       <h2>Room: {roomId}</h2>
//       <div style={{ border: "1px solid gray", padding: 10, height: 300, overflowY: "scroll" }}>
//         {messages.map((msg, i) => (
//           <div key={i} style={{ textAlign: msg.sender === "me" ? "right" : "left" }}>
//             {msg.content}
//           </div>
//         ))}
//       </div>
//       <input
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//       />
//       <button onClick={sendMessage}>Send</button>
//     </div>
//   );
// };

// export default ChatRoom;
