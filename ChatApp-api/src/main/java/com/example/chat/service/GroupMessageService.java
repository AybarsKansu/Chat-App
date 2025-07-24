package com.example.chat.service;

import com.example.chat.dto.GroupDto;
import com.example.chat.dto.GroupMessageDto;
import com.example.chat.dto.UserDto;
import com.example.chat.entity.Group;
import com.example.chat.entity.GroupMessage;
import com.example.chat.entity.User;
import com.example.chat.mapper.GroupMapper;
import com.example.chat.mapper.GroupMessageMapper;
import com.example.chat.mapper.UserMapper;
import com.example.chat.repository.GroupMessageRepository;
import com.example.chat.repository.GroupRepository;
import com.example.chat.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class GroupMessageService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMessageRepository groupMessageRepository;

    @Autowired
    private UserRepository userRepository;

    public GroupMessageDto sendMessage(String content, Long groupId, Long senderId) {
        GroupMessage msg = new GroupMessage();
        msg.setGroup(groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found with id: " + groupId)));
        msg.setSender(userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("User not found with id: " + senderId)));
        msg.setContent(content);
        msg.setTime(ZonedDateTime.now());
        return GroupMessageMapper.INSTANCE.toGroupMessageDto(groupMessageRepository.save(msg));
    }

    @Transactional
    public GroupDto createGroup(String groupName, List<UserDto> members, Long id) {
        Group group = new Group();
        group.setGroupName(groupName);
        List<User> memberList = members != null ? UserMapper.INSTANCE.toUserList(members) : new ArrayList<>();
        User creator = userRepository.findById(id).orElseThrow();
        memberList.add(creator);
        group.setMembers(memberList);

        return GroupMapper.INSTANCE.toGroupDto(groupRepository.save(group));
    }

    @Transactional
    public void deleteGroup(Long id) {
        groupRepository.findById(id).ifPresent(grp -> {
            grp.setIsVisible(false);
            groupRepository.save(grp);
        });
    }

    @Transactional
    public void deleteMessage(Long id) {
        groupMessageRepository.findById(id).ifPresent(x -> {
            if (x.getIsDeleted().equals(Boolean.TRUE)) {
                x.setIsVisible(Boolean.FALSE);
            } else {
                x.setIsDeleted(Boolean.TRUE);
            }
            groupMessageRepository.save(x);
        });
    }

    @Transactional
    public GroupMessageDto update(Long id, String content) {
        GroupMessage msg = groupMessageRepository.findById(id).orElse(null);
        if (msg != null) {
            msg.setContent(content);
            return GroupMessageMapper.INSTANCE.toGroupMessageDto(groupMessageRepository.save(msg));
        }
        return null;
    }

    @Transactional
    public boolean addUserToGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);

        if (user == null || group == null) {
            return false;
        } else {
            group.getMembers().add(user);
            groupRepository.save(group);
            return true;
        }
    }

    public List<GroupMessageDto> getGroupMessages(Long id) {
        return GroupMessageMapper.INSTANCE.toGroupMessageDtoList(groupMessageRepository.findByGroupId(id).stream().filter(GroupMessage::getIsVisible).toList());
    }

    public List<GroupDto> getGroups() {
        return GroupMapper.INSTANCE.toGroupDtoList(groupRepository.findAll().stream().filter(Group::getIsVisible).toList());
    }

    @Transactional
    public GroupDto updateGroup(Long id, String groupName, List<UserDto> members) {
        Group group = groupRepository.findById(id).orElse(null);
        if (group != null) {
            group.setGroupName(groupName);
            if (members != null && !members.isEmpty()) {
                List<User> existingMembers = group.getMembers();
                List<User> newMembers = UserMapper.INSTANCE.toUserList(members);

                for (User user : newMembers) {
                    if (!existingMembers.contains(user)) {
                        existingMembers.add(user);
                    }
                }

                group.setMembers(existingMembers);
            }

            return GroupMapper.INSTANCE.toGroupDto(groupRepository.save(group));
        }
        return null;
    }

    @Transactional
    public void deleteUserFromGroup(Long groupId, Long userId) {
        groupRepository.findById(groupId).ifPresent(group -> group.setMembers(group.getMembers().stream().filter(user -> !Objects.equals(userId, user.getId())).toList()));
    }
}
