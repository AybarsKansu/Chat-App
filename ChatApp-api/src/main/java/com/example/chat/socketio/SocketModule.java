package com.example.chat.socketio;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import com.example.chat.jwt.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class SocketModule {

    private final JwtUtil jwtUtil;

    private SocketIOServer server;

    private Map<Long, SocketIOClient> userClients = new ConcurrentHashMap<>();

    public SocketModule(JwtUtil jwtUtil, SocketIOServer server) {
        this.jwtUtil = jwtUtil;
        this.server = server;
        server.addConnectListener(onConnect());
        server.addDisconnectListener(onDisconnect());
        server.addEventListener("send_message_to_server", WSMessage.class, onReceivedMessage());
        server.addEventListener("send_delete_message", DeleteMessagePayload.class, (client, data, ackSender) -> {
            client.sendEvent("delete_message", data);
            var receiverClient = userClients.get(data.getReceiverId());
            if (receiverClient != null) {
                receiverClient.sendEvent("delete_message", data);
            }
        });
        server.addEventListener("send_delete_group_message", DeleteMessagePayload.class, (client, data, ackSender) -> {
            server.getRoomOperations(String.valueOf(data.getGroupId()))
                    .getClients().forEach(x -> x.sendEvent("delete_group_message", data));
        });
        server.addEventListener("send_edit_message", DeleteMessagePayload.class, (client, data, acksender) -> {
            client.sendEvent("edit_message", data);
            var receiverClient = userClients.get(data.getReceiverId());
            if (receiverClient != null) {
                receiverClient.sendEvent("edit_message", data);
            }
        });
        server.addEventListener("group_message", GroupMessagePayload.class, (client, data, acksender) -> {
            System.out.println(server.getRoomOperations(String.valueOf(data.getGroupId())).getClients().size());
            server.getRoomOperations(String.valueOf(data.getGroupId())).getClients().forEach(x -> {
                System.out.println("Sending group message to client: " + x.getHandshakeData().getSingleUrlParam("userId"));
            });
            server.getRoomOperations(String.valueOf(data.getGroupId())).getClients().forEach(x -> {
                if (!x.getSessionId().equals(client.getSessionId())) {
                    x.sendEvent("room_message", data);
                }
            });
        });
        server.addEventListener("read_message", ReadMessagePayload.class, (client, data, acksender) -> {
            if (data.getSenderId() != null) {
                var senderClient = userClients.get(data.getSenderId());
                if (senderClient != null)
                    senderClient.sendEvent("message_read", data);
            }
        });
    }


    private DataListener<WSMessage> onReceivedMessage() {
        return this::handleMessage;
    }

    public void handleMessage(SocketIOClient client, WSMessage data, AckRequest actSender) {
        switch (data.getType()) {
            case JOIN:
                client.joinRoom(String.valueOf(data.getRoomId()));
                client.sendEvent("join_room", "Successfully joined to room: " + data.getRoomId());
                server.getRoomOperations(String.valueOf(data.getRoomId()))
                        .getClients().forEach(x -> x.sendEvent("joined_room", data.getRoomId()));
                break;
            case LEAVE:
                client.leaveRoom(String.valueOf(data.getRoomId()));
                client.sendEvent("leave_room", "Successfully leaved from room: " + data.getRoomId());
                break;
            case SYSTEM:
                log.info(String.valueOf(data));
                break;
            case PRIVATE:
                SocketIOClient receiver = userClients.get(data.getReceiverId());
                if (receiver != null) {
                    receiver.sendEvent("private_message", data);
                } else {
                    log.warn("User with id {} not connected", data.getReceiverId());
                }
                break;
            case BROADCAST:
                server.getBroadcastOperations().sendEvent("broadcast", data.getContent());
                break;
            default:
                System.out.println("UNKNOWN TYPE");
                break;
        }
    }

    private DisconnectListener onDisconnect() {
        return (client -> {
            String userIdParam = client.getHandshakeData().getSingleUrlParam("userId");
            if (userIdParam != null) {
                try {
                    Long userId = Long.valueOf(userIdParam);
                    userClients.remove(userId);
                    log.info("Client with userId {} disconnected and removed from map.", userId);
                } catch (NumberFormatException e) {
                    log.warn("Disconnected client has no userId.");
                }
            } else {
                log.warn("user id required on disconnect attempt");
            }
        });

    }

    private ConnectListener onConnect() {
        return (client -> {
            String token = client.getHandshakeData().getSingleUrlParam("token");
            if (token == null) {
                log.warn("Token is missing");
                client.disconnect();
                return;
            }
            try {
                Long username = jwtUtil.extractUserId(token);
                Long userId = Long.valueOf(client.getHandshakeData().getSingleUrlParam("userId"));
                userClients.put(userId, client);
                log.info("Client connected: userId={}, username={}", userId, username);
            } catch (Exception e) {
                log.warn("Invalid token: {}", e.getMessage());
                client.disconnect();
            }
        });

    }
}
