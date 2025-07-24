import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import { UserProvider } from "./config/UserStore";
import Settings from "./components/Shared/Settings";
import Profile from "./components/Shared/Profile";
import React, { useEffect, useState } from "react";
import CreateGroup from "./components/Chat/CreateGroup";

function App() {
  return (
    <UserProvider>
      {/* <SocketProvider> */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" />} />
          <Route path="/chat/:userId?" element={<ChatPage />} />
          <Route path="/chat/group/:groupId?" element={<ChatPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="group/create" element={<CreateGroup />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      {/* </SocketProvider> */}
    </UserProvider>
  );
}

export default App;
