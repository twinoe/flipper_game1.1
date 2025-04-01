package com.example.my_project.repository

import com.example.my_project.model.Score
import org.springframework.data.jpa.repository.JpaRepository

interface ScoreRepository : JpaRepository<Score, Long>{
    fun findAllByOrderByScoreDesc(): List<Score>
}