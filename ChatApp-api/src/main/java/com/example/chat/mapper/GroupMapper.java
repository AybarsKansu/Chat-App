package com.example.chat.mapper;

import com.example.chat.dto.GroupDto;
import com.example.chat.entity.Group;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(uses = {UserMapper.class})
public interface GroupMapper {
    GroupMapper INSTANCE = Mappers.getMapper(GroupMapper.class);

    GroupDto toGroupDto(Group group);

    Group toGroup(GroupDto groupDto);

    List<GroupDto> toGroupDtoList(List<Group> groupList);

    List<Group> toGroupList(List<GroupDto> groupDtoList);
}
