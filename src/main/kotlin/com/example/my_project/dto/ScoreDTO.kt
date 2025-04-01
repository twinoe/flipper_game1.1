package com.example.my_project.dto

import com.example.my_project.model.Score
import java.util.UUID

data class ScoreDTO(
    val id: Long?,
    val score: Int
) {
    fun toEntity(): Score {
        return Score(id, score)
    }

    companion object {
        fun fromEntity(score: Score): ScoreDTO {
            return ScoreDTO(score.id, score.score)
        }
    }
}
