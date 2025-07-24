
import { useEffect, useRef } from "react";
import { createSocket } from "./socket";

export default function useSocketConnection(token, userId) {
  const socketRef = useRef(null);
useEffect(() => {
  if (socketRef.current) {
    socketRef.current.disconnect();
  }
  socketRef.current = createSocket(token, userId);

  return () => {
    if (socketRef.current) socketRef.current.disconnect();
  };
}, [token, userId]);


  return socketRef;
}