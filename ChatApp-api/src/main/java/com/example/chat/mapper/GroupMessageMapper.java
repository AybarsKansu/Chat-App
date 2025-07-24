package com.example.chat.mapper;

import com.example.chat.dto.GroupMessageDto;
import com.example.chat.entity.GroupMessage;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(uses = {UserMapper.class, GroupMapper.class})
public interface GroupMessageMapper {
    GroupMessageMapper INSTANCE = Mappers.getMapper(GroupMessageMapper.class);

    GroupMessageDto toGroupMessageDto(GroupMessage msg);
    GroupMessage toGroupMessage(GroupMessageDto msg);
    List<GroupMessageDto> toGroupMessageDtoList(List<GroupMessage> messages);
}
