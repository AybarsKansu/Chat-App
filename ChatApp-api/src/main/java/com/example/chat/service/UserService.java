package com.example.chat.service;

import com.example.chat.dto.GroupDto;
import com.example.chat.dto.UserDto;
import com.example.chat.entity.Group;
import com.example.chat.entity.User;
import com.example.chat.mapper.GroupMapper;
import com.example.chat.mapper.UserMapper;
import com.example.chat.repository.GroupRepository;
import com.example.chat.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserDto register(String email, String username, String password){
        User usr = userRepository.findByUsername(username).orElse(null);
        if (usr != null && usr.getActive()) {
            return null;
        }
        usr = userRepository.findByEmail(email).orElse(null);
        if(usr != null && usr.getActive()){
            return null;
        }
        String hashedPassword = passwordEncoder.encode(password);
        User user = new User(email, username, password, hashedPassword);
        userRepository.save(user);
        return UserMapper.INSTANCE.toUserDTO(user);
    }

    public User login(String first, String password) {
        if(userRepository.findByUsername(first).isPresent()){
            if(userRepository.findByUsername(first).get().getPassword().equals(password))
                return userRepository.findByUsername(first).get();
            else
                return null;
        }
        else if(userRepository.findByEmail(first).isPresent()){
            if(userRepository.findByEmail(first).get().getPassword().equals(password))
                return userRepository.findByEmail(first).get();
            else
                return null;
        }
        return null;

    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    @Transactional
    public void deleteById(Long id) {
        User user = userRepository.findById(id).orElse(null);
        if(user != null && user.getActive()){
            user.setActive(false);
            user.setEmail("deleted_user_" + user.getEmail() + "+" + user.getId());
            user.setUsername("deleted_user_"  + user.getUsername() + "+" + user.getId());
        } else {
            throw new IllegalArgumentException("User not found or already inactive");
        }
    }
    @Transactional
    public UserDto update(Long id, UserDto userDto) {
        User user = userRepository.findById(id).orElseThrow();
        user.setEmail(userDto.getEmail());
        user.setUsername(userDto.getUsername());
        return UserMapper.INSTANCE.toUserDTO(user);
    }

    @Transactional
    public boolean updatePassword(Long id, String oldPassword, String newPassword) {
        try {
            User user = userRepository.findById(id).orElseThrow();
            if(user.getPassword().equals(oldPassword)){
                user.setPassword(newPassword);
                return true;
            } else {
                return false;
            }
        } catch (Exception e) {
            return false;
        }
    }

    public boolean confirmPassword(Long id, String password) {
        try {
            User user = userRepository.findById(id).orElseThrow();
            return user.getPassword().equals(password);
        } catch (Exception e) {
            return false;
        }
    }

    public List<GroupDto> getUserGroups(Long id) {
        List<Group> groups = groupRepository.findGroupsByUserId(id);
        groups = groups.stream().filter(Group::getIsVisible).collect(Collectors.toList());
        return GroupMapper.INSTANCE.toGroupDtoList(groups);
    }
}
