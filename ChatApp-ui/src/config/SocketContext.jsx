// import React, { createContext, useContext, useEffect, useRef, useState } from "react";
// import { connect, sendMessage as wsSendMessage, onMessage, disconnect } from "../socket";

// const SocketContext = createContext();

// export const SocketProvider = ({ children }) => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const socketRef = useRef(null);

//   useEffect(() => {
//     socketRef.current = connect("ws://localhost:8080/ws");
//     socketRef.current.onopen = () => setIsConnected(true);
//     socketRef.current.onclose = () => setIsConnected(false);

//     onMessage((msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     return () => {
//       disconnect();
//     };
//   }, []);

//   const sendMessage = (msg) => {
//     wsSendMessage(msg);
//   };

//   // context holder
//   return (
//     <SocketContext.Provider value={{ isConnected, messages, sendMessage }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => useContext(SocketContext);