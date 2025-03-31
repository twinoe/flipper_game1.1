package com.example.my_project.controller

import com.example.my_project.dto.ScoreDTO
import com.example.my_project.service.FlipperScoreService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/scores", produces = ["application/json"])
class FlipperScoreController(private val flipperScoreService : FlipperScoreService) {

    @GetMapping()
    fun findAllScores() = ResponseEntity.ok(flipperScoreService.findAllScores())

    @PostMapping()
    fun createScore(@RequestBody scoreDTO : ScoreDTO): ResponseEntity<Void>{
        val scores = flipperScoreService.createScore(scoreDTO)
        return ResponseEntity.ok().build()
    }
    //Score Liste soll nur Top 10 z.b Anzeigen --> Automatisch im Backend aussortieren und löschen
}