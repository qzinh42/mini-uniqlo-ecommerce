package Uniqlomini.controller;

import Uniqlomini.model.Favorite;
import Uniqlomini.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*")
public class FavoriteController {

    @Autowired private FavoriteRepository favoriteRepository;

    @GetMapping
    public List<Favorite> getFavorites(@RequestParam Long userId) {
        return favoriteRepository.findByUserId(userId);
    }

    @PostMapping("/toggle")
    public Map<String, Boolean> toggle(@RequestBody Favorite req) {
        var existing = favoriteRepository.findByUserIdAndProductId(req.getUserId(), req.getProductId());

        if (existing.isPresent()) {
            favoriteRepository.delete(existing.get());
            return Map.of("liked", false); // đã bỏ thích
        }

        favoriteRepository.save(req);
        return Map.of("liked", true); // vừa thích
    }
}