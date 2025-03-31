package com.example.my_project.dto

import com.example.my_project.model.Score
import java.util.UUID

data class ScoreDTO(
    val id: UUID,
    val name: String,
    val score: Int
) {
    fun toEntity(): Score {
        return Score(id, name, score)
    }

    companion object {
        fun fromEntity(score: Score): ScoreDTO {
            return ScoreDTO(score.id, score.name, score.score)
        }
    }
}
