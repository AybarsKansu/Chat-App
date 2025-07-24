package com.example.chat.socketio;

import lombok.Data;

@Data
public class WSMessage {
    private Long messageId;
    private MessageType type;
    private String content;
    private Long roomId;
    private Long senderId;
    private Long receiverId;
    private Boolean read;
}
