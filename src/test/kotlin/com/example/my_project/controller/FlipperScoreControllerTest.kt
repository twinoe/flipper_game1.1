package com.example.my_project.controller

import com.example.my_project.dto.ScoreDTO
import com.example.my_project.service.FlipperScoreService
import com.fasterxml.jackson.databind.ObjectMapper
import io.kotest.core.spec.style.DescribeSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.bind.annotation.ControllerAdvice

class FlipperScoreControllerTest : DescribeSpec({

    lateinit var mockMvc: MockMvc
    val mapper = ObjectMapper()
    val flipperScoreService = mockk<FlipperScoreService>()
    val flipperScoreController = FlipperScoreController(flipperScoreService)
    val scoreId = 1L
    val scoreDTO = ScoreDTO(
        id = scoreId,
        score = 20
    )

    beforeContainer {
        clearAllMocks()
        mockMvc = MockMvcBuilders.standaloneSetup(flipperScoreController)
            .setControllerAdvice(GlobalExceptionHandler())
            .build()
    }

    describe("FlipperScoreController") {
        it("should get all scores") {
            val scores = listOf(
                scoreDTO,
                ScoreDTO(id = 2L, score = 2)
            )
            every { flipperScoreService.findAllScores() } returns scores

            mockMvc.perform(MockMvcRequestBuilders.get("/api/v1/scores"))
                .andExpect(status().isOk)
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[0].id").value(scoreDTO.id))
                .andExpect(jsonPath("$.[0].score").value(scoreDTO.score))
                .andExpect(jsonPath("$.[1].id").value(2L))
                .andExpect(jsonPath("$.[1].score").value(2))

            verify(exactly = 1) { flipperScoreService.findAllScores() }
        }
        it("should create a score") {
            val newScoreDTO = scoreDTO.copy(id = null)
            every { flipperScoreService.createScore(newScoreDTO) } returns scoreId

            mockMvc.perform(
                post("/api/v1/scores")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(newScoreDTO))
            )
                .andExpect(status().isCreated)
                .andExpect(header().string("Location", "/api/v1/scores/$scoreId"))

            verify(exactly = 1) { flipperScoreService.createScore(newScoreDTO) }
        }

    }
})

@ControllerAdvice
class GlobalExceptionHandler {
    @org.springframework.web.bind.annotation.ExceptionHandler(NoSuchElementException::class)
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.NOT_FOUND)
    fun handleException(exception: NoSuchElementException): Map<String, String> {
        return mapOf("error" to (exception.message ?: "Resource not found"))
    }
}
//
