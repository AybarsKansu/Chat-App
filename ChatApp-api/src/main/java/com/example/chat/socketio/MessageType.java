package com.example.chat.socketio;

public enum MessageType {
    ROOM,        // Rooma gönderilen mesaj
    JOIN,        // Kullanıcı odaya katıldı
    LEAVE,       // Kullanıcı odadan ayrıldı
    SYSTEM,      // Sistem tarafından gönderilen mesaj
    PRIVATE,     // Kullanıcıya gönderilen özel mesaj
    BROADCAST,   // Herkese iletilen genel mesaj
}
