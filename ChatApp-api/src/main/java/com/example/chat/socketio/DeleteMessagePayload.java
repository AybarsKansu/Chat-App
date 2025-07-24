package com.example.chat.socketio;

import lombok.Data;

@Data
public class DeleteMessagePayload {
    private String username;
    private Long messageId;
    private Long senderId;
    private Long receiverId;
    private String content;
    private Long groupId;
}
