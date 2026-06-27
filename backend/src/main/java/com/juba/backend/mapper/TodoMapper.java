package com.juba.backend.mapper;

import com.juba.backend.dto.TodoCreateRequest;
import com.juba.backend.dto.TodoResponse;
import com.juba.backend.dto.TodoUpdateRequest;
import com.juba.backend.entity.Todo;

public class TodoMapper {

    // Convert Entity to Response DTO (To send back to frontend)
    public static TodoResponse toResponse(Todo todo) {
        if (todo == null) {
            return null;
        }
        return new TodoResponse(
                todo.getId(),
                todo.getTitle(),
                todo.isCompleted()
        );
    }

    // Convert Create Request DTO to Entity
    public static Todo toEntity(TodoCreateRequest request) {
        if (request == null) {
            return null;
        }
        Todo todo = new Todo();
        todo.setTitle(request.getTitle());
        todo.setCompleted(false); // New todos are always incomplete by default
        return todo;
    }

    // Update an existing Entity using the Update Request DTO
    public static void updateEntityFromDto(TodoUpdateRequest request, Todo todo) {
        if (request == null || todo == null) {
            return;
        }
        todo.setTitle(request.getTitle());
        todo.setCompleted(request.isCompleted());
    }
}