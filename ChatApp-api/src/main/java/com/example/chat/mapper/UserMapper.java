package com.example.chat.mapper;

import com.example.chat.dto.UserDto;
import com.example.chat.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    // entity to dto
    UserDto toUserDTO(User user);

    // dto to entity
    User toUser(UserDto userResponseDto);

    // list of entities to list of dto
    List<UserDto> toUserDtoList(List<User> userList);

    List<User> toUserList(List<UserDto> userDtoList);
}
