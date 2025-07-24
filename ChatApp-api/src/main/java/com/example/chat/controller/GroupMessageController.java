package com.example.chat.controller;

import com.example.chat.dto.GroupDto;
import com.example.chat.dto.GroupMessageDto;
import com.example.chat.dto.ImageUploadResponse;
import com.example.chat.entity.GroupMessage;
import com.example.chat.service.AudioService;
import com.example.chat.service.FileService;
import com.example.chat.service.GroupMessageService;
import com.example.chat.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/group")
public class GroupMessageController {

    @Autowired
    private GroupMessageService groupMessageService;

    @Autowired
    private ImageService imageService;

    @Autowired
    private AudioService audioService;

    @Autowired
    private FileService fileService;

    @PostMapping("/create/user/{id}")
    public ResponseEntity<?> createGroup(@RequestBody GroupDto group, @PathVariable Long id){
        GroupDto grp = groupMessageService.createGroup(group.getGroupName(), group.getMembers(), id);
        if(grp != null){
            return ResponseEntity.ok(grp);
        } else {
            return ResponseEntity.badRequest().body("Group creation failed");
        }
    }

    @PostMapping("/{id}/messages/send")
    public ResponseEntity<?> sendGroupMessage(@RequestBody GroupMessageDto groupMessage, @PathVariable Long id){
        GroupMessageDto msg = groupMessageService.sendMessage(groupMessage.getContent(), id, groupMessage.getSender().getId());
        if(msg.getGroup() != null || msg.getSender() != null){
            return ResponseEntity.ok(msg);
        }else {
            return ResponseEntity.badRequest().body("Group message sending failed");
        }
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<?> getGroupMessages(@PathVariable Long id){
        List<GroupMessageDto> messages = groupMessageService.getGroupMessages(id);
        return ResponseEntity.ok().body(messages);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateGroup(@PathVariable Long id, @RequestBody GroupDto group){
        GroupDto updatedGroup = groupMessageService.updateGroup(id, group.getGroupName(), group.getMembers());
        if(updatedGroup != null){
            return ResponseEntity.ok((updatedGroup));
        } else {
            return ResponseEntity.badRequest().body("Error while updating group");
        }
    }

    @DeleteMapping("/delete/{id}")
    public void deleteGroup(@PathVariable Long id){
        groupMessageService.deleteGroup(id);
    }

    @DeleteMapping("/delete/message/{id}")
    public void deleteGroupMessage(@PathVariable Long id) {
        groupMessageService.deleteMessage(id);
    }

    @PutMapping("/update/message/{id}")
    public ResponseEntity<?> updateMessage(@PathVariable Long id, @RequestBody GroupMessage content){
        GroupMessageDto msg = groupMessageService.update(id, content.getContent());
        if(msg != null){
            return ResponseEntity.ok(msg);
        } else {
            return ResponseEntity.badRequest().body("Error while updating message");
        }
    }

    @PostMapping("/add/group/{groupId}/user/{userId}")
    public ResponseEntity<?> addUserToGroup(@PathVariable Long groupId, @PathVariable Long userId){
        boolean flag = groupMessageService.addUserToGroup(groupId, userId);
        if(!flag){
            return ResponseEntity.badRequest().body("Either group or user doesn't exist");
        } else {
            return ResponseEntity.ok("User eklendi");
        }
    }

    @GetMapping("/groups")
    public ResponseEntity<?> getGroups(){
        List<GroupDto> groups = groupMessageService.getGroups();
        return ResponseEntity.ok((groups));
    }

    //delete user from group
    @DeleteMapping("/delete/user/{groupId}/{userId}")
    public void deleteUserFromGroup(@PathVariable Long groupId, @PathVariable Long userId){
        groupMessageService.deleteUserFromGroup(groupId, userId);
    }

    @PostMapping(
            path = "send/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> uploadImage(
            @RequestPart("image") MultipartFile file,
            @RequestParam("receiverId") String receiverId,
            @RequestParam("senderId") String senderId
    ) {
        System.out.println("GroupMessageController.uploadImage");
        GroupMessageDto savedMessage = imageService.storeGroupMessage(file, Long.parseLong(senderId), Long.parseLong(receiverId));
        return ResponseEntity.ok(new ImageUploadResponse(savedMessage.getId(), savedMessage.getContent()));
    }

    @PostMapping(
            path = "/audio",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> uploadAudio(
            @RequestPart("audio") MultipartFile file,
            @RequestParam("senderId") String senderId,
            @RequestParam("receiverId") String receiverId
    ) {
        GroupMessageDto savedMessage = audioService.storeGroupMessage(file, Long.parseLong(senderId), Long.parseLong(receiverId));
        return ResponseEntity.ok(new ImageUploadResponse(savedMessage.getId(), savedMessage.getContent()));
    }


    @PostMapping(path = "/send/file")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("receiverId") String receiverId,
            @RequestParam("senderId") String senderId
    ) {
        GroupMessageDto savedMessage = fileService.storeGroupMessage(file, Long.parseLong(senderId), Long.parseLong(receiverId));
        return ResponseEntity.ok(new ImageUploadResponse(savedMessage.getId(), savedMessage.getContent()));
    }
}
