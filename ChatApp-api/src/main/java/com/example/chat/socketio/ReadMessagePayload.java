package com.example.chat.socketio;

import lombok.Data;

@Data
public class ReadMessagePayload {
    private Long messageId;
    private Long receiverId;
    private Long senderId;
}
