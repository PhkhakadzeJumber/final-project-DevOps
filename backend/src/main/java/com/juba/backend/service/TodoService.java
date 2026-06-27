package com.juba.backend.service;

import com.juba.backend.dto.TodoCreateRequest;
import com.juba.backend.dto.TodoResponse;
import com.juba.backend.dto.TodoUpdateRequest;
import com.juba.backend.entity.Todo;
import com.juba.backend.mapper.TodoMapper;
import com.juba.backend.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Lombok automatically injects the TodoRepository bean here
public class TodoService {

    private final TodoRepository todoRepository;

    // 1. CREATE
    public TodoResponse createTodo(TodoCreateRequest request) {
        Todo todo = TodoMapper.toEntity(request);
        Todo savedTodo = todoRepository.save(todo);
        return TodoMapper.toResponse(savedTodo);
    }

    // 2. READ ALL
    public List<TodoResponse> getAllTodos() {
        return todoRepository.findAll()
                .stream()
                .map(TodoMapper::toResponse)
                .collect(Collectors.toList());
    }

    // 3. READ ONE (Optional but good to have)
    public TodoResponse getTodoById(Long id) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo task not found with id: " + id));
        return TodoMapper.toResponse(todo);
    }

    // 4. UPDATE
    public TodoResponse updateTodo(Long id, TodoUpdateRequest request) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo task not found with id: " + id));

        // Update the database entity fields with request data
        TodoMapper.updateEntityFromDto(request, todo);

        Todo updatedTodo = todoRepository.save(todo);
        return TodoMapper.toResponse(updatedTodo);
    }

    // 5. DELETE
    public void deleteTodo(Long id) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo task not found with id: " + id));

        todoRepository.delete(todo);
    }
}