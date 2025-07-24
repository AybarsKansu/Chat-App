package com.example.chat.service;

import com.example.chat.dto.GroupMessageDto;
import com.example.chat.dto.MessageDto;
import com.example.chat.entity.GroupMessage;
import com.example.chat.entity.Message;
import com.example.chat.mapper.GroupMessageMapper;
import com.example.chat.mapper.MessageMapper;
import com.example.chat.repository.GroupMessageRepository;
import com.example.chat.repository.GroupRepository;
import com.example.chat.repository.MessageRepository;
import com.example.chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.ZonedDateTime;
import java.util.UUID;

@Service
public class AudioService {

    private final Path rootLocation = Paths.get("uploads/audio");

    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private GroupMessageRepository groupMessageRepository;

    public MessageDto store(MultipartFile file, Long senderId, Long receiverId) {
        try {
            if (Files.notExists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }

            String filename = UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path destinationFile = rootLocation.resolve(filename).normalize().toAbsolutePath();

            try (InputStream in = file.getInputStream()) {
                Files.copy(in, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            Message message = new Message();
            message.setSender(userRepository.findById(senderId).orElseThrow());
            message.setReceiver(userRepository.findById(receiverId).orElseThrow());
            message.setContent("/audio/" + filename); // frontend src'de bu URL kullanılacak
            message.setAudio(true);
            message.setTime(ZonedDateTime.now());
            message.setIsDeleted(false);
            message.setRead(false);

            return MessageMapper.INSTANCE.toMessageDto(messageRepository.save(message));

        } catch (IOException e) {
            throw new RuntimeException("Ses dosyası yüklenemedi", e);
        }
    }

    public GroupMessageDto storeGroupMessage(MultipartFile file, Long senderId, Long receiverId) {
        try {
            if (Files.notExists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }

            String filename = UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path destinationFile = rootLocation.resolve(filename).normalize().toAbsolutePath();

            try (InputStream in = file.getInputStream()) {
                Files.copy(in, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            GroupMessage message = new GroupMessage();
            message.setSender(userRepository.findById(senderId).orElseThrow());
            message.setGroup(groupRepository.findById(receiverId).orElseThrow());
            message.setContent("/audio/" + filename); // frontend src'de bu URL kullanılacak
            message.setAudio(true);
            message.setTime(ZonedDateTime.now());
            message.setIsDeleted(false);
            message.setRead(false);

            return GroupMessageMapper.INSTANCE.toGroupMessageDto(groupMessageRepository.save(message));

        } catch (IOException e) {
            throw new RuntimeException("Ses dosyası yüklenemedi", e);
        }
    }
}

