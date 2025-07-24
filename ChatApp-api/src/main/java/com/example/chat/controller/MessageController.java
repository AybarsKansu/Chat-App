package com.example.chat.controller;

import com.example.chat.dto.ImageUploadResponse;
import com.example.chat.dto.MessageDto;
import com.example.chat.dto.UserDto;
import com.example.chat.mapper.MessageMapper;
import com.example.chat.mapper.UserMapper;
import com.example.chat.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private ImageService imageService;

    @Autowired
    private UserService userService;

    @Autowired
    private AudioService audioService;

    @Autowired
    private FileService fileService;

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody MessageDto message) {
        MessageDto msg = messageService.sendMessage(message.getContent(), message.getSender().getId(), message.getReceiver().getId());
        if (msg != null) {
            return ResponseEntity.ok(msg);
        } else {
            return ResponseEntity.badRequest().body("Message sending failed");
        }
    }
    @DeleteMapping("/delete/user/{userId}-{id}")
    public void deleteMessagesByUser(@PathVariable Long userId, @PathVariable Long id){
        messageService.deleteMessagesByUser(userId, id);
    }
    @GetMapping("/contacts/{id}")
    public ResponseEntity<List<UserDto>> getContacts(@PathVariable Long id) {
        List<Long> messages = messageService.getContacts(id);
        List<UserDto> contactNames = new ArrayList<>();
        for (Long index : messages) {
            UserDto user = UserMapper.INSTANCE.toUserDTO(userService.findById(index));
            contactNames.add(user);
        }
        return ResponseEntity.ok(contactNames);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteMessage(@PathVariable Long id) {
        messageService.deleteById(id);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateMessage(@PathVariable Long id, @RequestBody MessageDto messageDto) {
        return ResponseEntity.ok(MessageMapper.INSTANCE.toMessageDto(messageService.updateById(id, messageDto.getContent())));
    }

    //gönderilen id'li mesajları read = true yapar ve onlara uygun MessageReadStatus objesi oluşturur
    @PostMapping("mark/read")
    public ResponseEntity<?> markRead(@RequestBody MarkReadRequest markReadRequest){
        markReadRequest.getMessageIds().forEach(msg -> messageService.markAsRead(msg, markReadRequest.getReaderId()));
        return ResponseEntity.ok().build();
    }


    @GetMapping("/sender/{id}/receiver/{receiverId}")
    public ResponseEntity<?> getMessagesBetweenUsers(@PathVariable Long id, @PathVariable Long receiverId) {
        List<MessageDto> messages = messageService.getMessagesBetweenUsers(id, receiverId);
        if (messages.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(messages);
    }

    @PostMapping(
            path = "/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> uploadImage(
            @RequestPart("image") MultipartFile file,
            @RequestParam("receiverId") String receiverId,
            @RequestParam("senderId") String senderId
    ) {
        MessageDto savedMessage = imageService.store(file, Long.parseLong(senderId), Long.parseLong(receiverId));
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
        MessageDto savedMessage = audioService.store(file, Long.parseLong(senderId), Long.parseLong(receiverId));
        return ResponseEntity.ok(new ImageUploadResponse(savedMessage.getId(), savedMessage.getContent()));
    }


    @PostMapping(path = "/file")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("receiverId") String receiverId,
            @RequestParam("senderId") String senderId
    ) {
        MessageDto savedMessage = fileService.store(file, Long.parseLong(senderId), Long.parseLong(receiverId));
        return ResponseEntity.ok(new ImageUploadResponse(savedMessage.getId(), savedMessage.getContent()));
    }
}
