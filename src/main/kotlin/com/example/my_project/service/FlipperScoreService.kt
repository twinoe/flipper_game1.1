package com.example.my_project.service

import com.example.my_project.dto.ScoreDTO
import com.example.my_project.repository.ScoreRepository
import org.springframework.stereotype.Service

@Service
class FlipperScoreService(private val repository: ScoreRepository) {
    fun findAllScores(): List<ScoreDTO> {
        return repository.findAllByOrderByScoreDesc().map { ScoreDTO.fromEntity(it) }
    }

    fun createScore(scoreDTO: ScoreDTO): Long {
        val score = scoreDTO.toEntity()
        val created = repository.save(score)
        cleanUpScoreBoard()
        return created.id
    }

    fun cleanUpScoreBoard() {
        val scores = repository.findAllByOrderByScoreDesc()
        if (scores.size > 3) {
            repository.deleteAll(scores.drop(3))
        }
    }
}