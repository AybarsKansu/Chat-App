package com.example.chat.controller;

import lombok.Data;

import java.util.List;

@Data
public class MarkReadRequest {
    private List<Long> messageIds;
    private Long readerId;
}
