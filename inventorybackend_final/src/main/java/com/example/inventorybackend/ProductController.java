package com.example.inventorybackend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductRepository repository;

    // GET all products
    @GetMapping
    public List<Product> getAll() {
        return repository.findAll();
    }

    // GET single product by id
    @GetMapping("/{id}")
    public Product getById(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    // POST - add new product
    @PostMapping
    public Product create(@RequestBody Product product) {
        return repository.save(product);
    }

    // PUT - update existing product
    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product product) {
        product.setId(id);
        return repository.save(product);
    }

    // DELETE - remove product
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
    

    

   
}