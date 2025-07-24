package com.example.chat.socketio;

import com.example.chat.entity.Group;
import lombok.Data;

@Data
public class GroupMessagePayload {
    private Long messageId;
    private String content;
    private Long groupId;
    private Long senderId;
    private String senderName;
}
