import { io } from "socket.io-client";

export const createSocket = (token, userId) => {
  return io("http://localhost:8081", {
    query: {
      token,
      userId,
    },
    transports: ["websocket"],  
  });
};
