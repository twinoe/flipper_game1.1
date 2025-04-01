package com.example.my_project.model

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.validation.constraints.Positive

@Entity
data class Score(
    @Id
    @GeneratedValue
    val id: Long,

    @field:Positive(message = "must be positive")
    val score: Int
)
