package com.juba.backend.repository;

import com.juba.backend.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    // JpaRepository automatically gives you save(), findAll(), findById(), deleteById() for free!
}