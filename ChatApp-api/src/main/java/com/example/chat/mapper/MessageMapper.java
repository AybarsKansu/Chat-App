package com.example.chat.mapper;

import com.example.chat.dto.MessageDto;
import com.example.chat.entity.Message;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface MessageMapper {
    MessageMapper INSTANCE = Mappers.getMapper(MessageMapper.class);

    // entity to dto
    @Mapping(source = "isDeleted", target = "isDeleted")
    MessageDto toMessageDto(Message message);

    // dto to entity
    @Mapping(source = "isDeleted", target = "isDeleted")
    Message toMessage(MessageDto userResponseDto);

    List<MessageDto> toMessageDtoList(List<Message> allMessages);
}
