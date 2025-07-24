package com.example.chat.dto;

import lombok.Data;

import java.util.List;

@Data
public class GroupDto {
    private Long id;

    private String groupName;

    private List<UserDto> members;

    private Boolean isVisible = true;
}
