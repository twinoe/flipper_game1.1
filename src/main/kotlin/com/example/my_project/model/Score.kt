package com.example.my_project.model

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive

@Entity
data class Score(
    @Id
    @GeneratedValue
    val id: java.util.UUID,

    @field:NotBlank(message = "must Not Be Blank")
    val name: String,

    @field:Positive(message = "must be positive")
    val score: Int
)
