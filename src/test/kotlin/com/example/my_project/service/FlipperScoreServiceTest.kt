package com.example.my_project.service

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.mockk.*
import com.example.my_project.dto.ScoreDTO
import com.example.my_project.model.Score
import com.example.my_project.repository.ScoreRepository

class FlipperScoreServiceTest : DescribeSpec({

    val repository = mockk<ScoreRepository>()
    val service = FlipperScoreService(repository)
    val scoreId = 1L

    val score = Score(
        id = scoreId,
        score = 100
    )

    val scoreDTO = ScoreDTO(
        id = scoreId,
        score = 100
    )

    beforeTest {
        clearAllMocks()
    }

    describe("find all scores") {
        val scores = listOf(
            score, Score(id = 2L, score = 80)
        )

        every { repository.findAllByOrderByScoreDesc() } returns scores

        val result = service.findAllScores()

        result.size shouldBe scores.size
        result[0].id shouldBe scores[0].id
    }

    describe("create score") {
        it("should create a new score and return score Id") {
            val newScoreDTO = scoreDTO.copy(id = null)
            val newScore = score.copy(id = null)
            val savedScore = score

            every { repository.save(any()) } returns savedScore
            every { repository.findAllByOrderByScoreDesc() } returns listOf(savedScore)

            val result: Long = service.createScore(newScoreDTO)

            result shouldBe scoreId

            val scoreSlot = slot<Score>()

            verify { repository.save(capture(scoreSlot)) }

            scoreSlot.captured.score shouldBe newScore.score
        }
    }

    describe("clean up scoreboard") {
        it("should delete scores when more than 3 exist") {
            val scores = listOf(
                Score(id = 1L, score = 300),
                Score(id = 2L, score = 200),
                Score(id = 3L, score = 100),
                Score(id = 4L, score = 50)
            )

            every { repository.findAllByOrderByScoreDesc() } returns scores
            every { repository.deleteAll(any()) } just Runs

            service.cleanUpScoreBoard()

            verify { repository.deleteAll(scores.drop(3)) }
        }

        it("should not delete any scores when 3 or fewer exist") {
            val scores = listOf(
                Score(id = 1L, score = 300),
                Score(id = 2L, score = 200),
                Score(id = 3L, score = 100)
            )

            every { repository.findAllByOrderByScoreDesc() } returns scores
            every { repository.deleteAll(any()) } just Runs

            service.cleanUpScoreBoard()

            verify(exactly = 0) { repository.deleteAll(any()) }
        }
    }
})
