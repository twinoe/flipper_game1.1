package com.example.my_project.dto

import com.example.my_project.model.Score
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe

class ScoreDTOTest : StringSpec ({

    "Create an score DTO" {
        val scoreDTO = ScoreDTO(
            id = 1L,
            score = 5
        )
        scoreDTO shouldNotBe null
    }

    "should convert from entity to DTO"{
        val score = Score(
            id = 1L,
            score = 5
        )

        val dto = ScoreDTO.fromEntity(score)

        dto.id shouldBe 1L
        dto.score shouldBe 5
    }

    "should convert from DTO to Entity"{
        val scoreDTO = ScoreDTO(
            id = 1L,
            score = 5
        )

        val score = scoreDTO.toEntity()

        score.id shouldBe 1L
        score.score shouldBe 5
    }
})