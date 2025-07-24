package com.example.chat.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;

@Entity
@Data
@Table(name = "chat_message_table")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String content;
    private ZonedDateTime time = ZonedDateTime.now(ZoneOffset.UTC);
    @ManyToOne
    @ToString.Exclude
    @JoinColumn(name = "sender_id", nullable = false)
    @JsonIgnore
    private User sender;
    @ManyToOne
    @ToString.Exclude
    @JoinColumn(name = "receiver_id", nullable = false)
    @JsonIgnore
    private User receiver;
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible = true;
    @Column(name = "read_status", nullable = false)
    private Boolean read = false;
    @Column(name = "image", nullable = true)
    private Boolean image = false;
    @Column(name = "file", nullable = true)
    private Boolean file = false;
    @Column(name = "audio", nullable = true)
    private Boolean audio = false;
    @Column(name = "encrypted_content", nullable = true)
    private String encryptedContent;
}