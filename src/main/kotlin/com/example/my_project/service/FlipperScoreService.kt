package com.example.my_project.service

import com.example.my_project.dto.ScoreDTO
import com.example.my_project.model.Score
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class FlipperScoreService(private val repository: ScoreRepository) {
    fun findAllScores(): List<ScoreDTO> {
        return repository.findAll().map { ScoreDTO.fromEntity(it) }
    }

    fun createScore(scoreDTO: ScoreDTO): Score {
        val score = scoreDTO.toEntity()
        val created = repository.save(score)
        return score
    }
}