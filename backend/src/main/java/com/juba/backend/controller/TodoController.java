package com.juba.backend.controller;

import com.juba.backend.dto.TodoCreateRequest;
import com.juba.backend.dto.TodoResponse;
import com.juba.backend.dto.TodoUpdateRequest;
import com.juba.backend.service.TodoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allows your frontend to call this backend without CORS errors
public class TodoController {

    private final TodoService todoService;

    // 1. CREATE (POST /api/todos)
    @PostMapping
    public ResponseEntity<TodoResponse> createTodo(@RequestBody TodoCreateRequest request) {
        TodoResponse response = todoService.createTodo(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // 2. READ ALL (GET /api/todos)
    @GetMapping
    public ResponseEntity<List<TodoResponse>> getAllTodos() {
        List<TodoResponse> todos = todoService.getAllTodos();
        return ResponseEntity.ok(todos);
    }

    // 3. READ ONE (GET /api/todos/{id})
    @GetMapping("/{id}")
    public ResponseEntity<TodoResponse> getTodoById(@PathVariable Long id) {
        TodoResponse response = todoService.getTodoById(id);
        return ResponseEntity.ok(response);
    }

    // 4. UPDATE (PUT /api/todos/{id})
    @PutMapping("/{id}")
    public ResponseEntity<TodoResponse> updateTodo(
            @PathVariable Long id,
            @RequestBody TodoUpdateRequest request) {
        TodoResponse response = todoService.updateTodo(id, request);
        return ResponseEntity.ok(response);
    }

    // 5. DELETE (DELETE /api/todos/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        todoService.deleteTodo(id);
        return ResponseEntity.noContent().build(); // Returns HTTP 204 No Content
    }
}