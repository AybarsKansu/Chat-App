package com.example.chat.dto;

import lombok.Data;

@Data
public class GroupMessageDto {
    private Long id;
    private String content;
    private UserDto sender;
    private GroupDto group;
    private Boolean isDeleted;
    private Boolean isVisible;
    private Boolean read;
    private Boolean image;
    private Boolean file;

}
