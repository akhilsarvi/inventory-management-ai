package com.example.inventorybackend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIController {

    @Value("${openrouter.api.key}")
    private String API_KEY;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/test")
    public String test() {
        return "API Key Status: " + (API_KEY != null ? "Connected" : "Missing");
    }

    @GetMapping("/ask")
    public String askAI(@RequestParam String question) {
        try {
            // 1. FETCH LIVE DATA FOR THE AI TO SEE
            List<Product> inventory = productRepository.findAll();
            long totalCount = inventory.size();
            
            // Create a simple list of products for the AI to read
            String inventoryList = inventory.stream()
                    .map(p -> p.getName() + " (Qty: " + p.getQuantity() + ", Price: $" + p.getPrice() + ")")
                    .collect(Collectors.joining(", "));

            // 2. THE MASTER PROMPT
            String prompt = "You are an Inventory Manager. Here is the current data:\n" +
                            "- Total Product Types: " + totalCount + "\n" +
                            "- Current Inventory: [" + inventoryList + "]\n\n" +
                            "Decide the action based on user input:\n" +
                            "1. If asking a question (how many, what is, list), use action: 'QUERY' and write the answer in 'answer'.\n" +
                            "2. If adding, deleting, or updating, use actions: 'ADD', 'DELETE', or 'UPDATE'.\n\n" +
                            "Return ONLY JSON: { \"action\": \"...\", \"name\": \"...\", \"quantity\": 0, \"price\": 0.0, \"answer\": \"...\" }\n" +
                            "User: " + question;

            // 3. CALL OPENROUTER
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://openrouter.ai/api/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + API_KEY);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestMap = new HashMap<>();
            requestMap.put("model", "openai/gpt-4o-mini");
            requestMap.put("messages", List.of(Map.of("role", "user", "content", prompt)));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestMap, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            // 4. PARSE AI RESPONSE
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            String aiContent = root.path("choices").get(0).path("message").path("content").asText();

            String jsonStr = aiContent.substring(aiContent.indexOf("{"), aiContent.lastIndexOf("}") + 1);
            JsonNode aiJson = mapper.readTree(jsonStr);

            return handleAIAction(aiJson);

        } catch (Exception e) {
            return "❌ AI Agent Error: " + e.getMessage();
        }
    }

    private String handleAIAction(JsonNode aiJson) {
        String action = aiJson.path("action").asText().toUpperCase();
        String name = aiJson.path("name").asText().toLowerCase();
        String answer = aiJson.path("answer").asText();

        switch (action) {
            case "QUERY":
                // If the AI already calculated the answer using the inventory list we gave it:
                return "🤖 " + (answer.isEmpty() ? "I found the information you requested." : answer);

            case "ADD":
                Product newP = new Product();
                newP.setName(name);
                newP.setQuantity(aiJson.path("quantity").asInt());
                newP.setPrice(aiJson.path("price").asDouble());
                productRepository.save(newP);
                return "✅ Added " + name + " to inventory.";

            case "DELETE":
                return productRepository.findByName(name)
                        .map(p -> {
                            productRepository.delete(p);
                            return "🗑️ Deleted " + name;
                        })
                        .orElse("❌ I couldn't find '" + name + "' to delete it.");

            case "UPDATE":
                return productRepository.findByName(name)
                        .map(p -> {
                            if (aiJson.has("quantity") && aiJson.path("quantity").asInt() != 0) p.setQuantity(aiJson.path("quantity").asInt());
                            if (aiJson.has("price") && aiJson.path("price").asDouble() != 0.0) p.setPrice(aiJson.path("price").asDouble());
                            productRepository.save(p);
                            return "🔄 Updated " + name + " successfully.";
                        })
                        .orElse("❌ " + name + " not found for update.");

            default:
                return "🤖 AI: " + answer;
        }
    }
}