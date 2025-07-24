package com.example.chat.dto;

import lombok.Data;

@Data
public class AudioUploadResponse {
    private Long id;
    private String url;

    public AudioUploadResponse(Long id, String url) {
        this.id = id;
        this.url = url;
    }

}
