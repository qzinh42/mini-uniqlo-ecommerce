package Uniqlomini.controller;

import Uniqlomini.model.ChatMessage;
import Uniqlomini.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired private ChatMessageRepository chatMessageRepository;

    @GetMapping
    public List<ChatMessage> getMessages(@RequestParam Long userId) {
        return chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId);
    }

    @PostMapping
    public List<ChatMessage> sendMessage(@RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        String content = body.get("content").toString();

        ChatMessage userMsg = new ChatMessage();
        userMsg.setUserId(userId);
        userMsg.setSender("user");
        userMsg.setContent(content);
        userMsg.setCreatedAt(LocalDateTime.now());
        chatMessageRepository.save(userMsg);

        // Auto-reply đơn giản, để khung chat không bị trống trơ khi chưa có admin thật
        ChatMessage botMsg = new ChatMessage();
        botMsg.setUserId(userId);
        botMsg.setSender("bot");
        botMsg.setContent("Cảm ơn bạn đã liên hệ! Đội ngũ Mini Uniqlo sẽ phản hồi sớm nhất có thể.");
        botMsg.setCreatedAt(LocalDateTime.now());
        chatMessageRepository.save(botMsg);

        return chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId);
    }
}