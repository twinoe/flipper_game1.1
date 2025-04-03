package com.example.my_project.repository

import com.example.my_project.model.Score
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class ScoreRepositoryTest : StringSpec({

    val scoreRepository = mockk<ScoreRepository>()

    val score1 = Score(id = 1L, score = 100)
    val score2 = Score(id = 2L, score = 200)
    val score3 = Score(id = 3L, score = 150)


    "should find all scores ordered by score desc" {
        // Given
        val scores = listOf(score2, score3, score1)
        every { scoreRepository.findAllByOrderByScoreDesc() } returns scores

        // When
        val result = scoreRepository.findAllByOrderByScoreDesc()

        // Then
        result.size shouldBe 3
        result[0].score shouldBe 200
        result[1].score shouldBe 150
        result[2].score shouldBe 100

        verify { scoreRepository.findAllByOrderByScoreDesc() }
    }

    "should return an empty list when no scores exist" {
        // Given
        val emptyList = emptyList<Score>()
        every { scoreRepository.findAllByOrderByScoreDesc() } returns emptyList

        // When
        val result = scoreRepository.findAllByOrderByScoreDesc()

        // Then
        result.size shouldBe 0
        verify { scoreRepository.findAllByOrderByScoreDesc() }
    }
})
