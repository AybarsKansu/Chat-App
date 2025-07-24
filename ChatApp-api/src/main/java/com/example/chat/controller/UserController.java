package com.example.chat.controller;

import com.example.chat.dto.GroupDto;
import com.example.chat.dto.UserDto;
import com.example.chat.mapper.UserMapper;
import com.example.chat.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    UserService userService;

    @GetMapping("/{id}")
    public UserDto getUserById(@PathVariable Long id) {
        return UserMapper.INSTANCE.toUserDTO(userService.findById(id));
    }

    @GetMapping
    public List<UserDto> getAllUsers() {
        return UserMapper.INSTANCE.toUserDtoList(userService.findAll());
    }

    @DeleteMapping("/delete/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        UserDto user = userService.update(id, userDto);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/update-password/{id}")
    public ResponseEntity<?> updatePassword(@PathVariable Long id, @RequestBody PasswordUpdateRequest request) {
        boolean flag = userService.updatePassword(id, request.getOldPassword(), request.getNewPassword());
        if (flag)
            return ResponseEntity.ok(true);
        else
            return ResponseEntity.badRequest().body(false);
    }

    @PostMapping("/confirm-password/{id}")
    public ResponseEntity<?> confirmPassword(@PathVariable Long id, @RequestBody PasswordUpdateRequest password) {
        boolean flag = userService.confirmPassword(id, password.getOldPassword());
        if (flag)
            return ResponseEntity.ok(true);
        else
            return ResponseEntity.ok(false);
    }

    @GetMapping("/user/{id}/groups")
    public ResponseEntity<?> getUserGroups(@PathVariable Long id){
        List<GroupDto> groups = userService.getUserGroups(id);
        return ResponseEntity.ok(groups);
    }
}
