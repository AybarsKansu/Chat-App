package com.example.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private String content;
    private ZonedDateTime time = ZonedDateTime.now(ZoneOffset.UTC);
    private UserDto sender;
    private UserDto receiver;
    private Boolean isDeleted;
    private Boolean isVisible;
    private Boolean read;
    private Boolean image;
    private Boolean file;
    private String encryptedContent;
}
